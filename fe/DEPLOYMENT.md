# 部署指南

本文档提供了个人博客项目的详细部署指南，包括多种部署方式和最佳实践。

## 目录

- [环境要求](#环境要求)
- [部署前准备](#部署前准备)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)
- [Docker 部署](#docker-部署)
- [自托管部署](#自托管部署)
- [环境变量配置](#环境变量配置)
- [性能优化](#性能优化)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)

## 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器
- Git

## 部署前准备

### 1. 代码质量检查

```bash
# 运行代码检查
npm run lint
npm run type-check
npm run test:ci

# 格式化代码
npm run format
```

### 2. 构建测试

```bash
# 本地构建测试
npm run build
npm start
```

### 3. 性能测试

```bash
# 运行 Lighthouse 测试
npm run lighthouse
```

## Vercel 部署

### 方式一：通过 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

### 方式二：通过 Git 集成

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 控制台导入项目
3. 配置环境变量
4. 部署

### Vercel 配置文件

创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Netlify 部署

### 通过 Git 集成

1. 将代码推送到 Git 仓库
2. 在 Netlify 控制台连接仓库
3. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
4. 配置环境变量
5. 部署

### Netlify 配置文件

创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Docker 部署

### Dockerfile

```dockerfile
# 多阶段构建
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### 构建和运行

```bash
# 构建镜像
docker build -t personal-blog .

# 运行容器
docker run -p 3000:3000 personal-blog

# 使用 Docker Compose
docker-compose up -d
```

## 自托管部署

### 使用 PM2

1. 安装 PM2：
```bash
npm install -g pm2
```

2. 创建 PM2 配置文件 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'personal-blog',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/your/app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
}
```

3. 启动应用：
```bash
pm2 start ecosystem.config.js
```

### Nginx 反向代理

创建 Nginx 配置文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

## 环境变量配置

### 生产环境变量

```bash
# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# API 配置
API_BASE_URL=https://api.your-domain.com
API_TIMEOUT=30000

# 数据库配置（如果使用）
DATABASE_URL=postgresql://user:password@host:port/database

# 第三方服务
EAZYTEC_AI_API_KEY=your-api-key
EAZYTEC_AI_BASE_URL=https://api.eazytec.com

# 安全配置
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# 监控配置
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

## 性能优化

### 1. 静态资源优化

- 启用 Gzip/Brotli 压缩
- 配置 CDN
- 优化图片格式（WebP, AVIF）
- 使用适当的缓存策略

### 2. 代码分割

- 使用动态导入
- 配置 Webpack 分包策略
- 预加载关键资源

### 3. 服务器优化

- 启用 HTTP/2
- 配置适当的缓存头
- 使用负载均衡

## 监控和日志

### 1. 应用监控

```javascript
// 集成 Sentry
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### 2. 性能监控

- 使用 Web Vitals
- 配置 Lighthouse CI
- 监控 API 响应时间

### 3. 日志管理

```javascript
// 结构化日志
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 清除缓存：`npm run clean`
   - 重新安装依赖：`rm -rf node_modules && npm install`

2. **运行时错误**
   - 检查环境变量配置
   - 查看应用日志
   - 检查网络连接

3. **性能问题**
   - 分析 Bundle 大小
   - 检查图片优化
   - 优化数据库查询

### 调试工具

```bash
# 分析 Bundle 大小
npm run analyze

# 性能分析
npm run lighthouse

# 内存使用分析
node --inspect server.js
```

## 安全最佳实践

1. **HTTPS 配置**
   - 使用有效的 SSL 证书
   - 配置 HSTS
   - 禁用不安全的协议

2. **安全头配置**
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options

3. **依赖安全**
   - 定期更新依赖
   - 运行安全审计：`npm audit`
   - 使用 Dependabot

## 备份和恢复

1. **代码备份**
   - 使用 Git 版本控制
   - 定期推送到远程仓库

2. **数据备份**
   - 定期备份数据库
   - 备份用户上传的文件

3. **配置备份**
   - 备份环境变量
   - 备份服务器配置

---

如有问题，请查看项目文档或提交 Issue。