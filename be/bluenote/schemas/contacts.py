from typing import Optional
from datetime import datetime

from sqlalchemy import Column, String, Text
from sqlmodel import Field, SQLModel

from bluenote.mixins import BaseModelMixin
from bluenote.schemas.common import PaginatedList


class ContactBase(SQLModel):
    """联系表单基础模型"""
    name: str = Field(max_length=100)  # 姓名
    email: str = Field(max_length=255)  # 邮箱
    theme: str = Field(max_length=200)  # 主题
    context: str = Field(sa_column=Column(Text))  # 内容


class Contact(ContactBase, BaseModelMixin, table=True):
    """联系表单数据库模型"""
    __tablename__ = 'contacts'
    
    id: Optional[int] = Field(default=None, primary_key=True)


class ContactCreate(ContactBase):
    """创建联系表单请求模型"""
    pass


class ContactUpdate(SQLModel):
    """更新联系表单请求模型"""
    name: Optional[str] = None
    email: Optional[str] = None
    theme: Optional[str] = None
    context: Optional[str] = None


class ContactPublic(ContactBase):
    """公开联系表单响应模型"""
    id: int
    created_at: datetime
    # updated_at: datetime


class ContactStats(SQLModel):
    """联系表单统计信息"""
    total_contacts: int
    unread_contacts: int
    read_contacts: int


# 分页列表类型
ContactsPublic = PaginatedList[ContactPublic]