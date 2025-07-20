from contextlib import asynccontextmanager
import aiohttp
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cdn_host import monkey_patch_for_docs_ui

from bluenote.api import exceptions, middlewares
from bluenote.routes.routes import api_router
from bluenote.server.db import init_db, get_session
from bluenote.config.config import settings
from bluenote.schemas.users import User, UserCreate
from bluenote.security import get_secret_hash
from sqlmodel import select

async def init_admin_user():
    """初始化管理员账号"""
    async for session in get_session():
        # 检查是否已存在管理员账号
        statement = select(User).where(
            User.username == settings.INIT_ADMIN_USERNAME,
            User.deleted_at.is_(None)
        )
        result = await session.exec(statement)
        existing_admin = result.first()
        
        if not existing_admin:
            # 创建管理员账号
            admin_data = UserCreate(
                username=settings.INIT_ADMIN_USERNAME,
                password=settings.INIT_ADMIN_PASSWORD,
                is_admin=True,
                full_name="系统管理员"
            )
            
            hashed_password = get_secret_hash(admin_data.password)
            admin_user = User(
                username=admin_data.username,
                is_admin=admin_data.is_admin,
                full_name=admin_data.full_name,
                hashed_password=hashed_password
            )
            
            session.add(admin_user)
            await session.commit()
            print(f"管理员账号已创建: {settings.INIT_ADMIN_USERNAME}")
        else:
            print(f"管理员账号已存在: {settings.INIT_ADMIN_USERNAME}")
        
        break  # 只需要一个session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 使用配置文件中的数据库URL
    database_url = settings.get_database_url()
    await init_db(database_url)
    
    # 初始化管理员账号
    await init_admin_user()
    
    app.state.http_client = aiohttp.ClientSession()
    yield
    await app.state.http_client.close()

def create_app() -> FastAPI:
    """创建 FastAPI 应用实例"""
    app = FastAPI(
        title=settings.APP_TITLE,
        lifespan=lifespan,
        response_model_exclude_unset=True,
        # docs_url=None,  # 禁用 /docs
        # redoc_url=None,  # 禁用 /redoc
    )
    
    monkey_patch_for_docs_ui(app)
    
    # 添加CORS中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 允许所有源（开发环境）
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(middlewares.RequestTimeMiddleware)
    
    app.include_router(api_router)
    exceptions.register_handlers(app)
    
    return app

# 为了向后兼容，保留这个实例
app = create_app()