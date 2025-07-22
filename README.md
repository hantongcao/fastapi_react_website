# BlueWeb - 个人博客系统

一个基于 Next.js 15 + FastAPI 构建的现代化全栈个人博客系统，支持博客管理、照片墙、联系人管理和 AI 助手功能。

## 🌟 项目特色

- 🚀 **现代化技术栈**: Next.js 15 + React 19 + FastAPI
- 📝 **博客管理**: 完整的博客文章 CRUD 操作
- 📸 **照片墙**: 支持照片上传、编辑、分类管理
- 👥 **联系人管理**: 联系表单和信息管理
- 🤖 **AI 助手**: 集成 OpenAI API 的智能对话
- 🔐 **身份认证**: JWT 身份验证和权限管理
- 🎨 **响应式设计**: 完美适配桌面端和移动端
- 🌙 **主题切换**: 支持明暗主题模式
- 📊 **数据库**: PostgreSQL + SQLAlchemy

## 🏗️ 项目架构

```
blueweb-jihu/
├── fe/                     # 前端 (Next.js)
│   ├── app/               # Next.js App Router
│   ├── components/        # React 组件
│   ├── hooks/            # 自定义 Hooks
│   └── public/           # 静态资源
├── be/                     # 后端 (FastAPI)
│   ├── bluenote/         # 主应用包
│   │   ├── routes/       # API 路由
│   │   ├── schemas/      # 数据模型
│   │   ├── services/     # 业务服务
│   │   └── utils/        # 工具函数
│   └── imgs/             # 图片存储
└── db/                     # 数据库文件
```

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15.2.4
- **UI 库**: React 19
- **样式**: Tailwind CSS
- **组件**: Radix UI + shadcn/ui
- **图标**: Lucide React
- **类型**: TypeScript

### 后端
- **框架**: FastAPI
- **数据库**: PostgreSQL
- **ORM**: SQLAlchemy + SQLModel
- **迁移**: Alembic
- **认证**: JWT
- **AI 服务**: OpenAI API
- **包管理**: uv

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+
- PostgreSQL (可选，默认使用 SQLite)
- uv (Python 包管理器)

### 1. 克隆项目

```bash
git clone https://jihulab.com/mahuatong/blueweb.git
cd blueweb-jihu
```

### 2. 后端设置

```bash
# 进入后端目录
cd be

# 使用 uv 安装依赖
uv sync --all-extras --index-url https://mirrors.aliyun.com/pypi/simple/

# 运行数据库迁移
uv run alembic upgrade head

# 启动后端服务
uv run python main.py
```

后端服务将在 `http://localhost:8000` 启动。

### 3. 前端设置

```bash
# 进入前端目录
cd fe

# 安装依赖
npm install
# 或使用 yarn
yarn install

# 复制环境配置文件
cp .env.example .env.local

# 启动前端服务
npm run dev
# 或使用 yarn
yarn dev
```

前端服务将在 `http://localhost:3000` 启动。

## 📋 功能模块

### 博客系统
- ✅ 博客文章展示和管理
- ✅ 文章分类和标签
- ✅ 富文本编辑器
- ✅ 文章搜索和筛选

### 照片墙
- ✅ 照片上传（支持拖拽）
- ✅ 照片编辑（标题、描述、分类）
- ✅ 照片分类管理
- ✅ 响应式瀑布流布局
- ✅ 图片懒加载

### 联系人管理
- ✅ 联系表单提交
- ✅ 联系信息管理
- ✅ 搜索和分页
- ✅ 联系统计

### AI 助手
- ✅ 智能对话功能
- ✅ 上下文记忆
- ✅ 示例提示词
- ✅ 流式响应

### 用户认证
- ✅ JWT 身份验证
- ✅ 登录/登出
- ✅ 权限管理
- ✅ 管理员功能

## 📚 API 文档

启动后端服务后，可以访问以下地址查看 API 文档：

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔧 配置说明

### 后端配置

主要配置项在 `be/bluenote/config/config.py` 中：

- **服务器配置**: 主机、端口、日志级别
- **数据库配置**: PostgreSQL 连接信息
- **JWT 配置**: 密钥、算法、过期时间
- **OpenAI 配置**: API 密钥、模型设置

### 前端配置

在 `fe/.env.local` 中配置：

```env
# API 基础地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# 其他配置项...
```

## 🎨 设计特色

- **现代化 UI**: 使用 shadcn/ui 组件库
- **响应式设计**: 完美适配各种设备
- **暗色模式**: 支持明暗主题切换
- **流畅动画**: CSS 动画提升用户体验
- **无障碍访问**: 遵循 WCAG 标准

## 🔄 开发工作流

### 代码规范
- 前端使用 ESLint + Prettier
- 后端遵循 PEP 8 规范
- 使用 TypeScript 进行类型检查
- Git 提交遵循 Conventional Commits

### 测试
```bash
# 前端测试
cd fe
npm run test

# 后端测试
cd be
uv run pytest
```

### 构建部署
```bash
# 前端构建
cd fe
npm run build

# 后端部署
cd be
uv run python main.py
```

## 🚨 常见问题

### 数据库连接问题
- 确认 PostgreSQL 服务已启动
- 检查数据库连接配置
- 运行数据库迁移命令

### 照片上传失败
- 检查文件大小限制
- 确认文件格式支持
- 验证存储目录权限

### AI 助手无响应
- 检查 OpenAI API 密钥配置
- 确认网络连接正常
- 查看后端日志错误信息

## 🔮 未来规划

- [ ] 移动端 App 开发
- [ ] 多语言国际化
- [ ] 评论系统
- [ ] 社交分享功能
- [ ] 搜索引擎优化
- [ ] 性能监控
- [ ] Docker 容器化部署
- [ ] CI/CD 自动化部署

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

**曹汉桐** - 全栈开发工程师

- 邮箱: caohantong@gmail.com
- 博客: [个人博客](http://localhost:3000)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和开源社区。

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
