"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BlogEditForm } from "@/components/blog/blog-edit-form"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { isLoggedIn, userInfo, isLoading } = useAuth()
  const router = useRouter()
  const [blogId, setBlogId] = useState<string>('')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params
      setBlogId(resolvedParams.id)
    }
    getId()
  }, [params])

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/blog')
        return
      }
      if (!userInfo?.is_admin) {
        setShowContent(true)
        return
      }
      setShowContent(true)
    }
  }, [isLoggedIn, userInfo, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  if (!userInfo?.is_admin) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">访问受限</h1>
          <p className="text-muted-foreground mb-4">您需要管理员权限才能编辑博客</p>
        </div>
      </div>
    )
  }

  if (!blogId || !showContent) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <BlogEditForm blogId={blogId} />
    </div>
  )
}