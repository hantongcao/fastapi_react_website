import logging
import os
from logging.handlers import RotatingFileHandler
from bluenote.config.config import settings

def setup_logger(name: str) -> logging.Logger:
    """设置并返回logger实例"""
    logger = logging.getLogger(name)
    
    # 避免重复添加handler
    if logger.handlers:
        return logger
    
    logger.setLevel(logging.INFO)
    # 阻止日志传播到父logger，避免重复记录
    logger.propagate = False
    
    # 创建日志目录
    log_config = settings.get_log_config()
    log_dir = os.path.dirname(log_config["log_file"])
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # 创建文件handler
    file_handler = RotatingFileHandler(
        log_config["log_file"],
        maxBytes=log_config["log_max_bytes"],
        backupCount=log_config["log_backup_count"],
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    
    # 创建控制台handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # 创建formatter
    formatter = logging.Formatter(log_config["log_format"])
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # 添加handler到logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# 创建默认logger
default_logger = setup_logger('bluenote')