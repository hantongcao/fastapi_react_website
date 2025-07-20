# 导入所有模型以确保 Alembic 能够检测到它们
from .blogs import Blog, BlogBase, BlogCreate, BlogUpdate, BlogPublic, BlogStats, BlogsPublic, ContentStatus, Visibility
from .photos import Photo, PhotoBase, PhotoCreate, PhotoUpdate, PhotoPublic, PhotoStats, PhotosPublic
from .contacts import Contact, ContactBase, ContactCreate, ContactUpdate, ContactPublic, ContactStats, ContactsPublic
from .users import User, UserBase, UserCreate, UserUpdate, UserPublic, UsersPublic, UpdatePassword
from .common import PaginatedList, UTCDateTime

__all__ = [
    # Blogs
    'Blog', 'BlogBase', 'BlogCreate', 'BlogUpdate', 'BlogPublic', 'BlogStats', 'BlogsPublic',
    # Photos
    'Photo', 'PhotoBase', 'PhotoCreate', 'PhotoUpdate', 'PhotoPublic', 'PhotoStats', 'PhotosPublic',
    # Contacts
    'Contact', 'ContactBase', 'ContactCreate', 'ContactUpdate', 'ContactPublic', 'ContactStats', 'ContactsPublic',
    # Users
    'User', 'UserBase', 'UserCreate', 'UserUpdate', 'UserPublic', 'UsersPublic', 'UpdatePassword',
    # Common
    'PaginatedList', 'UTCDateTime',
    # Enums
    'ContentStatus', 'Visibility'
]