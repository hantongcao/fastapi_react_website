"use server"

import { API_CONFIG } from "@/lib/config"

interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    username: string
    is_admin: boolean
    full_name: string
    require_password_change: boolean
    id: number
    created_at: string
    updated_at: string
  }
}

interface LoginFormState {
  message: string
  status: "idle" | "success" | "error"
  data?: LoginResponse
}

export async function loginUser(prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const username = formData.get("username")
  const password = formData.get("password")

  // Basic validation
  if (!username || !password) {
    return {
      message: "请填写用户名和密码。",
      status: "error",
    }
  }

  try {
    const loginUrl = `${API_CONFIG.AUTH_API_URL}/login`
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.toString(),
        password: password.toString(),
      }),
    })

    if (response.ok) {
      const data: LoginResponse = await response.json()
      
      return {
        message: `欢迎回来，${data.user.full_name || data.user.username}！`,
        status: "success",
        data,
      }
    } else {
      let errorMessage = "用户名或密码错误"
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // 如果无法解析错误响应，使用状态码信息
        if (response.status === 401) {
          errorMessage = "用户名或密码错误"
        } else if (response.status === 403) {
          errorMessage = "账户被禁用或权限不足"
        } else if (response.status >= 500) {
          errorMessage = "服务器内部错误，请稍后重试"
        } else {
          errorMessage = `请求失败 (${response.status})`
        }
      }
      
      return {
        message: errorMessage,
        status: "error",
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    
    let errorMessage = "网络错误，请检查服务器连接"
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        errorMessage = "无法连接到服务器，请检查服务器是否正在运行"
      } else {
        errorMessage = error.message
      }
    }
    
    return {
      message: errorMessage,
      status: "error",
    }
  }
}