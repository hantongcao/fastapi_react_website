import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('perPage') || '10'
    const watch = searchParams.get('watch') || 'false'

    // 构建API URL参数
    const apiParams = new URLSearchParams({
      page,
      perPage,
      watch
    })

    const response = await fetch(
      `${API_CONFIG.PHOTOS_API_URL}?${apiParams}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`)
      throw new Error(`后端API请求失败: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch photos:', error)
    
    // 检查是否是网络连接错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: '无法连接到后端服务器，请确保后端API服务正在运行' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取照片数据失败' },
      { status: 500 }
    )
  }
}