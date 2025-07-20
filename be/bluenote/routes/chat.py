from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
from bluenote.services.openai import openai_service
from bluenote.api.exceptions import InternalServerErrorException
from bluenote.config.config import settings
from bluenote.utils.logger import setup_logger
import json

router = APIRouter()
logger = setup_logger(__name__)

class ChatRequest(BaseModel):
    message: str
    model: str = settings.OPENAI_DEFAULT_MODEL

class ChatWithHistoryRequest(BaseModel):
    messages: List[Dict[str, str]]
    model: str = settings.OPENAI_DEFAULT_MODEL

class ChatResponse(BaseModel):
    response: str
    success: bool

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """单次聊天接口（非流式）"""
    logger.info(f"[CHAT] 收到聊天请求: model={request.model}")
    logger.info(f"[CHAT] 用户输入: {request.message}")
    
    try:
        response = openai_service.chat(request.message, request.model)
        logger.info(f"[CHAT] AI回答: {response}")
        logger.info(f"[CHAT] 聊天响应成功")
        return ChatResponse(response=response, success=True)
    except Exception as e:
        logger.error(f"[CHAT] 聊天服务异常: {str(e)}")
        raise InternalServerErrorException(f"聊天服务异常: {str(e)}")

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """单次聊天接口（流式）"""
    logger.info(f"[CHAT_STREAM] 收到流式聊天请求: model={request.model}")
    logger.info(f"[CHAT_STREAM] 用户输入: {request.message}")
    
    def generate():
        response_chunks = []
        try:
            for chunk in openai_service.chat_stream(request.message, request.model):
                response_chunks.append(chunk)
                # 使用SSE格式
                yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
            # 发送结束信号
            yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
            # 记录完整响应
            full_response = ''.join(response_chunks)
            logger.info(f"[CHAT_STREAM] AI回答: {full_response}")
            logger.info(f"[CHAT_STREAM] 流式聊天完成")
        except Exception as e:
            logger.error(f"[CHAT_STREAM] 聊天流服务异常: {str(e)}")
            yield f"data: {json.dumps({'error': f'聊天流服务异常: {str(e)}', 'done': True})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.post("/history", response_model=ChatResponse)
async def chat_with_history(request: ChatWithHistoryRequest):
    """带历史记录的聊天接口（非流式）"""
    logger.info(f"[CHAT_HISTORY] 收到历史聊天请求: model={request.model}, messages_count={len(request.messages)}")
    
    # 记录完整的消息历史
    logger.info(f"[CHAT_HISTORY] 消息历史: {json.dumps(request.messages, ensure_ascii=False, indent=2)}")
    
    # 记录最新用户消息
    if request.messages:
        last_user_message = None
        for msg in reversed(request.messages):
            if msg.get('role') == 'user':
                last_user_message = msg.get('content', '')
                break
        if last_user_message:
            logger.info(f"[CHAT_HISTORY] 最新用户输入: {last_user_message}")
    
    try:
        response = openai_service.chat_with_history(request.messages, request.model)
        logger.info(f"[CHAT_HISTORY] AI回答: {response}")
        logger.info(f"[CHAT_HISTORY] 历史聊天响应成功")
        return ChatResponse(response=response, success=True)
    except Exception as e:
        logger.error(f"[CHAT_HISTORY] 历史聊天服务异常: {str(e)}")
        raise InternalServerErrorException(f"历史聊天服务异常: {str(e)}")

@router.post("/history/stream")
async def chat_with_history_stream(request: ChatWithHistoryRequest):
    """带历史记录的聊天接口（流式）"""
    logger.info(f"[CHAT_HISTORY_STREAM] 收到历史流式聊天请求: model={request.model}, messages_count={len(request.messages)}")
    
    # 记录完整的消息历史
    logger.info(f"[CHAT_HISTORY_STREAM] 消息历史: {json.dumps(request.messages, ensure_ascii=False, indent=2)}")
    
    # 记录最新用户消息
    if request.messages:
        last_user_message = None
        for msg in reversed(request.messages):
            if msg.get('role') == 'user':
                last_user_message = msg.get('content', '')
                break
        if last_user_message:
            logger.info(f"[CHAT_HISTORY_STREAM] 最新用户输入: {last_user_message}")
    
    def generate():
        response_chunks = []
        try:
            for chunk in openai_service.chat_with_history_stream(request.messages, request.model):
                response_chunks.append(chunk)
                # 使用SSE格式
                yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
            # 发送结束信号
            yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
            # 记录完整响应
            full_response = ''.join(response_chunks)
            logger.info(f"[CHAT_HISTORY_STREAM] AI回答: {full_response}")
            logger.info(f"[CHAT_HISTORY_STREAM] 历史流式聊天完成")
        except Exception as e:
            logger.error(f"[CHAT_HISTORY_STREAM] 历史聊天流服务异常: {str(e)}")
            yield f"data: {json.dumps({'error': f'历史聊天流服务异常: {str(e)}', 'done': True})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.get("/health")
async def health_check():
    """健康检查接口"""
    logger.info("[HEALTH] 收到健康检查请求")
    return {"status": "ok", "service": "chat"}
