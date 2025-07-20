# 贡献指南

感谢您对个人博客项目的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、设计、测试和反馈。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题报告](#问题报告)
- [功能请求](#功能请求)
- [代码审查](#代码审查)
- [发布流程](#发布流程)

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们作为贡献者和维护者承诺，无论年龄、体型、残疾、种族、性别认同和表达、经验水平、国籍、个人形象、种族、宗教或性取向如何，参与我们项目和社区的每个人都能享受无骚扰的体验。

### 我们的标准

有助于创造积极环境的行为包括：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同情

不可接受的行为包括：

- 使用性化的语言或图像以及不受欢迎的性关注或性骚扰
- 恶意评论、侮辱/贬损评论以及个人或政治攻击
- 公开或私下骚扰
- 未经明确许可发布他人的私人信息，如物理地址或电子地址
- 在专业环境中可能被合理认为不适当的其他行为

## 如何贡献

### 贡献类型

1. **代码贡献**
   - 新功能开发
   - Bug 修复
   - 性能优化
   - 重构代码

2. **文档贡献**
   - 改进现有文档
   - 添加新文档
   - 翻译文档
   - 修复文档错误

3. **设计贡献**
   - UI/UX 改进
   - 图标设计
   - 品牌设计

4. **测试贡献**
   - 编写单元测试
   - 编写集成测试
   - 手动测试
   - 性能测试

5. **其他贡献**
   - 问题报告
   - 功能建议
   - 社区支持

## 开发环境设置

### 前置要求

- Node.js 18.x 或更高版本
- npm 或 yarn
- Git
- 代码编辑器（推荐 VS Code）

### 设置步骤

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 fork 项目到你的账户
   ```

2. **克隆项目**
   ```bash
   git clone https://github.com/your-username/personal-blog-project.git
   cd personal-blog-project
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **设置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 文件，填入必要的环境变量
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **设置 Git hooks**
   ```bash
   npm run prepare
   ```

### 推荐的 VS Code 扩展

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client（API 测试）

## 代码规范

### TypeScript/JavaScript

- 使用 TypeScript 进行类型安全
- 遵循 ESLint 配置
- 使用 Prettier 进行代码格式化
- 优先使用函数式组件和 Hooks
- 使用有意义的变量和函数名

```typescript
// ✅ 好的示例
interface UserProfile {
  id: string
  name: string
  email: string
}

const UserCard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleUserUpdate = useCallback(async (userData: Partial<UserProfile>) => {
    setIsLoading(true)
    try {
      await updateUser(user.id, userData)
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user.id])
  
  return (
    <div className="user-card">
      {/* 组件内容 */}
    </div>
  )
}
```

### CSS/Styling

- 使用 Tailwind CSS 进行样式设计
- 遵循移动优先的响应式设计
- 使用语义化的类名
- 避免内联样式

```tsx
// ✅ 好的示例
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md md:flex-row md:space-y-0 md:space-x-6">
  <img className="w-full h-48 object-cover rounded-md md:w-48 md:h-32" src={imageUrl} alt={altText} />
  <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
</div>
```

### 文件组织

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础 UI 组件
│   ├── layout/         # 布局组件
│   └── feature/        # 功能组件
├── hooks/              # 自定义 Hooks
├── lib/                # 工具函数和配置
├── types/              # TypeScript 类型定义
├── data/               # 静态数据
└── app/                # Next.js App Router 页面
```

### 命名规范

- **文件名**: kebab-case（例如：`user-profile.tsx`）
- **组件名**: PascalCase（例如：`UserProfile`）
- **函数名**: camelCase（例如：`getUserProfile`）
- **常量**: UPPER_SNAKE_CASE（例如：`API_BASE_URL`）
- **类型/接口**: PascalCase（例如：`UserProfile`）

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交消息格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 相关
- `build`: 构建系统或外部依赖的变动

### 示例

```bash
# 新功能
git commit -m "feat(auth): add user authentication system"

# Bug 修复
git commit -m "fix(gallery): resolve image loading issue on mobile devices"

# 文档更新
git commit -m "docs: update installation instructions"

# 重构
git commit -m "refactor(components): extract reusable button component"
```

## Pull Request 流程

### 1. 创建分支

```bash
# 从 main 分支创建新分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. 开发和测试

```bash
# 开发过程中定期提交
git add .
git commit -m "feat: implement new feature"

# 运行测试
npm run test
npm run lint
npm run type-check
```

### 3. 推送分支

```bash
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

在 GitHub 上创建 Pull Request，包含以下信息：

- **标题**: 简洁描述变更内容
- **描述**: 详细说明变更原因和实现方式
- **测试**: 说明如何测试变更
- **截图**: 如果有 UI 变更，提供截图
- **相关 Issue**: 链接相关的 Issue

### PR 模板

```markdown
## 变更描述

简要描述此 PR 的变更内容。

## 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他

## 测试

- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成
- [ ] 性能测试完成（如适用）

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 没有引入新的警告
- [ ] 通过了所有 CI 检查

## 截图（如适用）

## 相关 Issue

Closes #issue_number
```

## 问题报告

### 报告 Bug

使用 GitHub Issues 报告 Bug，请包含：

1. **Bug 描述**: 清晰简洁的描述
2. **重现步骤**: 详细的重现步骤
3. **期望行为**: 描述期望的正确行为
4. **实际行为**: 描述实际发生的行为
5. **环境信息**: 操作系统、浏览器、Node.js 版本等
6. **截图**: 如果适用，提供截图
7. **额外信息**: 任何可能有助于解决问题的信息

### Bug 报告模板

```markdown
## Bug 描述

简洁清晰地描述 Bug。

## 重现步骤

1. 访问 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 期望行为

清晰简洁地描述期望发生的行为。

## 实际行为

清晰简洁地描述实际发生的行为。

## 截图

如果适用，添加截图来帮助解释问题。

## 环境信息

- 操作系统: [例如 macOS 12.0]
- 浏览器: [例如 Chrome 95.0]
- Node.js 版本: [例如 18.17.0]
- 项目版本: [例如 1.0.0]

## 额外信息

添加任何其他关于问题的信息。
```

## 功能请求

### 提出新功能

使用 GitHub Issues 提出功能请求，请包含：

1. **功能描述**: 清晰描述建议的功能
2. **使用场景**: 描述为什么需要这个功能
3. **解决方案**: 描述你希望如何实现
4. **替代方案**: 描述你考虑过的其他解决方案
5. **额外信息**: 任何其他相关信息

### 功能请求模板

```markdown
## 功能描述

清晰简洁地描述你希望添加的功能。

## 使用场景

描述这个功能解决的问题或满足的需求。

## 建议的解决方案

清晰简洁地描述你希望如何实现这个功能。

## 替代方案

清晰简洁地描述你考虑过的其他解决方案或功能。

## 额外信息

添加任何其他关于功能请求的信息或截图。
```

## 代码审查

### 审查原则

1. **功能性**: 代码是否按预期工作
2. **可读性**: 代码是否易于理解
3. **可维护性**: 代码是否易于修改和扩展
4. **性能**: 代码是否有性能问题
5. **安全性**: 代码是否有安全漏洞
6. **测试**: 是否有足够的测试覆盖

### 审查清单

- [ ] 代码逻辑正确
- [ ] 遵循项目规范
- [ ] 有适当的错误处理
- [ ] 有必要的测试
- [ ] 文档已更新
- [ ] 性能考虑
- [ ] 安全考虑
- [ ] 可访问性考虑

### 审查反馈

- 使用建设性的语言
- 解释为什么需要修改
- 提供具体的建议
- 认可好的代码实践

## 发布流程

### 版本号规范

我们使用 [Semantic Versioning](https://semver.org/)：

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能性新增
- **PATCH**: 向后兼容的问题修正

### 发布步骤

1. **更新版本号**
   ```bash
   npm version patch|minor|major
   ```

2. **更新 CHANGELOG**
   ```bash
   # 更新 CHANGELOG.md 文件
   ```

3. **创建发布分支**
   ```bash
   git checkout -b release/v1.0.0
   ```

4. **最终测试**
   ```bash
   npm run test:ci
   npm run build
   ```

5. **合并到 main**
   ```bash
   git checkout main
   git merge release/v1.0.0
   ```

6. **创建标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

7. **部署到生产环境**

## 社区

### 获取帮助

- 查看 [README.md](./README.md)
- 搜索现有的 Issues
- 创建新的 Issue
- 参与 Discussions

### 保持联系

- GitHub Issues: 技术问题和 Bug 报告
- GitHub Discussions: 一般讨论和问题
- Email: 私人或敏感问题

## 致谢

感谢所有为项目做出贡献的开发者！你们的贡献让这个项目变得更好。

### 贡献者

- 查看 [Contributors](https://github.com/your-username/personal-blog-project/graphs/contributors) 页面

---

再次感谢您的贡献！如果您有任何问题，请随时联系我们。