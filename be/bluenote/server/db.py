import re
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    create_async_engine,
)
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import DDL, event

from bluenote.schemas.blogs import Blog
from bluenote.schemas.contacts import Contact
from bluenote.schemas.photos import Photo
from bluenote.schemas.users import User



_engine = None


def get_engine():
    return _engine


async def get_session():
    async with AsyncSession(_engine) as session:
        yield session


async def init_db(db_url: str):
    global _engine
    if _engine is None:
        connect_args = {}
        if db_url.startswith("postgresql://"):
            db_url = re.sub(r'^postgresql://', 'postgresql+asyncpg://', db_url)

        elif db_url.startswith("sqlite+aiosqlite://"):
            # SQLite 配置
            connect_args = {"check_same_thread": False}
        else:
            raise Exception(f"Unsupported database URL: {db_url}")

        _engine = create_async_engine(db_url, echo=False, connect_args=connect_args)
        # 如果需要事件监听，可以在这里添加
        # listen_events(_engine)
    await create_db_and_tables(_engine)


async def create_db_and_tables(engine: AsyncEngine):
    async with engine.begin() as conn:
        await conn.run_sync(
            SQLModel.metadata.create_all,
            tables=[
                Blog.__table__,
                Contact.__table__,
                Photo.__table__,
                User.__table__,
            ],
        )


# 如果需要事件监听功能，可以添加这个函数
# def listen_events(engine: AsyncEngine):
#     # 在这里添加数据库事件监听逻辑
#     pass
