import { NextRequest, NextResponse } from 'next/server'

// 模拟博客数据 - 实际项目中应该从数据库获取
const mockBlogs = [
  {
    id: 24,
    title: "健身入门指南",
    content: "# 健身入门指南\n\n## 为什么要健身？\n\n现代生活节奏快，**健身**已经成为保持身心健康的重要方式。\n\n### 健身的好处\n\n1. **增强体质** - 提高免疫力\n2. **改善心情** - 释放内啡肽\n3. **塑造体型** - 增肌减脂\n4. **提高专注力** - 改善工作效率\n\n## 新手训练计划\n\n### 第一阶段（1-4周）\n\n#### 周一：上肢训练\n- 俯卧撑 3组 × 10次\n- 哑铃弯举 3组 × 12次\n- 平板支撑 3组 × 30秒\n\n#### 周三：下肢训练\n- 深蹲 3组 × 15次\n- 弓步蹲 3组 × 10次（每腿）\n- 小腿提踵 3组 × 20次\n\n#### 周五：核心训练\n- 仰卧起坐 3组 × 15次\n- 俄罗斯转体 3组 × 20次\n- 死虫式 3组 × 10次（每侧）\n\n## 饮食建议\n\n```markdown\n早餐：燕麦 + 牛奶 + 水果\n午餐：鸡胸肉 + 糙米 + 蔬菜\n晚餐：鱼肉 + 红薯 + 沙拉\n```\n\n## 注意事项\n\n> ⚠️ **重要提醒**：\n> - 运动前要充分热身\n> - 循序渐进，不要急于求成\n> - 如有不适，立即停止运动\n\n---\n\n*坚持就是胜利，让我们一起开始健身之旅吧！* 💪",
    summary: "新手健身完整指南",
    status: "draft",
    visibility: "public",
    tags: ["健身", "运动", "健康"],
    category: "LIFE",
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    view_count: 0,
    created_at: "2025-07-16T14:36:38.279990Z",
    updated_at: "2025-07-16T14:36:38.279990Z"
  },
  {
    id: 23,
    title: "Git版本控制最佳实践",
    content: "# Git版本控制最佳实践\n\n## 简介\n\nGit是现代软件开发中不可或缺的版本控制工具。掌握Git的最佳实践能够显著提高团队协作效率。\n\n## 核心概念\n\n### 分支管理\n\n- **master/main分支**: 主分支，保持稳定\n- **develop分支**: 开发分支，集成新功能\n- **feature分支**: 功能分支，开发具体功能\n\n### 提交规范\n\n```bash\ngit commit -m \"feat: 添加用户登录功能\"\ngit commit -m \"fix: 修复登录页面样式问题\"\ngit commit -m \"docs: 更新API文档\"\n```\n\n## 常用命令\n\n| 命令 | 说明 |\n|------|------|\n| `git status` | 查看状态 |\n| `git add .` | 添加所有文件 |\n| `git commit -m` | 提交更改 |\n| `git push` | 推送到远程 |\n\n> **提示**: 经常使用 `git status` 查看当前状态，避免意外提交。\n\n## 总结\n\n良好的Git习惯是团队协作的基础，值得每个开发者深入学习。",
    summary: "Git版本控制工具使用指南",
    status: "published",
    visibility: "public",
    tags: ["Git", "版本控制", "开发工具"],
    category: "TECH",
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    view_count: 0,
    created_at: "2025-07-16T14:36:08.317129Z",
    updated_at: "2025-07-16T14:36:08.317129Z"
  },
  {
    id: 22,
    title: "咖啡文化探索",
    content: "咖啡不仅仅是一种饮品，更是一种文化。从意式浓缩到手冲单品，每种冲泡方式都有其独特的魅力。最近迷上了在家自己烘焙咖啡豆，享受从生豆到一杯香浓咖啡的整个过程。",
    summary: "咖啡爱好者的日常",
    status: "archived",
    visibility: "private",
    tags: ["咖啡", "生活方式", "兴趣爱好"],
    category: "LIFE",
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    view_count: 0,
    created_at: "2025-07-16T14:33:14.108376Z",
    updated_at: "2025-07-16T14:33:14.108376Z"
  },
  {
    id: 21,
    title: "机器学习算法对比分析",
    content: "在机器学习领域，选择合适的算法至关重要。本文对比了线性回归、决策树、随机森林和神经网络等常用算法的优缺点，并提供了实际应用场景的建议。",
    summary: "机器学习算法选择指南",
    status: "published",
    visibility: "public",
    tags: ["机器学习", "算法", "AI"],
    category: "TECH",
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    view_count: 0,
    created_at: "2025-07-16T14:32:43.159073Z",
    updated_at: "2025-07-16T14:32:43.159073Z"
  },
  {
    id: 20,
    title: "读书笔记：《人类简史》",
    content: "尤瓦尔·赫拉利的《人类简史》是一本令人深思的作品。作者从认知革命、农业革命到科学革命，梳理了人类发展的脉络。书中对于未来人工智能和生物技术的思考尤其引人深思。",
    summary: "《人类简史》读后感",
    status: "published",
    visibility: "private",
    tags: ["读书", "历史", "哲学"],
    category: "STUDY",
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    view_count: 0,
    created_at: "2025-07-16T14:32:15.535393Z",
    updated_at: "2025-07-16T14:32:15.535393Z"
  },
  {
    id: 19,
    title: "React Hooks最佳实践",
    content: "React Hooks彻底改变了我们编写React组件的方式。useState、useEffect、useContext等钩子函数让函数组件拥有了状态管理能力。本文总结了使用Hooks时需要注意的性能优化技巧。",
    summary: "React Hooks使用指南",
    status: "draft",
    visibility: "public",
    tags: ["React", "Hooks", "前端"],
    category: "TECH",
    like_count: 0,
    comment_count: 0,
    share_count: 0,
    view_count: 0,
    created_at: "2025-07-16T14:32:02.872819Z",
    updated_at: "2025-07-16T14:32:02.872819Z"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '6')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    // 尝试从外部API获取数据
    try {
      let externalApiUrl = `http://localhost:8000/v1/blogs?page=${page}&perPage=${perPage}`
      
      // 添加搜索参数
      if (search && search.trim()) {
        externalApiUrl += `&search=${encodeURIComponent(search.trim())}`
      }
      
      // 添加分类筛选
      if (category && category !== 'all') {
        externalApiUrl += `&category=${category}`
      }
      
      // 添加状态筛选
      if (status && status !== 'all') {
        externalApiUrl += `&status=${status}`
      }

      const response = await fetch(externalApiUrl, {
        headers: {
          'accept': 'application/json'
        }
      })

      if (response.ok) {
        const externalData = await response.json()
        
        // 如果外部API返回的是数组格式，需要转换为我们期望的格式
        if (Array.isArray(externalData)) {
          const apiResponse = {
            items: externalData,
            pagination: {
              page,
              perPage,
              total: externalData.length,
              totalPage: Math.ceil(externalData.length / perPage)
            }
          }
          return NextResponse.json(apiResponse)
        }
        
        // 如果外部API已经返回了正确的格式，直接返回
        return NextResponse.json(externalData)
      }
    } catch (externalError) {
      console.error('从外部API获取数据失败，使用模拟数据:', externalError)
    }

    // 如果外部API失败，使用模拟数据作为后备
    let filteredBlogs = [...mockBlogs]

    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase()
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchLower) ||
        blog.content.toLowerCase().includes(searchLower) ||
        blog.summary.toLowerCase().includes(searchLower) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // 分类过滤
    if (category && category !== 'all') {
      filteredBlogs = filteredBlogs.filter(blog => blog.category === category)
    }

    // 状态过滤
    if (status && status !== 'all') {
      filteredBlogs = filteredBlogs.filter(blog => blog.status === status)
    }

    // 分页
    const total = filteredBlogs.length
    const totalPage = Math.ceil(total / perPage)
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const items = filteredBlogs.slice(startIndex, endIndex)

    const response = {
      items,
      pagination: {
        page,
        perPage,
        total,
        totalPage
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('获取博客数据失败:', error)
    return NextResponse.json(
      { error: '获取博客数据失败' },
      { status: 500 }
    )
  }
}