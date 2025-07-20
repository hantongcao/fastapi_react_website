from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from bluenote.api.exceptions import (
    AlreadyExistsException,
    InternalServerErrorException,
    NotFoundException,
)

from bluenote.server.deps import SessionDep, ListParamsDep
from bluenote.schemas.blogs import BlogCreate, BlogPublic, BlogsPublic, Blog, BlogUpdate, BlogUpdateResponse
from bluenote.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("", response_model=BlogPublic)
async def create_blog(
    session: SessionDep, blog_in: BlogCreate
):
    logger.info(f"[CREATE_BLOG] 收到创建博客请求: {blog_in}")
    
    # 检查标题是否为空
    if not blog_in.title or len(blog_in.title.strip()) == 0:
        logger.warning(f"[CREATE_BLOG] 博客标题为空")
        raise HTTPException(status_code=400, detail="Blog title cannot be empty")
    
    # 检查内容是否为空
    if not blog_in.content or len(blog_in.content.strip()) == 0:
        logger.warning(f"[CREATE_BLOG] 博客内容为空")
        raise HTTPException(status_code=400, detail="Blog content cannot be empty")
    
    fields = {"title": blog_in.title}
    existing = await Blog.one_by_fields(session, fields)
    if existing:
        logger.warning(f"[CREATE_BLOG] 博客标题已存在: {blog_in.title}")
        raise AlreadyExistsException(message=f"Blog {blog_in.title} already exists")

    try:
        current = datetime.now(timezone.utc)
        logger.info(f"[CREATE_BLOG] 创建博客对象: title={blog_in.title}, content长度={len(blog_in.content)}")

        blog = Blog(
            title=blog_in.title,
            content=blog_in.content,
            summary=blog_in.summary,
            status=blog_in.status,
            visibility=blog_in.visibility,
            tags=blog_in.tags,
            category=blog_in.category,
            like_count=blog_in.like_count,
            comment_count=blog_in.comment_count,
            share_count=blog_in.share_count,
            view_count=blog_in.view_count,
            created_at=current.replace(tzinfo=None),
            updated_at=current.replace(tzinfo=None),
        )
        blog = await Blog.create(session, blog)
        logger.info(f"[CREATE_BLOG] 博客创建成功: id={blog.id}")
    except Exception as e:
        logger.error(f"[CREATE_BLOG] 创建博客失败: {e}")
        raise InternalServerErrorException(message=f"Failed to create blog: {e}")

    result = BlogPublic(
        id=blog.id,
        title=blog.title,
        content=blog.content,
        summary=blog.summary,
        status=blog.status,
        visibility=blog.visibility,
        tags=blog.tags,
        category=blog.category,
        like_count=blog.like_count,
        comment_count=blog.comment_count,
        share_count=blog.share_count,
        view_count=blog.view_count,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
    )
    logger.info(f"[CREATE_BLOG] 返回博客数据: id={result.id}, title={result.title}")
    return result

@router.get("", response_model=BlogsPublic)
async def list_blogs(session: SessionDep, params: ListParamsDep, search: str = None, category: str = None):
    logger.info(f"[LIST_BLOGS] 收到列表博客请求: search={search}, category={category}, page={params.page}, per_page={params.perPage}")
    
    fuzzy_fields = {}
    fields = {}
    
    if search:
        fuzzy_fields = {"title": search}
        logger.info(f"[LIST_BLOGS] 设置搜索条件: {fuzzy_fields}")
    
    if category:
        fields = {"category": category}
        logger.info(f"[LIST_BLOGS] 设置分类过滤: {fields}")

    result = await Blog.paginated_by_query(
        session=session, 
        fuzzy_fields=fuzzy_fields,
        fields=fields,
        page=params.page, 
        per_page=params.perPage
    )
    
    logger.info(f"[LIST_BLOGS] 返回博客列表: 总数={len(result.data) if hasattr(result, 'data') else 'unknown'}")
    return result


@router.get("/{blog_id}", response_model=BlogPublic)
async def get_blog(session: SessionDep, blog_id: int):
    logger.info(f"[GET_BLOG] 收到获取博客请求: blog_id={blog_id}")
    
    blog = await Blog.one_by_id(session, blog_id)
    if not blog:
        logger.warning(f"[GET_BLOG] 博客不存在: blog_id={blog_id}")
        raise NotFoundException(message=f"Blog with id {blog_id} not found")
    
    # 增加浏览数
    try:
        blog.view_count += 1
        await blog.save(session)
        logger.info(f"[GET_BLOG] 博客浏览数已更新: blog_id={blog_id}, view_count={blog.view_count}")
    except Exception as e:
        logger.warning(f"[GET_BLOG] 更新浏览数失败: {e}")
    
    result = BlogPublic(
        id=blog.id,
        title=blog.title,
        content=blog.content,
        summary=blog.summary,
        status=blog.status,
        visibility=blog.visibility,
        tags=blog.tags,
        category=blog.category,
        like_count=blog.like_count,
        comment_count=blog.comment_count,
        share_count=blog.share_count,
        view_count=blog.view_count,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
    )
    
    logger.info(f"[GET_BLOG] 返回博客数据: id={result.id}, title={result.title}")
    return result


@router.put("/{blog_id}", response_model=BlogUpdateResponse)
async def update_blog(session: SessionDep, blog_id: int, blog_update: BlogUpdate):
    logger.info(f"[UPDATE_BLOG] 收到更新博客请求: blog_id={blog_id}, update_data={blog_update}")
    
    blog = await Blog.one_by_id(session, blog_id)
    if not blog:
        logger.warning(f"[UPDATE_BLOG] 博客不存在: blog_id={blog_id}")
        raise NotFoundException(message=f"Blog with id {blog_id} not found")
    
    try:
        # 更新字段
        update_data = blog_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(blog, field, value)
        
        await blog.save(session)
        logger.info(f"[UPDATE_BLOG] 博客更新成功: blog_id={blog_id}")
    except Exception as e:
        logger.error(f"[UPDATE_BLOG] 更新博客失败: {e}")
        raise InternalServerErrorException(message=f"Failed to update blog: {e}")
    
    result = BlogUpdateResponse(
        id=blog.id,
        title=blog.title,
        content=blog.content,
        summary=blog.summary,
        status=blog.status,
        visibility=blog.visibility,
        tags=blog.tags,
        category=blog.category,
    )
    
    logger.info(f"[UPDATE_BLOG] 返回更新后的博客数据: id={result.id}, title={result.title}")
    return result


@router.delete("/{blog_id}")
async def delete_blog(session: SessionDep, blog_id: int):
    logger.info(f"[DELETE_BLOG] 收到删除博客请求: blog_id={blog_id}")
    
    blog = await Blog.one_by_id(session, blog_id)
    if not blog:
        logger.warning(f"[DELETE_BLOG] 博客不存在: blog_id={blog_id}")
        raise NotFoundException(message=f"Blog with id {blog_id} not found")
    
    try:
        await blog.delete(session)
        logger.info(f"[DELETE_BLOG] 博客删除成功: blog_id={blog_id}")
    except Exception as e:
        logger.error(f"[DELETE_BLOG] 删除博客失败: {e}")
        raise InternalServerErrorException(message=f"Failed to delete blog: {e}")
    
    return {"message": f"Blog {blog_id} deleted successfully"}
