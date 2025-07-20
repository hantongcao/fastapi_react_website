"use client"

import { useState, useEffect } from "react"

// 创建自定义事件来处理同一页面内的状态同步
const AUTH_CHANGE_EVENT = 'auth-change'

const dispatchAuthChange = () => {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT))
}

interface User {
  username: string
  is_admin: boolean
  full_name: string
  require_password_change: boolean
  id: number
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化时立即检查认证状态
  const initializeAuth = () => {
    if (typeof window === 'undefined') return
    
    try {
      const token = localStorage.getItem('access_token')
      const userInfoStr = localStorage.getItem('user_info')
      
      if (token && userInfoStr) {
        const user = JSON.parse(userInfoStr)
        setIsLoggedIn(true)
        setUserInfo(user)
      } else {
        setIsLoggedIn(false)
        setUserInfo(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      setIsLoggedIn(false)
      setUserInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 立即初始化认证状态
    initializeAuth()

    const checkAuthStatus = () => {
      initializeAuth()
    }

    // 监听storage事件，当其他标签页登录/退出时同步状态
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'user_info') {
        checkAuthStatus()
      }
    }

    // 监听自定义事件，当同一页面内登录/退出时同步状态
    const handleAuthChange = () => {
      checkAuthStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    }
  }, [])

  const login = (token: string, user: User) => {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_info', JSON.stringify(user))
    setIsLoggedIn(true)
    setUserInfo(user)
    // 触发自定义事件通知其他组件
    dispatchAuthChange()
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
    setIsLoggedIn(false)
    setUserInfo(null)
    // 触发自定义事件通知其他组件
    dispatchAuthChange()
  }

  return {
    isLoggedIn,
    userInfo,
    isLoading,
    login,
    logout
  }
}