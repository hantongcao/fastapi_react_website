from datetime import datetime, timezone
from fastapi import APIRouter
from sqlalchemy import or_

from bluenote.api.exceptions import (
    AlreadyExistsException,
    InternalServerErrorException,
    NotFoundException,
)

from bluenote.server.deps import SessionDep, ListParamsDep
from bluenote.schemas.contacts import ContactCreate, ContactPublic, ContactsPublic, Contact
from bluenote.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("", response_model=ContactPublic)
async def create_contact(
    session: SessionDep, contact_in: ContactCreate
):
    logger.info(f"[CREATE_CONTACT] 收到创建联系表单请求: {contact_in}")
    
    try:
        current = datetime.now(timezone.utc)
        logger.info(f"[CREATE_CONTACT] 创建联系表单对象: name={contact_in.name}, email={contact_in.email}")

        contact = Contact(
            name=contact_in.name,
            email=contact_in.email,
            theme=contact_in.theme,
            context=contact_in.context,
            created_at=current,
            updated_at=current,
        )
        contact = await Contact.create(session, contact)
        logger.info(f"[CREATE_CONTACT] 联系表单创建成功: id={contact.id}")
    except Exception as e:
        logger.error(f"[CREATE_CONTACT] 创建联系表单失败: {e}")
        raise InternalServerErrorException(message=f"Failed to create contact: {e}")

    result = ContactPublic(
        id=contact.id,
        name=contact.name,
        email=contact.email,
        theme=contact.theme,
        context=contact.context,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
    )
    logger.info(f"[CREATE_CONTACT] 返回联系表单数据: id={result.id}, name={result.name}")
    return result


@router.get("", response_model=ContactsPublic)
async def list_contacts(session: SessionDep, params: ListParamsDep, search: str = None):
    logger.info(f"[LIST_CONTACTS] 收到列表联系表单请求: search={search}, page={params.page}, per_page={params.perPage}")
    
    if search:
        # 在多个字段中搜索（姓名、邮箱、主题、内容）
        fuzzy_fields = {
            "name": search,
            "email": search,
            "theme": search,
            "context": search
        }
        logger.info(f"[LIST_CONTACTS] 设置搜索条件: {fuzzy_fields}")
        
        # 使用自定义查询实现多字段搜索
        result = await Contact.paginated_by_query(
            session=session,
            fuzzy_fields=fuzzy_fields,  # 这里会使用OR条件搜索所有指定字段
            page=params.page,
            per_page=params.perPage
        )
    else:
        # 不带搜索条件的查询
        result = await Contact.paginated_by_query(
            session=session,
            page=params.page,
            per_page=params.perPage
        )
    
    logger.info(f"[LIST_CONTACTS] 返回联系表单列表: 总数={len(result.data) if hasattr(result, 'data') else 'unknown'}")
    return result


@router.get("/{contact_id}", response_model=ContactPublic)
async def get_contact(session: SessionDep, contact_id: int):
    logger.info(f"[GET_CONTACT] 收到获取联系表单请求: contact_id={contact_id}")
    
    contact = await Contact.one_by_id(session, contact_id)
    if not contact:
        logger.warning(f"[GET_CONTACT] 联系表单不存在: contact_id={contact_id}")
        raise NotFoundException(message=f"Contact with id {contact_id} not found")
    
    result = ContactPublic(
        id=contact.id,
        name=contact.name,
        email=contact.email,
        theme=contact.theme,
        context=contact.context,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
    )
    
    logger.info(f"[GET_CONTACT] 返回联系表单数据: id={result.id}, name={result.name}")
    return result


@router.delete("/{contact_id}")
async def delete_contact(session: SessionDep, contact_id: int):
    logger.info(f"[DELETE_CONTACT] 收到删除联系表单请求: contact_id={contact_id}")
    
    contact = await Contact.one_by_id(session, contact_id)
    if not contact:
        logger.warning(f"[DELETE_CONTACT] 联系表单不存在: contact_id={contact_id}")
        raise NotFoundException(message=f"Contact with id {contact_id} not found")
    
    try:
        await contact.delete(session)
        logger.info(f"[DELETE_CONTACT] 联系表单删除成功: contact_id={contact_id}")
    except Exception as e:
        logger.error(f"[DELETE_CONTACT] 删除联系表单失败: {e}")
        raise InternalServerErrorException(message=f"Failed to delete contact: {e}")
    
    return {"message": f"Contact {contact_id} deleted successfully"}