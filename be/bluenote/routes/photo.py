from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from bluenote.api.exceptions import (
    AlreadyExistsException,
    InternalServerErrorException,
    NotFoundException,
)

from bluenote.server.deps import SessionDep, ListParamsDep
from bluenote.schemas.photos import PhotoCreate, PhotoPublic, PhotosPublic, Photo, PhotoUpdate, PhotoUpdateResponse
from bluenote.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("", response_model=PhotoPublic)
async def create_photo(
    session: SessionDep, photo_in: PhotoCreate
):
    logger.info(f"[CREATE_PHOTO] 收到创建照片请求: {photo_in}")
    
    # 检查URL列表是否为空
    if not photo_in.url_list or len(photo_in.url_list) == 0:
        logger.warning(f"[CREATE_PHOTO] 照片URL列表为空")
        raise HTTPException(status_code=400, detail="Photo URL list cannot be empty")

    try:
        current = datetime.now(timezone.utc)
        logger.info(f"[CREATE_PHOTO] 创建照片对象: title={photo_in.title}, url_list={photo_in.url_list}")
        
        # 处理 taken_at 时区问题
        taken_at_utc = None
        if photo_in.taken_at:
            if photo_in.taken_at.tzinfo is None:
                # 如果没有时区信息，假设为 UTC
                taken_at_utc = photo_in.taken_at.replace(tzinfo=timezone.utc)
            else:
                # 如果有时区信息，转换为 UTC
                taken_at_utc = photo_in.taken_at.astimezone(timezone.utc)
            # 移除时区信息，因为数据库存储的是 naive datetime
            taken_at_utc = taken_at_utc.replace(tzinfo=None)

        photo = Photo(
            title=photo_in.title,
            description=photo_in.description,
            url_list=photo_in.url_list,
            location_name=photo_in.location_name,
            status=photo_in.status,
            visibility=photo_in.visibility,
            tags=photo_in.tags,
            category=photo_in.category,
            like_count=photo_in.like_count,
            comment_count=photo_in.comment_count,
            share_count=photo_in.share_count,
            view_count=photo_in.view_count,
            taken_at=taken_at_utc,
            created_at=current.replace(tzinfo=None),
            updated_at=current.replace(tzinfo=None),
        )
        photo = await Photo.create(session, photo)
        logger.info(f"[CREATE_PHOTO] 照片创建成功: id={photo.id}")
    except Exception as e:
        logger.error(f"[CREATE_PHOTO] 创建照片失败: {e}")
        raise InternalServerErrorException(message=f"Failed to create photo: {e}")

    result = PhotoPublic(
        id=photo.id,
        title=photo.title,
        description=photo.description,
        url_list=photo.url_list or [],  # 如果为None则使用空列表
        location_name=photo.location_name,
        status=photo.status,
        visibility=photo.visibility,
        tags=photo.tags,
        category=photo.category,
        like_count=photo.like_count,
        comment_count=photo.comment_count,
        share_count=photo.share_count,
        view_count=photo.view_count,
        taken_at=photo.taken_at,
        created_at=photo.created_at,
        updated_at=photo.updated_at,
    )
    logger.info(f"[CREATE_PHOTO] 返回照片数据: id={result.id}, title={result.title}")
    return result


@router.get("", response_model=PhotosPublic)
async def list_photos(session: SessionDep, params: ListParamsDep, search: str = None, category: str = None):
    logger.info(f"[LIST_PHOTOS] 收到列表照片请求: search={search}, category={category}, page={params.page}, per_page={params.perPage}")
    
    fuzzy_fields = {}
    fields = {}
    
    if search:
        fuzzy_fields = {"title": search}
        logger.info(f"[LIST_PHOTOS] 设置搜索条件: {fuzzy_fields}")
    
    if category:
        fields = {"category": category}
        logger.info(f"[LIST_PHOTOS] 设置分类过滤: {fields}")

    result = await Photo.paginated_by_query(
        session=session, 
        fuzzy_fields=fuzzy_fields,
        fields=fields,
        page=params.page, 
        per_page=params.perPage
    )
    
    logger.info(f"[LIST_PHOTOS] 返回照片列表: 总数={len(result.data) if hasattr(result, 'data') else 'unknown'}")
    return result


