// 错误处理工具函数

export interface ApiError {
  message: string
  status?: number
  code?: string
}

// 将API错误转换为用户友好的消息
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return '发生未知错误，请重试'
}

// 处理HTTP响应错误
export async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let errorMessage = `请求失败: ${response.status}`
    
    try {
      const errorData = await response.json()
      if (errorData.error || errorData.message) {
        errorMessage = errorData.error || errorData.message
      }
    } catch (e) {
      // 如果无法解析错误响应，使用默认错误信息
    }
    
    const apiError: ApiError = {
      message: errorMessage,
      status: response.status
    }
    
    throw apiError
  }
  
  return response.json()
}

// 根据HTTP状态码返回用户友好的错误消息
export function getStatusErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '请求参数错误，请检查输入信息'
    case 401:
      return '登录已过期，请重新登录'
    case 403:
      return '没有权限执行此操作'
    case 404:
      return '请求的资源不存在'
    case 422:
      return '数据验证失败，请检查输入信息'
    case 429:
      return '请求过于频繁，请稍后重试'
    case 500:
      return '服务器内部错误，请稍后重试'
    case 502:
    case 503:
    case 504:
      return '服务暂时不可用，请稍后重试'
    default:
      return '网络错误，请检查网络连接'
  }
}

// 验证表单数据
export function validatePhotoData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('标题不能为空')
  }
  
  if (data.title && data.title.length > 100) {
    errors.push('标题长度不能超过100个字符')
  }
  
  if (data.description && data.description.length > 1000) {
    errors.push('描述长度不能超过1000个字符')
  }
  
  if (!data.category) {
    errors.push('请选择照片分类')
  }
  
  if (data.tags && data.tags.length > 10) {
    errors.push('标签数量不能超过10个')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}