# Bluenote Backend

一个基于 FastAPI 的现代化博客后端系统，支持博客管理、照片管理、联系人管理和 AI 助手功能。

## 功能特性

- 🚀 基于 FastAPI 的高性能 API
- 📝 博客文章管理（CRUD 操作）
- 📸 照片管理和画廊功能
- 👥 联系人管理
- 🤖 集成 OpenAI API 的 AI 助手
- 🔐 JWT 身份认证
- 📊 PostgreSQL 数据库
- 🔄 Alembic 数据库迁移
- 📋 完整的 API 文档（Swagger/OpenAPI）

## 技术栈

- **框架**: FastAPI
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy + SQLModel
- **迁移**: Alembic
- **认证**: JWT
- **包管理**: uv
- **AI 服务**: OpenAI API

## 安装和配置

### 1. 数据库设置（可掠过）

### 2. 配置文件修改(可略过)

### 3. 环境设置和依赖安装

```bash
# 进入后端目录
cd be
```bash
# 使用 uv 安装依赖（推荐使用阿里云镜像加速）
uv sync --all-extras --index-url https://mirrors.aliyun.com/pypi/simple/
```

### 4. 数据库迁移

```bash
# 运行数据库迁移
uv run alembic upgrade head
```

### 5. 启动服务

```bash
# 启动开发服务器
uv run python main.py
```

服务将在 `http://0.0.0.0:8000` 启动，支持热重载。

## API 文档

启动服务后，可以访问以下地址查看 API 文档：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 项目结构

```
be/
├── bluenote/                 # 主应用包
│   ├── alembic/              # 数据库迁移文件
│   ├── api/                  # API 相关（中间件、异常处理）
│   ├── config/               # 配置文件
│   ├── mixins/               # 数据库模型混入
│   ├── routes/               # 路由定义
│   ├── schemas/              # Pydantic 模型
│   ├── server/               # 服务器配置
│   ├── services/             # 业务服务
│   └── utils/                # 工具函数
├── imgs/                     # 图片存储目录
├── logs/                     # 日志目录
├── main.py                   # 应用入口
├── run.py                    # 运行脚本
├── alembic.ini              # Alembic 配置
├── pyproject.toml           # 项目配置
└── uv.lock                  # 依赖锁定文件
```

## 配置说明

主要配置项在 `bluenote/config/config.py` 中：

- **服务器配置**: 主机、端口、日志级别
- **数据库配置**: PostgreSQL 连接信息
- **JWT 配置**: 密钥、算法、过期时间
- **OpenAI 配置**: API 密钥、模型设置
- **日志配置**: 日志文件、格式、轮转设置
