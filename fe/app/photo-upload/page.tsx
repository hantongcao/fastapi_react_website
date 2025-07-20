"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PhotoUploadForm } from "@/components/photo/photo-upload-form"
import { PageHeader } from "@/components/shared/page-header"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PhotoUploadPage() {
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <PageHeader
          title="权限不足"
          description="您需要管理员权限才能访问此页面"
        />
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">访问受限</h3>
                <p className="text-muted-foreground">
                  照片上传功能仅限管理员使用。如需上传照片，请联系管理员获取相应权限。
                </p>
              </div>
              <Button 
                onClick={() => router.push('/gallery')} 
                variant="outline"
                className="mt-4"
              >
                返回照片墙
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!showContent) {
    return null
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="照片上传"
        description="上传您的精彩照片，分享美好时刻"
      />
      <div className="mt-8">
        <PhotoUploadForm />
      </div>
    </div>
  )
}