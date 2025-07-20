from typing import Optional, List
from datetime import datetime

from sqlalchemy import Column, String, Text, Integer, Float
from sqlmodel import Field, SQLModel
from pydantic import model_validator

from bluenote.schemas.blogs import ContentStatus, Visibility



from bluenote.mixins import BaseModelMixin
from bluenote.schemas.common import PaginatedList, PhotoCategory


class PhotoBase(SQLModel):
    """照片基础模型"""
    title: Optional[str] = Field(default=None, max_length=100)  # 照片标题
    description: Optional[str] = Field(default=None, sa_column=Column(Text))  # 照片描述
    url_list: Optional[List[str]] = Field(default=None, sa_column=Column(Text))  # 照片URL列表，用逗号分隔存储
    
    # 地理位置信息
    location_name: Optional[str] = Field(default=None, max_length=200)  # 位置名称
    
    # 状态和可见性
    status: ContentStatus = Field(default=ContentStatus.DRAFT)  # 照片状态
    visibility: Visibility = Field(default=Visibility.PUBLIC)  # 可见性
    
    # 标签和分类
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(Text))  # 标签列表，用逗号分隔存储
    category: Optional[PhotoCategory] = Field(default=None)  # 分类
    
    # 互动数据
    like_count: int = Field(default=0)  # 点赞数
    comment_count: int = Field(default=0)  # 评论数
    share_count: int = Field(default=0)  # 分享数
    view_count: int = Field(default=0)  # 浏览数
    
    # 拍摄信息
    taken_at: Optional[datetime] = Field(default=None)  # 拍摄时间
    
    @model_validator(mode='before')
    @classmethod
    def parse_fields(cls, data):
        """从数据库读取时，将逗号分隔的字符串转换为列表"""
        if isinstance(data, dict):
            # 处理tags字段
            if 'tags' in data:
                tags_value = data['tags']
                if isinstance(tags_value, str) and tags_value:
                    data['tags'] = [tag.strip() for tag in tags_value.split(',') if tag.strip()]
                elif not tags_value:
                    data['tags'] = None
            
            # 处理url_list字段
            if 'url_list' in data:
                url_value = data['url_list']
                if isinstance(url_value, str) and url_value:
                    data['url_list'] = [url.strip() for url in url_value.split(',') if url.strip()]
                elif not url_value:
                    data['url_list'] = None
        return data


class Photo(PhotoBase, BaseModelMixin, table=True):
    """照片数据库模型"""
    __tablename__ = 'photos'
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    async def save(self, session):
        """重写save方法，在保存前处理tags和url_list字段"""
        # 保存原始值
        original_tags = self.tags
        original_url_list = self.url_list
        
        try:
            # 如果tags是列表，转换为逗号分隔的字符串
            if self.tags and isinstance(self.tags, list):
                self.tags = ','.join(self.tags)
            
            # 如果url_list是列表，转换为逗号分隔的字符串
            if self.url_list and isinstance(self.url_list, list):
                self.url_list = ','.join(self.url_list)
            
            # 调用父类的save方法
            await super().save(session)
            
            # 恢复为列表格式
            self.tags = original_tags
            self.url_list = original_url_list
            
        except Exception as e:
            # 如果保存失败，恢复原始值
            self.tags = original_tags
            self.url_list = original_url_list
            raise e


class PhotoCreate(PhotoBase):
    """创建照片请求模型"""
    pass


class PhotoUpdate(SQLModel):
    """更新照片请求模型"""
    title: Optional[str] = None
    description: Optional[str] = None
    url_list: Optional[List[str]] = None  # 支持更新照片URL列表
    status: Optional[ContentStatus] = None
    visibility: Optional[Visibility] = None
    tags: Optional[List[str]] = None
    category: Optional[PhotoCategory] = None
    location_name: Optional[str] = None


class PhotoPublic(PhotoBase):
    """公开照片响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime
    url_list: List[str] = Field(default_factory=list)  # 确保返回空列表而不是None


class PhotoUpdateResponse(SQLModel):
    """更新照片响应模型 - 包含更新后的字段"""
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    url_list: Optional[List[str]] = None  # 返回更新后的URL列表
    location_name: Optional[str] = None
    status: Optional[ContentStatus] = None  # 返回更新后的状态
    visibility: Visibility
    tags: Optional[List[str]] = None
    category: Optional[PhotoCategory] = None




class PhotoStats(SQLModel):
    """照片统计信息"""
    total_photos: int
    published_photos: int
    draft_photos: int
    private_photos: int
    total_likes: int
    total_views: int
    total_comments: int


# 分页列表类型
PhotosPublic = PaginatedList[PhotoPublic]