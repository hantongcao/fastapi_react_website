import uvicorn
import os
from bluenote.config.config import settings

def main():
    """启动 FastAPI 应用"""
    # 使用配置文件中的设置
    server_config = settings.get_server_config()
    
    uvicorn.run(
        "bluenote.server.app:create_app",  # 使用导入字符串
        factory=True,  # 表示create_app是一个工厂函数
        host=server_config["host"],
        port=server_config["port"],
        reload=server_config["reload"],
        log_level=server_config["log_level"]
    )





if __name__ == "__main__":
    main()