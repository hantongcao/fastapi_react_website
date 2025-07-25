/**
 * API URL utilities for handling different environments and deployment scenarios
 */
import { API_CONFIG } from './config'

/**
 * 构建API URL - 自动处理客户端和服务器端环境
 * @param path API路径 (例如: '/api/blogs' 或 '/api/photos/123')
 * @param isServerSide 是否为服务器端调用 (server actions)
 * @returns 完整的API URL
 */
export function buildApiUrl(path: string, isServerSide: boolean = false): string {
  // 移除路径开头的斜杠，确保格式一致
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  if (isServerSide) {
    // 服务器端：优先使用环境变量，否则构建本地URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (siteUrl) {
      return `${siteUrl}/${cleanPath}`
    }
    
    // 如果没有设置NEXT_PUBLIC_SITE_URL，使用前端配置构建URL
    const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST || 'localhost'
    const frontendPort = process.env.NEXT_PUBLIC_FRONTEND_PORT || '3000'
    return `http://${frontendHost}:${frontendPort}/${cleanPath}`
  } else {
    // 客户端：使用相对路径
    return `/${cleanPath}`
  }
}

/**
 * 构建外部API URL (后端服务)
 * @param path API路径 (例如: 'blogs' 或 'photos/123')
 * @returns 完整的后端API URL
 */
export function buildBackendApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const baseUrl = API_CONFIG.BACKEND_HOST && API_CONFIG.BACKEND_PORT 
    ? `http://${API_CONFIG.BACKEND_HOST}:${API_CONFIG.BACKEND_PORT}`
    : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  return `${baseUrl}/v1/${cleanPath}`
}

/**
 * 检测当前环境是否为服务器端
 * @returns boolean
 */
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined'
}

/**
 * 获取当前站点的基础URL
 * @returns 站点基础URL
 */
export function getSiteBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // 客户端：使用当前窗口的origin
    return window.location.origin
  } else {
    // 服务器端：使用环境变量
    return API_CONFIG.FRONTEND_HOST && API_CONFIG.FRONTEND_PORT 
      ? `http://${API_CONFIG.FRONTEND_HOST}:${API_CONFIG.FRONTEND_PORT}`
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }
}

/**
 * 通用fetch包装器，自动处理URL构建
 * @param path API路径
 * @param options fetch选项
 * @param useBackendApi 是否使用后端API (默认使用前端API路由)
 * @returns Promise<Response>
 */
export async function apiFetch(
  path: string, 
  options: RequestInit = {}, 
  useBackendApi: boolean = false
): Promise<Response> {
  const url = useBackendApi 
    ? buildBackendApiUrl(path)
    : buildApiUrl(path, isServerEnvironment())
  
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
}