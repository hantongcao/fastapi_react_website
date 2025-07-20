"use server"

import { API_CONFIG } from "@/lib/config"

export interface BlogSubmitState {
  message: string
  status: "success" | "error" | "idle"
}

export async function submitBlogData(
  formData: FormData
): Promise<BlogSubmitState> {
  console.log("=== Blog Submit Server Action Called ===")
  console.log("FormData entries:")
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`)
  }
  
  const title = formData.get("title")
  const content = formData.get("content")
  const summary = formData.get("summary")
  const category = formData.get("category")
  const tags = formData.get("tags")
  const status = formData.get("status")
  const visibility = formData.get("visibility")
  const authToken = formData.get("authToken")
  const userIsAdmin = formData.get("userIsAdmin")

  // 解析标签
  let parsedTags: string[] = []
  try {
    if (tags && typeof tags === 'string') {
      parsedTags = JSON.parse(tags)
    }
  } catch (error) {
    console.error('解析标签失败:', error)
    return {
      status: 'error',
      message: '标签格式错误'
    }
  }

  // 验证必填字段
  if (!title || typeof title !== 'string' || !title.trim()) {
    return {
      status: 'error',
      message: '标题不能为空'
    }
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    return {
      status: 'error',
      message: '内容不能为空'
    }
  }

  if (!category || typeof category !== 'string') {
    return {
      status: 'error',
      message: '请选择分类'
    }
  }

  // 验证用户权限
  if (!authToken || typeof authToken !== 'string') {
    return {
      status: 'error',
      message: '未找到认证令牌，请重新登录'
    }
  }

  if (userIsAdmin !== 'true') {
    return {
      status: 'error',
      message: '权限不足，只有管理员可以发布博客'
    }
  }

  // 构建请求数据
  const blogData = {
    title: title.toString().trim(),
    content: content.toString().trim(),
    summary: summary?.toString().trim() || '',
    category: category.toString(),
    tags: parsedTags,
    status: status?.toString() || 'draft',
    visibility: visibility?.toString() || 'public'
  }

  console.log('准备发送的博客数据:', blogData)

  try {
    // 调用外部API
    const apiUrl = `${API_CONFIG.API_BASE_URL}/blogs`
    console.log('调用API:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(blogData),
    })

    console.log('API响应状态:', response.status)
    
    if (!response.ok) {
      let errorMessage = '发布博客失败'
      try {
        const errorData = await response.json()
        console.log('API错误响应:', errorData)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (parseError) {
        console.error('解析错误响应失败:', parseError)
        const responseText = await response.text()
        console.log('原始错误响应:', responseText)
      }
      
      return {
        status: 'error',
        message: errorMessage
      }
    }

    const result = await response.json()
    console.log('API成功响应:', result)
    
    return {
      status: 'success',
      message: '博客发布成功！'
    }
    
  } catch (error) {
    console.error('发布博客时发生错误:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '发布博客时发生未知错误'
    }
  }
}