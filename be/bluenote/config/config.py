import os
from typing import Optional

class Settings:
    """应用配置类"""
    
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    LOG_LEVEL: str = "info"
    
    # 日志配置
    LOG_FILE: str = "logs/bluenote.log"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_MAX_BYTES: int = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT: int = 5
    
    # 数据库配置
    DATABASE_URL: str = "sqlite+aiosqlite:///d:/Coding/blueweb-main/blueweb-main/db/bluenote.db"

    # 初始管理员账号密码
    INIT_ADMIN_USERNAME: str = "admin"
    INIT_ADMIN_PASSWORD: str = "Admin123456!"
    
    # JWT配置
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 120
    
    # OpenAI 配置
    OPENAI_API_KEY: str = "eazytec_ec93ce714794e79d_5bd31c12884a8d1549a1740782419d02"
    OPENAI_BASE_URL: str = "https://maas.eazytec-cloud.com/v1"
    OPENAI_TIMEOUT: float = 30.0
    OPENAI_DEFAULT_MODEL: str = "maas/qwen3-235b-a22b"
    OPENAI_MAX_TOKENS: int = 4096
    OPENAI_TEMPERATURE: float = 0.7
    
    # FastAPI 配置
    APP_TITLE: str = "Bluenote"
    
    def __init__(self):
        """初始化配置，可以在这里添加配置验证逻辑"""
        pass
    
    @classmethod
    def get_database_url(cls) -> str:
        """获取数据库连接URL"""
        return cls.DATABASE_URL
    
    @classmethod
    def get_openai_config(cls) -> dict:
        """获取OpenAI配置"""
        return {
            "api_key": cls.OPENAI_API_KEY,
            "base_url": cls.OPENAI_BASE_URL,
            "timeout": cls.OPENAI_TIMEOUT,
            "default_model": cls.OPENAI_DEFAULT_MODEL,
            "max_tokens": cls.OPENAI_MAX_TOKENS,
            "temperature": cls.OPENAI_TEMPERATURE,
        }
    
    @classmethod
    def get_server_config(cls) -> dict:
        """获取服务器配置"""
        return {
            "host": cls.HOST,
            "port": cls.PORT,
            "reload": cls.RELOAD,
            "log_level": cls.LOG_LEVEL,
        }
    
    @classmethod
    def get_log_config(cls) -> dict:
        """获取日志配置"""
        return {
            "log_file": cls.LOG_FILE,
            "log_format": cls.LOG_FORMAT,
            "log_max_bytes": cls.LOG_MAX_BYTES,
            "log_backup_count": cls.LOG_BACKUP_COUNT,
        }
    
    @classmethod
    def get_jwt_config(cls) -> dict:
        """获取JWT配置"""
        return {
            "secret_key": cls.JWT_SECRET_KEY,
            "algorithm": cls.JWT_ALGORITHM,
            "expire_minutes": cls.JWT_EXPIRE_MINUTES,
        }

# 创建全局配置实例
settings = Settings()