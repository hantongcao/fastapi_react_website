# 部署指南 Deployment Guide

本指南将帮助您在不同的IP地址和端口上部署前端和后端服务。

## 📋 目录

- [快速开始](#快速开始)
- [环境变量配置](#环境变量配置)
- [部署场景](#部署场景)
- [启动命令](#启动命令)
- [常见问题](#常见问题)

## 🚀 快速开始

### 1. 配置环境变量

复制部署配置示例文件：
```bash
cd fe
cp .env.deployment.example .env.local
```

### 2. 修改配置

编辑 `.env.local` 文件，设置您的IP地址和端口：

```bash
# 前端服务器配置
NEXT_PUBLIC_FRONTEND_HOST=您的前端IP
NEXT_PUBLIC_FRONTEND_PORT=您的前端端口

# 后端服务器配置
NEXT_PUBLIC_BACKEND_HOST=您的后端IP
NEXT_PUBLIC_BACKEND_PORT=您的后端端口
```

### 3. 启动服务

```bash
# 启动后端服务
cd be
uv run uvicorn bluenote.server.app:create_app --factory --host 您的后端IP --port 您的后端端口

# 启动前端服务
cd fe
PORT=您的前端端口 npm run dev
```

## ⚙️ 环境变量配置

### 前端环境变量

在 `fe/` 目录下创建 `.env.local` 文件：

```bash
# 前端服务器配置
NEXT_PUBLIC_FRONTEND_HOST=your_server_ip
NEXT_PUBLIC_FRONTEND_PORT=3000

# 后端服务器配置  
NEXT_PUBLIC_BACKEND_HOST=your_server_ip
NEXT_PUBLIC_BACKEND_PORT=8000

# 重要：服务器端API调用URL配置
NEXT_PUBLIC_SITE_URL=http://${NEXT_PUBLIC_FRONTEND_HOST}:${NEXT_PUBLIC_FRONTEND_PORT}
NEXT_PUBLIC_API_BASE_URL=http://${NEXT_PUBLIC_BACKEND_HOST}:${NEXT_PUBLIC_BACKEND_PORT}
```

**注意：** `NEXT_PUBLIC_SITE_URL` 是关键配置，用于服务器端API调用。如果不设置此变量，博客编辑等功能可能会出现连接错误。

### 核心配置变量

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_FRONTEND_HOST` | 前端服务器IP地址 | `192.168.1.100` |
| `NEXT_PUBLIC_FRONTEND_PORT` | 前端服务器端口 | `3000` |
| `NEXT_PUBLIC_BACKEND_HOST` | 后端服务器IP地址 | `192.168.1.100` |
| `NEXT_PUBLIC_BACKEND_PORT` | 后端服务器端口 | `8000` |

### 自动生成的URL

以下URL会根据上述配置自动生成，无需手动修改：

- `NEXT_PUBLIC_BASE_URL`: 前端服务地址
- `NEXT_PUBLIC_SITE_URL`: 站点URL
- `NEXT_PUBLIC_API_BASE_URL`: 后端API基础地址
- `CONTACT_API_URL`: 联系API地址
- `AUTH_API_URL`: 认证API地址
- `PHOTOS_API_URL`: 照片API地址
- `BLOGS_API_URL`: 博客API地址

## 🏗️ 部署场景

### 场景1: 本地开发环境

```bash
# .env.local
NEXT_PUBLIC_FRONTEND_HOST=localhost
NEXT_PUBLIC_FRONTEND_PORT=3000
NEXT_PUBLIC_BACKEND_HOST=localhost
NEXT_PUBLIC_BACKEND_PORT=8000
```

**启动命令：**
```bash
# 后端
cd be
uv run uvicorn bluenote.server.app:create_app --factory --host localhost --port 8000 --reload

# 前端
cd fe
PORT=3000 npm run dev
```

### 场景2: 同一台服务器，不同端口

```bash
# .env.local
NEXT_PUBLIC_FRONTEND_HOST=192.168.1.100
NEXT_PUBLIC_FRONTEND_PORT=3000
NEXT_PUBLIC_BACKEND_HOST=192.168.1.100
NEXT_PUBLIC_BACKEND_PORT=8000
```

**启动命令：**
```bash
# 后端
cd be
uv run uvicorn bluenote.server.app:create_app --factory --host 192.168.1.100 --port 8000

# 前端
cd fe
PORT=3000 npm run dev
```

### 场景3: 不同服务器部署

```bash
# .env.local (在前端服务器上)
NEXT_PUBLIC_FRONTEND_HOST=192.168.1.100  # 前端服务器IP
NEXT_PUBLIC_FRONTEND_PORT=3000
NEXT_PUBLIC_BACKEND_HOST=192.168.1.101   # 后端服务器IP
NEXT_PUBLIC_BACKEND_PORT=8000
```

**启动命令：**
```bash
# 在后端服务器 (192.168.1.101) 上
cd be
uv run uvicorn bluenote.server.app:create_app --factory --host 0.0.0.0 --port 8000

# 在前端服务器 (192.168.1.100) 上
cd fe
PORT=3000 npm run dev
```

### 场景4: 生产环境部署

```bash
# .env.local
NEXT_PUBLIC_FRONTEND_HOST=www.yourdomain.com
NEXT_PUBLIC_FRONTEND_PORT=80
NEXT_PUBLIC_BACKEND_HOST=api.yourdomain.com
NEXT_PUBLIC_BACKEND_PORT=80
```

**启动命令：**
```bash
# 后端 (生产环境)
cd be
uv run uvicorn bluenote.server.app:create_app --factory --host 0.0.0.0 --port 80

# 前端 (生产环境)
cd fe
npm run build
PORT=80 npm start
```

## 🔧 启动命令参考

### 后端启动选项

```bash
# 开发环境 (带热重载)
uv run uvicorn bluenote.server.app:create_app --factory --host IP地址 --port 端口号 --reload

# 生产环境
uv run uvicorn bluenote.server.app:create_app --factory --host IP地址 --port 端口号

# 绑定所有网络接口 (允许外部访问)
uv run uvicorn bluenote.server.app:create_app --factory --host 0.0.0.0 --port 端口号
```

### 前端启动选项

```bash
# 开发环境
PORT=端口号 npm run dev

# 生产环境
npm run build
PORT=端口号 npm start

# 指定主机和端口
HOST=IP地址 PORT=端口号 npm run dev
```

## 🔍 验证部署

### 1. 检查后端服务

```bash
# 检查后端API是否正常
curl http://您的后端IP:您的后端端口/v1/photos

# 检查联系API
curl http://您的后端IP:您的后端端口/v1/contacts
```

### 2. 检查前端服务

在浏览器中访问：
- 主页: `http://您的前端IP:您的前端端口/`
- 联系页面: `http://您的前端IP:您的前端端口/contact`
- 联系详情: `http://您的前端IP:您的前端端口/contact-details`
- 照片画廊: `http://您的前端IP:您的前端端口/gallery`

## 🔧 故障排除

### 常见问题

1. **博客编辑页面连接错误**
   
   **错误信息：**
   ```
   获取博客数据失败: TypeError: fetch failed
   Error: connect ECONNREFUSED 127.0.0.1:3000
   ```
   
   **原因：** 服务器端API调用使用了错误的URL（localhost:3000）
   
   **解决方案：**
   - 确保在 `fe/.env.local` 中正确设置了环境变量：
     ```bash
     NEXT_PUBLIC_FRONTEND_HOST=your_actual_server_ip
     NEXT_PUBLIC_FRONTEND_PORT=3000
     NEXT_PUBLIC_SITE_URL=http://your_actual_server_ip:3000
     ```
   - 重启前端服务：
     ```bash
     cd fe && npm run build && npm start
     ```

2. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   lsof -i :8000
   
   # 杀死占用进程
   kill -9 <PID>
   ```

3. **权限问题**
   ```bash
   # 给脚本执行权限
   chmod +x deploy.sh
   ```

4. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证数据库连接配置
   - 确认数据库文件路径正确

## ❓ 常见问题

### Q1: 环境变量不生效？

**解决方案：**
1. 确保 `.env.local` 文件在 `fe` 目录下
2. 重启前端服务
3. 检查变量名是否正确（注意大小写）

### Q2: 无法访问后端API？

**解决方案：**
1. 检查后端服务是否正常启动
2. 确认防火墙设置允许相应端口
3. 验证IP地址和端口配置是否正确

### Q3: 跨域问题？

**解决方案：**
1. 确保后端CORS配置正确
2. 检查前端API调用的URL是否正确
3. 在开发环境中，可以使用代理配置

### Q4: 联系表单提交失败？

**解决方案：**
1. 检查 `CONTACT_API_URL` 配置是否正确
2. 验证后端联系API是否正常工作
3. 查看浏览器控制台和后端日志

### Q5: 如何在Docker中部署？

**解决方案：**
```dockerfile
# 在Dockerfile中设置环境变量
ENV NEXT_PUBLIC_FRONTEND_HOST=your_frontend_host
ENV NEXT_PUBLIC_FRONTEND_PORT=your_frontend_port
ENV NEXT_PUBLIC_BACKEND_HOST=your_backend_host
ENV NEXT_PUBLIC_BACKEND_PORT=your_backend_port
```

## 📞 技术支持

如果您在部署过程中遇到问题，请：

1. 检查日志文件
2. 验证网络连接
3. 确认配置文件格式正确
4. 查看本指南的常见问题部分

---

**注意：** 在生产环境中，建议使用HTTPS协议并配置适当的安全措施。