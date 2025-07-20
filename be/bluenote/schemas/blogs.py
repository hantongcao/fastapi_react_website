from datetime import datetime
from typing import Optional, List
import json

from sqlalchemy import Column, UniqueConstraint, String, Text, Boolean, ForeignKey, Integer
# 移除 PostgreSQL 特定的 JSON 导入
# from sqlalchemy.dialects.postgresql import JSON
from sqlmodel import Field, SQLModel, Relationship
from pydantic import model_validator

from enum import Enum

from pydantic import ConfigDict
class ContentStatus(str, Enum):
    """内容状态枚举（适用于博客、照片等）"""
    DRAFT = "draft"  # 草稿
    PUBLISHED = "published"  # 已发布
    PRIVATE = "private"  # 私密
    ARCHIVED = "archived"  # 已归档
    DELETED = "deleted"  # 已删除

class Visibility(str, Enum):
    """可见性枚举"""
    PUBLIC = "public"  # 公开
    FRIENDS = "friends"  # 仅好友可见
    PRIVATE = "private"  # 仅自己可见

from bluenote.mixins import BaseModelMixin
from bluenote.schemas.common import PaginatedList, UTCDateTime, BlogCategory

class BlogBase(SQLModel):
    title: str
    content: str = Field(sa_column=Column(Text))  # 博客内容
    summary: Optional[str] = Field(default=None, max_length=500)  # 博客摘要
    status: ContentStatus = Field(default=ContentStatus.DRAFT)  # 博客状态
    visibility: Visibility = Field(default=Visibility.PUBLIC)  # 可见性
    # 在API层面使用List[str]，在数据库层面存储为TEXT
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(Text))  # 博客标签列表
    category: Optional[BlogCategory] = Field(default=None)  # 分类
    
    # 互动数据
    like_count: int = Field(default=0)  # 点赞数
    comment_count: int = Field(default=0)  # 评论数
    share_count: int = Field(default=0)  # 分享数
    view_count: int = Field(default=0)  # 浏览数
    
    @model_validator(mode='before')
    @classmethod
    def parse_tags(cls, data):
        """从数据库读取时，将逗号分隔的字符串转换为列表"""
        if isinstance(data, dict) and 'tags' in data:
            tags_value = data['tags']
            if isinstance(tags_value, str) and tags_value:
                data['tags'] = [tag.strip() for tag in tags_value.split(',') if tag.strip()]
            elif not tags_value:
                data['tags'] = None
        return data
    
    @model_validator(mode='after')
    def serialize_tags(self):
        """保存到数据库前，将列表转换为逗号分隔的字符串"""
        if hasattr(self, 'tags') and self.tags:
            # 这里我们需要在实际保存时处理，暂时保持原样
            pass
        return self
    



class Blog(BlogBase, BaseModelMixin, table=True):
    __tablename__ = 'blogs'
    id: Optional[int] = Field(default=None, primary_key=True)
    model_config = ConfigDict(protected_namespaces=())
    
    async def save(self, session):
        """重写save方法，在保存前处理tags字段"""
        # 如果tags是列表，转换为逗号分隔的字符串
        if self.tags and isinstance(self.tags, list):
            # 临时保存原始值
            original_tags = self.tags
            # 转换为字符串存储
            self.tags = ','.join(original_tags)
            try:
                # 调用父类的save方法
                await super().save(session)
                # 恢复为列表格式
                self.tags = original_tags
            except Exception as e:
                # 如果保存失败，恢复原始值
                self.tags = original_tags
                raise e
        else:
            # 如果tags不是列表，直接调用父类save方法
            await super().save(session)

class BlogCreate(BlogBase):
    """创建博客请求模型"""
    pass


class BlogUpdate(SQLModel):
    """更新博客请求模型"""
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    status: Optional[ContentStatus] = None
    visibility: Optional[Visibility] = None
    tags: Optional[List[str]] = None
    category: Optional[BlogCategory] = None
    


class BlogPublic(BlogBase):
    """公开博客响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime


class BlogUpdateResponse(SQLModel):
    """更新博客响应模型"""
    id: int
    title: str
    content: str
    summary: Optional[str] = None
    status: ContentStatus
    visibility: Visibility
    tags: Optional[List[str]] = None
    category: Optional[BlogCategory] = None


class BlogStats(SQLModel):
    """博客统计信息"""
    total_blogs: int
    published_blogs: int
    draft_blogs: int
    private_blogs: int
    total_likes: int
    total_views: int
    total_comments: int


BlogsPublic = PaginatedList[BlogPublic]