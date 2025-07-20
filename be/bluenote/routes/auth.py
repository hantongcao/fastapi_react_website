from datetime import timedelta
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import select, SQLModel
from sqlalchemy.exc import IntegrityError

from bluenote.schemas.users import (
    User, UserCreate, UserUpdate, UserPublic, UsersPublic, UpdatePassword
)
from bluenote.schemas.common import ListParams
from bluenote.server.deps import SessionDep, ListParamsDep
from bluenote.security import (
    get_secret_hash, verify_hashed_secret, JWTManager, generate_secure_password
)
from bluenote.config.config import settings

# 创建路由器
router = APIRouter(prefix="/auth", tags=["Authentication"])

# JWT管理器
jwt_config = settings.get_jwt_config()
jwt_manager = JWTManager(
    secret_key=jwt_config["secret_key"],
    algorithm=jwt_config["algorithm"],
    expires_delta=timedelta(minutes=jwt_config["expire_minutes"])
)

# HTTP Bearer认证
security = HTTPBearer()


async def get_current_user(
    session: SessionDep,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> User:
    """获取当前认证用户"""
    try:
        payload = jwt_manager.decode_jwt_token(credentials.credentials)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    statement = select(User).where(User.username == username, User.deleted_at.is_(None))
    result = await session.exec(statement)
    user = result.first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, session: SessionDep):
    """用户注册"""
    # 检查用户名是否已存在
    statement = select(User).where(User.username == user_data.username, User.deleted_at.is_(None))
    result = await session.exec(statement)
    existing_user = result.first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # 创建新用户
    hashed_password = get_secret_hash(user_data.password)
    user_dict = user_data.model_dump(exclude={"password"})
    user = User(**user_dict, hashed_password=hashed_password)
    
    try:
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )


class LoginRequest(SQLModel):
    username: str
    password: str


@router.post("/login")
async def login(login_data: LoginRequest, session: SessionDep):
    """用户登录"""
    # 查找用户
    statement = select(User).where(User.username == login_data.username, User.deleted_at.is_(None))
    result = await session.exec(statement)
    user = result.first()
    
    if not user or not verify_hashed_secret(user.hashed_password, login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 生成JWT token
    access_token = jwt_manager.create_jwt_token(user.username)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserPublic.model_validate(user)
    }


@router.get("/me", response_model=UserPublic)
async def get_current_user_info(current_user: CurrentUserDep):
    """获取当前用户信息"""
    return current_user


@router.put("/me", response_model=UserPublic)
async def update_current_user(
    user_update: UserUpdate,
    current_user: CurrentUserDep,
    session: SessionDep
):
    """更新当前用户信息"""
    # 如果要更新用户名，检查是否已存在
    if user_update.username != current_user.username:
        statement = select(User).where(
            User.username == user_update.username,
            User.id != current_user.id,
            User.deleted_at.is_(None)
        )
        result = await session.exec(statement)
        existing_user = result.first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
    
    # 更新用户信息
    update_data = user_update.model_dump(exclude_unset=True, exclude={"password"})
    
    # 如果包含密码更新
    if user_update.password:
        update_data["hashed_password"] = get_secret_hash(user_update.password)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    try:
        session.add(current_user)
        await session.commit()
        await session.refresh(current_user)
        return current_user
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed"
        )


@router.put("/me/password")
async def change_password(
    password_data: UpdatePassword,
    current_user: CurrentUserDep,
    session: SessionDep
):
    """修改密码"""
    # 验证当前密码
    if not verify_hashed_secret(current_user.hashed_password, password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # 更新密码
    current_user.hashed_password = get_secret_hash(password_data.new_password)
    current_user.require_password_change = False
    
    session.add(current_user)
    await session.commit()
    
    return {"message": "Password updated successfully"}


@router.delete("/me")
async def delete_current_user(
    current_user: CurrentUserDep,
    session: SessionDep
):
    """删除当前用户（软删除）"""
    await current_user.soft_delete(session)
    return {"message": "User deleted successfully"}


# 管理员专用路由
@router.get("/users", response_model=UsersPublic)
async def get_users(
    current_user: CurrentUserDep,
    session: SessionDep,
    list_params: ListParamsDep
):
    """获取用户列表（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    statement = select(User).where(User.deleted_at.is_(None))
    
    # 应用分页
    statement = statement.offset(list_params.skip).limit(list_params.limit)
    
    result = await session.exec(statement)
    users = result.all()
    
    # 获取总数
    count_statement = select(User).where(User.deleted_at.is_(None))
    count_result = await session.exec(count_statement)
    total = len(count_result.all())
    
    return UsersPublic(
        data=[UserPublic.model_validate(user) for user in users],
        count=len(users),
        total=total
    )


@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user_by_id(
    user_id: int,
    current_user: CurrentUserDep,
    session: SessionDep
):
    """根据ID获取用户信息（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    statement = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    result = await session.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/users/{user_id}", response_model=UserPublic)
async def update_user_by_id(
    user_id: int,
    user_update: UserUpdate,
    current_user: CurrentUserDep,
    session: SessionDep
):
    """更新指定用户信息（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    statement = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    result = await session.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 检查用户名冲突
    if user_update.username and user_update.username != user.username:
        username_statement = select(User).where(
            User.username == user_update.username,
            User.id != user_id,
            User.deleted_at.is_(None)
        )
        username_result = await session.exec(username_statement)
        existing_user = username_result.first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
    
    # 更新用户信息
    update_data = user_update.model_dump(exclude_unset=True, exclude={"password"})
    
    if user_update.password:
        update_data["hashed_password"] = get_secret_hash(user_update.password)
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    try:
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed"
        )


@router.delete("/users/{user_id}")
async def delete_user_by_id(
    user_id: int,
    current_user: CurrentUserDep,
    session: SessionDep
):
    """删除指定用户（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    statement = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    result = await session.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 不允许删除自己
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    await user.soft_delete(session)
    return {"message": "User deleted successfully"}


@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    current_user: CurrentUserDep,
    session: SessionDep
):
    """重置用户密码（仅管理员）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    statement = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    result = await session.exec(statement)
    user = result.first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 生成新密码
    new_password = generate_secure_password(12)
    user.hashed_password = get_secret_hash(new_password)
    user.require_password_change = True
    
    session.add(user)
    await session.commit()
    
    return {
        "message": "Password reset successfully",
        "new_password": new_password,
        "note": "User must change password on next login"
    }