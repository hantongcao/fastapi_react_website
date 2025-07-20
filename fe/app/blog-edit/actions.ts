"use server"

import { redirect } from "next/navigation"

// 获取博客详情
export async function getBlogData(blogId: string, authToken: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/blogs/${blogId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return {
          status: 'error' as const,
          message: '未授权访问，请重新登录',
        }
      }
      if (response.status === 404) {
        return {
          status: 'error' as const,
          message: '博客不存在',
        }
      }
      const errorData = await response.json().catch(() => ({ message: '获取博客失败' }))
      return {
        status: 'error' as const,
        message: errorData.message || '获取博客失败',
      }
    }

    const blogData = await response.json()
    return {
      status: 'success' as const,
      data: blogData,
    }
  } catch (error) {
    console.error('获取博客数据失败:', error)
    return {
      status: 'error' as const,
      message: '网络错误，请检查连接',
    }
  }
}

// 更新博客数据
export async function updateBlogData(formData: FormData) {
  try {
    // 从表单数据中提取字段
    const blogId = formData.get('blogId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const summary = formData.get('summary') as string
    const category = formData.get('category') as string
    const tagsJson = formData.get('tags') as string
    const status = formData.get('status') as string
    const visibility = formData.get('visibility') as string
    const authToken = formData.get('authToken') as string
    const userIsAdmin = formData.get('userIsAdmin') as string

    // 验证用户权限
    if (!authToken || userIsAdmin !== 'true') {
      return {
        status: 'error' as const,
        message: '权限不足，只有管理员可以编辑博客',
      }
    }

    // 验证必填字段
    if (!title?.trim()) {
      return {
        status: 'error' as const,
        message: '标题不能为空',
      }
    }

    if (!content?.trim()) {
      return {
        status: 'error' as const,
        message: '内容不能为空',
      }
    }

    if (!category) {
      return {
        status: 'error' as const,
        message: '请选择分类',
      }
    }

    // 解析标签
    let tags: string[] = []
    try {
      tags = JSON.parse(tagsJson || '[]')
    } catch {
      tags = []
    }

    // 构建请求数据
    const requestData = {
      title: title.trim(),
      content: content.trim(),
      summary: summary?.trim() || '',
      category,
      tags,
      status,
      visibility,
    }

    // 发送更新请求
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return {
          status: 'error' as const,
          message: '未授权访问，请重新登录',
        }
      }
      if (response.status === 404) {
        return {
          status: 'error' as const,
          message: '博客不存在',
        }
      }
      const errorData = await response.json().catch(() => ({ message: '更新失败' }))
      return {
        status: 'error' as const,
        message: errorData.message || '更新博客失败',
      }
    }

    const result = await response.json()
    
    // 返回成功状态，让客户端处理重定向
    return {
      status: 'success' as const,
      message: '博客更新成功',
      data: result,
      redirectTo: `/blog/${result.id}`
    }
    
  } catch (error) {
    console.error('更新博客失败:', error)
    return {
      status: 'error' as const,
      message: '网络错误，请检查连接',
    }
  }
}