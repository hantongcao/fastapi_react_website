"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BlogWriteForm } from "../../components/blog/blog-write-form"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function BlogWritePage() {
  const { isLoggedIn, userInfo, isLoading } = useAuth()
  const router = useRouter()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/')
        return
      }
      if (!userInfo?.is_admin) {
        return
      }
      setShowContent(true)
    }
  }, [isLoggedIn, userInfo, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">需要登录</h1>
          <p className="text-muted-foreground mb-4">请先登录后再访问此页面</p>
        </div>
      </div>
    )
  }

  if (!userInfo?.is_admin && showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">权限不足</h1>
          <p className="text-muted-foreground mb-4">只有管理员可以写博客</p>
        </div>
      </div>
    )
  }

  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">验证权限中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <BlogWriteForm />
      </div>
    </div>
  )
}