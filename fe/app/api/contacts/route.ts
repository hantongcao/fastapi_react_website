import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('perPage') || '10'
    const watch = searchParams.get('watch') || 'false'
    const search = searchParams.get('search') || ''

    // 构建API URL参数
    const apiParams = new URLSearchParams({
      page,
      perPage,
      watch
    })
    
    // 如果有搜索参数，添加到API请求中
    if (search.trim()) {
      apiParams.append('search', search.trim())
    }

    const response = await fetch(
      `${API_CONFIG.CONTACT_API_URL}?${apiParams}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch contacts:', error)
    return NextResponse.json(
      { error: '获取联系信息失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(API_CONFIG.CONTACT_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to submit contact form:', error)
    return NextResponse.json(
      { error: '提交联系信息失败' },
      { status: 500 }
    )
  }
}