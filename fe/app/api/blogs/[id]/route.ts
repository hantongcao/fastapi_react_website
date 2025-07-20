import { NextRequest, NextResponse } from 'next/server'

// 模拟单篇博客数据
const MOCK_BLOG_DETAIL = {
  id: 20,
  title: "深入理解 React Hooks 的工作原理",
  content: `# React Hooks 深度解析

## 什么是 React Hooks？

React Hooks 是 React 16.8 引入的新特性，它让你在不编写 class 的情况下使用 state 以及其他的 React 特性。

### 为什么需要 Hooks？

1. **在组件之间复用状态逻辑很难**
2. **复杂组件变得难以理解**
3. **难以理解的 class**

## 常用的 Hooks

### useState

\`\`\`javascript
import React, { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Hook 规则

### 只在最顶层使用 Hook

**不要在循环，条件或嵌套函数中调用 Hook。** 确保总是在你的 React 函数的最顶层调用他们。

### 只在 React 函数中调用 Hook

**不要在普通的 JavaScript 函数中调用 Hook。**你可以：

- ✅ 在 React 的函数组件中调用 Hook
- ✅ 在自定义 Hook 中调用其他 Hook

## 自定义 Hook

自定义 Hook 是一个函数，其名称以 "use" 开头，函数内部可以调用其他的 Hook。

\`\`\`javascript
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }

    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
\`\`\`

## 总结

React Hooks 为函数组件提供了强大的能力，让我们能够：

- 在函数组件中使用状态
- 处理副作用
- 复用状态逻辑
- 简化组件结构

通过合理使用 Hooks，我们可以编写更加简洁、可维护的 React 代码。`,
  summary: "深入探讨 React Hooks 的核心概念、使用方法和最佳实践，帮助开发者更好地理解和应用这一重要特性。",
  status: "published",
  visibility: "public",
  tags: ["React", "Hooks", "前端开发", "JavaScript"],
  category: "技术分享",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z",
  author: {
    name: "技术博主",
    avatar: "/placeholder-user.jpg"
  },
  stats: {
    views: 1250,
    likes: 89,
    comments: 23,
    shares: 15
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 从外部API获取博客数据
    const externalApiUrl = `http://localhost:8000/v1/blogs/${id}`
    
    try {
      const response = await fetch(externalApiUrl, {
        headers: {
          'accept': 'application/json'
        }
      })
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        )
      }
      
      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`)
      }
      
      const blogData = await response.json()
      
      // 转换外部API数据格式为前端需要的格式
      const transformedBlog = {
        id: blogData.id,
        title: blogData.title,
        content: blogData.content,
        summary: blogData.summary,
        status: blogData.status,
        visibility: blogData.visibility,
        tags: blogData.tags || [],
        category: blogData.category,
        created_at: blogData.created_at,
        updated_at: blogData.updated_at,
        author: {
          name: "技术博主",
          avatar: "/placeholder-user.jpg"
        },
        stats: {
          views: blogData.view_count || 0,
          likes: blogData.like_count || 0,
          comments: blogData.comment_count || 0,
          shares: blogData.share_count || 0
        }
      }
      
      return NextResponse.json(transformedBlog)
    } catch (fetchError) {
      console.error('从外部API获取数据失败:', fetchError)
      
      // 如果外部API失败，返回模拟数据作为后备
      if (id === '20') {
        return NextResponse.json(MOCK_BLOG_DETAIL)
      }
      
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('获取博客详情失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT方法：更新博客
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // 验证请求体
    const { title, content, summary, category, tags, status, visibility } = body
    
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }
    
    // 获取Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }
    
    // 调用外部API更新博客
    const externalApiUrl = `http://localhost:8000/v1/blogs/${id}`
    
    try {
      const response = await fetch(externalApiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'accept': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary?.trim() || '',
          category,
          tags: tags || [],
          status: status || 'draft',
          visibility: visibility || 'public'
        })
      })
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        )
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Update failed' }))
        return NextResponse.json(
          { error: errorData.message || 'Failed to update blog' },
          { status: response.status }
        )
      }
      
      const updatedBlog = await response.json()
      
      // 转换外部API数据格式为前端需要的格式
      const transformedBlog = {
        id: updatedBlog.id,
        title: updatedBlog.title,
        content: updatedBlog.content,
        summary: updatedBlog.summary,
        status: updatedBlog.status,
        visibility: updatedBlog.visibility,
        tags: updatedBlog.tags || [],
        category: updatedBlog.category,
        created_at: updatedBlog.created_at,
        updated_at: updatedBlog.updated_at,
        author: {
          name: "技术博主",
          avatar: "/placeholder-user.jpg"
        },
        stats: {
          views: updatedBlog.view_count || 0,
          likes: updatedBlog.like_count || 0,
          comments: updatedBlog.comment_count || 0,
          shares: updatedBlog.share_count || 0
        }
      }
      
      return NextResponse.json(transformedBlog)
    } catch (fetchError) {
      console.error('调用外部API更新博客失败:', fetchError)
      return NextResponse.json(
        { error: 'Failed to connect to external API' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('更新博客失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}