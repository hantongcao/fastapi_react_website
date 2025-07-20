#!/usr/bin/env python3
"""
使用uv运行BluenNote应用的启动脚本
"""

import subprocess
import sys
import os

def main():
    """使用uv运行应用"""
    # 确保在正确的目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 使用uv运行main.py
    try:
        subprocess.run(["uv", "run", "python", "main.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"启动失败: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("错误: 未找到uv命令，请先安装uv")
        print("安装命令: curl -LsSf https://astral.sh/uv/install.sh | sh")
        sys.exit(1)

if __name__ == "__main__":
    main()