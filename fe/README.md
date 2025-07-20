# 个人博客项目

一个基于 Next.js 15 和 React 19 构建的现代化个人博客系统，支持照片上传、博客管理、AI助手等功能。

## 🚀 技术栈

- **前端框架**: Next.js 15.2.4
- **UI 框架**: React 19
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI + shadcn/ui
- **状态管理**: React Hooks
- **类型检查**: TypeScript
- **图标**: Lucide React

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── blog/              # 博客页面
│   ├── gallery/           # 照片墙页面
│   ├── photo-upload/      # 照片上传页面
│   └── photo-edit/        # 照片编辑页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── photo/            # 照片相关组件
│   ├── gallery/          # 画廊组件
│   └── shared/           # 共享组件
├── hooks/                # 自定义 Hooks
├── lib/                  # 工具函数和配置
├── data/                 # 静态数据
└── public/               # 静态资源
```

## 🔧 核心功能

### 照片管理系统
- ✅ 照片上传（支持拖拽）
- ✅ 照片编辑（标题、描述、分类、标签等）
- ✅ 照片删除
- ✅ 照片分类管理
- ✅ 响应式照片墙展示

### 博客系统
- ✅ 博客文章展示
- ✅ 文章分类和标签
- ✅ 响应式设计

### AI 助手
- ✅ 智能对话功能
- ✅ 示例提示词

### 用户认证
- ✅ 登录/登出
- ✅ 权限管理
- ✅ 管理员功能

## 🎨 设计特色

- **现代化 UI**: 使用 shadcn/ui 组件库，提供一致的设计语言
- **响应式设计**: 完美适配桌面端和移动端
- **暗色模式**: 支持明暗主题切换
- **流畅动画**: 使用 CSS 动画提升用户体验
- **无障碍访问**: 遵循 WCAG 标准

## 🛠️ 开发指南

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 环境配置
1. 复制 `.env.example` 为 `.env.local`
2. 配置相应的环境变量

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
npm start
```

## 📝 代码规范

### 组件开发
- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 最佳实践
- 组件文件使用 PascalCase 命名
- 使用 shadcn/ui 组件作为基础

### 状态管理
- 使用 React Hooks (useState, useEffect, useCallback)
- 复杂状态逻辑封装为自定义 Hooks
- API 调用统一使用 `use-photo-api` Hook

### 错误处理
- 统一使用 `error-handler.ts` 处理错误
- 提供用户友好的错误提示
- 记录详细的错误日志

### 样式规范
- 使用 Tailwind CSS 类名
- 遵循移动端优先的响应式设计
- 使用 CSS 变量管理主题色彩

## 🔄 数据流

### 照片上传流程
1. 用户选择文件 → 前端验证
2. 创建 FormData → 调用上传 API
3. 后端处理文件 → 返回结果
4. 更新 UI 状态 → 显示结果

### 照片编辑流程
1. 获取照片数据 → 填充表单
2. 用户修改信息 → 前端验证
3. 提交更新请求 → 后端验证
4. 更新成功 → 跳转页面

## 🚨 常见问题

### 照片上传失败
- 检查文件大小是否超限
- 确认文件格式是否支持
- 验证网络连接状态

### 分类验证错误
- 确保使用正确的分类值（大写格式）
- 检查前后端分类配置是否一致

### 权限错误
- 确认用户已登录
- 验证管理员权限
- 检查 token 是否有效

## 🔮 未来规划

- [ ] 图片压缩和优化
- [ ] 批量上传功能
- [ ] 照片标签自动识别
- [ ] 社交分享功能
- [ ] 评论系统
- [ ] 搜索功能
- [ ] PWA 支持

## 📄 许可证

MIT License