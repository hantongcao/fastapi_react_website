
from fastapi import Depends, APIRouter
from bluenote.routes import (
    blog,
    chat,
    photo,
    contact,
    auth
)

from bluenote.api.exceptions import error_responses, bluenote_api_error_responses
api_router = APIRouter(responses=error_responses)

author_router = APIRouter()
author_router.include_router(blog.router, prefix="/blogs", tags=["blogs"])
author_router.include_router(chat.router, prefix="/chat", tags=["chat"])
author_router.include_router(photo.router, prefix="/photos", tags=["photos"])
author_router.include_router(contact.router, prefix="/contacts", tags=["contacts"])
author_router.include_router(auth.router, tags=["auth"])  # auth路由已包含/auth前缀

api_router.include_router(author_router, prefix="/v1")