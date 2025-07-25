# 生产环境图片功能测试指南

## 问题描述
在 `npm build` + `npm start` 生产环境下，照片上传后在照片墙中图片加载不出来，但在 `npm run dev` 开发环境下正常。

## 问题原因
原因是上传API返回的图片URL使用了 `getSiteBaseUrl()` 生成绝对路径，在生产环境下可能返回错误的域名，导致图片路径不正确。

## 修复方案
修改 `/app/api/upload/route.ts` 文件，将返回的图片URL从绝对路径改为相对路径：

```typescript
// 修复前
const fileUrl = `${getSiteBaseUrl()}/uploads/${fileName}`

// 修复后
const fileUrl = `/uploads/${fileName}`
```

## 测试步骤

### 1. 构建和启动生产环境
```bash
cd fe
npm run build
npm start
```

### 2. 测试图片上传
1. 访问 http://localhost:3000
2. 登录管理员账号（admin/admin123）
3. 进入照片上传页面 `/photo-upload`
4. 上传一张测试图片
5. 填写标题、描述等信息
6. 提交照片

### 3. 验证图片显示
1. 进入照片墙页面 `/gallery`
2. 检查新上传的图片是否能正常显示
3. 点击图片查看大图是否正常

### 4. 检查图片URL
1. 在浏览器开发者工具中检查图片元素
2. 确认图片URL格式为 `/uploads/filename.jpg`
3. 直接访问图片URL确认可以正常加载

## 预期结果
- ✅ 图片上传成功
- ✅ 照片墙中图片正常显示
- ✅ 图片URL使用相对路径格式
- ✅ 生产环境和开发环境表现一致

## 相关文件
- `/app/api/upload/route.ts` - 文件上传API
- `/app/api/images/[...path]/route.ts` - 图片服务API
- `/components/photo/photo-upload-form.tsx` - 照片上传组件
- `/app/gallery/page.tsx` - 照片墙页面
- `/next.config.js` - Next.js配置（已设置 `images.unoptimized: true`）

## 注意事项
1. 确保 `public/uploads` 目录存在且有写入权限
2. 生产环境下静态文件由Next.js自动处理
3. 图片优化已禁用（`unoptimized: true`）以避免生产模式下的问题