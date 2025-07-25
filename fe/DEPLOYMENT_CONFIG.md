# 部署配置指南

本文档说明如何在不同环境下配置API地址和端口，确保应用能够正确运行。

## 环境变量配置

### 前端服务器配置

#### 1. 本地开发环境
```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### 2. 网络访问环境 (局域网)
```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://192.168.151.110:8082
NEXT_PUBLIC_SITE_URL=http://192.168.151.110:8082
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### 3. 生产环境
```bash
# .env.local
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### 后端API配置

```bash
# .env.local
API_BASE_URL=http://localhost:8000/v1
AUTH_API_URL=http://localhost:8000/v1/auth
CONTACT_API_URL=http://localhost:8000/v1/contacts
PHOTOS_API_URL=http://localhost:8000/v1/photos
```

## 启动命令

### 不同端口启动前端服务

```bash
# 默认端口 3000
npm run dev

# 指定端口 8082
PORT=8082 npm run dev

# 生产模式指定端口
PORT=8082 npm start
```

### 后端服务启动

```bash
# 进入后端目录
cd be

# 启动后端服务 (默认端口 8000)
python run.py

# 或使用 uvicorn 指定端口
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API调用架构

### 客户端组件 (Client Components)
- 使用相对路径调用前端API路由: `/api/blogs`, `/api/photos`
- 前端API路由再转发到后端服务

### 服务器端组件 (Server Actions)
- 使用完整URL调用前端API路由
- 通过 `NEXT_PUBLIC_SITE_URL` 环境变量构建完整URL
- 使用 `buildApiUrl()` 工具函数自动处理

### 直接后端调用
- Server Actions中可以直接调用后端API
- 使用 `buildBackendApiUrl()` 工具函数
- 通过 `API_BASE_URL` 等环境变量配置

## 工具函数使用

### buildApiUrl()
```typescript
import { buildApiUrl } from '@/lib/api-utils'

// 客户端调用
const url = buildApiUrl('/api/blogs') // 返回: '/api/blogs'

// 服务器端调用
const url = buildApiUrl('/api/blogs', true) // 返回: 'http://192.168.151.110:8082/api/blogs'
```

### buildBackendApiUrl()
```typescript
import { buildBackendApiUrl } from '@/lib/api-utils'

const url = buildBackendApiUrl('blogs') // 返回: 'http://localhost:8000/v1/blogs'
```

### apiFetch()
```typescript
import { apiFetch } from '@/lib/api-utils'

// 调用前端API路由
const response = await apiFetch('/api/blogs')

// 直接调用后端API
const response = await apiFetch('blogs', {}, true)
```

## 常见问题解决

### 1. "Failed to parse URL" 错误
- **原因**: Server Actions中使用了相对路径
- **解决**: 确保 `NEXT_PUBLIC_SITE_URL` 配置正确，使用 `buildApiUrl(path, true)`

### 2. 图片无法加载
- **原因**: 图片URL使用了错误的域名或端口
- **解决**: 确保上传API返回完整的图片URL，使用 `getSiteBaseUrl()`

### 3. 网络访问时API调用失败
- **原因**: 环境变量配置了localhost而不是网络IP
- **解决**: 更新 `NEXT_PUBLIC_SITE_URL` 为网络可访问的地址

### 4. 端口冲突
- **解决**: 使用 `PORT=端口号` 环境变量启动服务

## 部署检查清单

- [ ] 确认 `.env.local` 中所有URL配置正确
- [ ] 测试客户端API调用
- [ ] 测试服务器端API调用 (Server Actions)
- [ ] 测试图片上传和显示
- [ ] 测试不同端口启动
- [ ] 测试网络访问 (如果需要)
- [ ] 检查后端服务是否正常运行

## 环境变量说明

| 变量名 | 用途 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_BASE_URL` | 前端基础URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Server Actions使用的完整URL | `http://192.168.151.110:8082` |
| `NEXT_PUBLIC_API_BASE_URL` | 后端API基础URL | `http://localhost:8000` |
| `API_BASE_URL` | 服务器端后端API URL | `http://localhost:8000/v1` |
| `AUTH_API_URL` | 认证API URL | `http://localhost:8000/v1/auth` |
| `CONTACT_API_URL` | 联系API URL | `http://localhost:8000/v1/contacts` |
| `PHOTOS_API_URL` | 照片API URL | `http://localhost:8000/v1/photos` |