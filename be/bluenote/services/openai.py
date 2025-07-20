from openai import OpenAI
from typing import Iterator, List, Dict
from bluenote.config.config import settings
from bluenote.utils.logger import setup_logger

logger = setup_logger(__name__)

class OpenAIService:
    def __init__(self):
        # 使用配置文件中的设置
        openai_config = settings.get_openai_config()
        self.api_key = openai_config["api_key"]
        self.base_url = openai_config["base_url"]
        self.timeout = openai_config["timeout"]
        self.default_model = openai_config["default_model"]
        self.max_tokens = openai_config["max_tokens"]
        self.temperature = openai_config["temperature"]
        
        # 修复客户端初始化，移除可能导致问题的参数
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            timeout=self.timeout
        )
        logger.info(f"OpenAI服务初始化完成: model={self.default_model}, base_url={self.base_url}")
    
    def chat(self, message: str, model: str = None) -> str:
        """单次聊天（非流式）"""
        if model is None:
            model = self.default_model
            
        # 安全检查
        if not message or not message.strip():
            raise ValueError("消息内容不能为空")
        
        logger.info(f"开始单次聊天: model={model}, message_length={len(message)}")
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": message}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            result = response.choices[0].message.content
            logger.info(f"单次聊天完成: response_length={len(result) if result else 0}")
            return result
        except Exception as e:
            logger.error(f"OpenAI API Error: {str(e)}")
            raise Exception(f"OpenAI API 调用失败: {str(e)}")
    
    def chat_stream(self, message: str, model: str = None) -> Iterator[str]:
        """单次聊天（流式）"""
        if model is None:
            model = self.default_model
            
        # 安全检查
        if not message or not message.strip():
            raise ValueError("消息内容不能为空")
        
        logger.info(f"开始流式聊天: model={model}, message_length={len(message)}")
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": message}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=True
            )
            
            for chunk in response:
                # 添加安全检查，避免索引越界
                if chunk.choices and len(chunk.choices) > 0 and chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
            logger.info("流式聊天完成")
        except Exception as e:
            logger.error(f"OpenAI API Error: {str(e)}")
            raise Exception(f"OpenAI API 流式调用失败: {str(e)}")
    
    def chat_with_history(self, messages: List[Dict[str, str]], model: str = None) -> str:
        """带历史记录的聊天（非流式）"""
        if model is None:
            model = self.default_model
            
        # 安全检查
        if not messages or len(messages) == 0:
            raise ValueError("消息历史不能为空")
        
        logger.info(f"开始历史聊天: model={model}, messages_count={len(messages)}")
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            result = response.choices[0].message.content
            logger.info(f"历史聊天完成: response_length={len(result) if result else 0}")
            return result
        except Exception as e:
            logger.error(f"OpenAI API Error: {str(e)}")
            raise Exception(f"OpenAI API 历史聊天调用失败: {str(e)}")
    
    def chat_with_history_stream(self, messages: List[Dict[str, str]], model: str = None) -> Iterator[str]:
        """带历史记录的聊天（流式）"""
        if model is None:
            model = self.default_model
            
        # 安全检查
        if not messages or len(messages) == 0:
            raise ValueError("消息历史不能为空")
        
        logger.info(f"开始历史流式聊天: model={model}, messages_count={len(messages)}")
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                stream=True
            )
            
            for chunk in response:
                # 添加安全检查，避免索引越界
                if chunk.choices and len(chunk.choices) > 0 and chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
            logger.info("历史流式聊天完成")
        except Exception as e:
            logger.error(f"OpenAI API Error: {str(e)}")
            raise Exception(f"OpenAI API 历史聊天流式调用失败: {str(e)}")

# 创建全局服务实例
openai_service = OpenAIService()