@router.get("/{photo_id}", response_model=PhotoPublic)
async def get_photo(session: SessionDep, photo_id: int):
    logger.info(f"[GET_PHOTO] 收到获取照片请求: photo_id={photo_id}")
    
    photo = await Photo.one_by_id(session, photo_id)
    if not photo:
        logger.warning(f"[GET_PHOTO] 照片不存在: photo_id={photo_id}")
        raise NotFoundException(message=f"Photo with id {photo_id} not found")
    
    # 增加浏览数
    try:
        photo.view_count += 1
        await photo.save(session)
        logger.info(f"[GET_PHOTO] 照片浏览数已更新: photo_id={photo_id}, view_count={photo.view_count}")
    except Exception as e:
        logger.warning(f"[GET_PHOTO] 更新浏览数失败: {e}")
    
    result = PhotoPublic(
        id=photo.id,
        title=photo.title,
        description=photo.description,
        url_list=photo.url_list or [],  # 如果为None则使用空列表
        location_name=photo.location_name,
        status=photo.status,
        visibility=photo.visibility,
        tags=photo.tags,
        category=photo.category,
        like_count=photo.like_count,
        comment_count=photo.comment_count,
        share_count=photo.share_count,
        view_count=photo.view_count,
        taken_at=photo.taken_at,
        created_at=photo.created_at,
        updated_at=photo.updated_at,
    )
    
    logger.info(f"[GET_PHOTO] 返回照片数据: id={result.id}, title={result.title}")
    return result


@router.put("/{photo_id}", response_model=PhotoUpdateResponse)
async def update_photo(session: SessionDep, photo_id: int, photo_update: PhotoUpdate):
    logger.info(f"[UPDATE_PHOTO] 收到更新照片请求: photo_id={photo_id}, update_data={photo_update}")
    
    photo = await Photo.one_by_id(session, photo_id)
    if not photo:
        logger.warning(f"[UPDATE_PHOTO] 照片不存在: photo_id={photo_id}")
        raise NotFoundException(message=f"Photo with id {photo_id} not found")
    
    try:
        # 更新字段
        update_data = photo_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(photo, field, value)
        
        await photo.save(session)
        logger.info(f"[UPDATE_PHOTO] 照片更新成功: photo_id={photo_id}")
    except Exception as e:
        logger.error(f"[UPDATE_PHOTO] 更新照片失败: {e}")
        raise InternalServerErrorException(message=f"Failed to update photo: {e}")
    
    result = PhotoUpdateResponse(
        id=photo.id,
        title=photo.title,
        description=photo.description,
        url_list=photo.url_list or [],  # 返回更新后的URL列表，如果为None则使用空列表
        location_name=photo.location_name,
        status=photo.status,  # 返回更新后的状态
        visibility=photo.visibility,
        tags=photo.tags,
        category=photo.category,
    )
    
    logger.info(f"[UPDATE_PHOTO] 返回更新后的照片数据: id={result.id}, title={result.title}")
    return result


@router.delete("/{photo_id}")
async def delete_photo(session: SessionDep, photo_id: int):
    logger.info(f"[DELETE_PHOTO] 收到删除照片请求: photo_id={photo_id}")
    
    photo = await Photo.one_by_id(session, photo_id)
    if not photo:
        logger.warning(f"[DELETE_PHOTO] 照片不存在: photo_id={photo_id}")
        raise NotFoundException(message=f"Photo with id {photo_id} not found")
    
    try:
        await photo.delete(session)
        logger.info(f"[DELETE_PHOTO] 照片删除成功: photo_id={photo_id}")
    except Exception as e:
        logger.error(f"[DELETE_PHOTO] 删除照片失败: {e}")
        raise InternalServerErrorException(message=f"Failed to delete photo: {e}")
    
    return {"message": f"Photo {photo_id} deleted successfully"}