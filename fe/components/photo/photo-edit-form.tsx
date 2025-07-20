"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Loader2, Save, ArrowLeft, AlertTriangle, ImageIcon, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

import { PHOTO_CATEGORIES } from "@/lib/photo-constants"

// 内容状态枚举
export type ContentStatus = "draft" | "published" | "private" | "archived" | "deleted"

// 可见性枚举
export type Visibility = "public" | "friends" | "private"

interface PhotoEditData {
  id: number
  title: string
  description: string
  tags: string[]
  category: string
  status: ContentStatus
  location_name: string
  visibility: Visibility
  url_list: string[]
  user_id?: number
}

interface PhotoEditFormProps {
  photoId: string
}

export function PhotoEditForm({ photoId }: PhotoEditFormProps) {
  const [photoData, setPhotoData] = useState<PhotoEditData | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { userInfo, isLoggedIn } = useAuth()

  // 获取照片数据
  useEffect(() => {
    const fetchPhotoData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('access_token')
        const response = await fetch(`/api/photos/${photoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('获取照片数据失败')
        }
        
        const data = await response.json()
        
        // 检查权限 - 仅限管理员
        if (!userInfo?.is_admin) {
          toast({
            title: "权限不足",
            description: "只有管理员才能编辑照片",
            variant: "destructive",
            duration: 3000,
          })
          router.push('/gallery')
          return
        }
        
        setPhotoData({
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          tags: data.tags || [],
          category: data.category || '',
          status: data.status || 'draft',
          location_name: data.location_name || '',
          visibility: data.visibility || 'public',
          url_list: data.url_list || [],
          user_id: data.user_id
        })
      } catch (error) {
        console.error('Failed to fetch photo data:', error)
        
        // 提供更详细的错误信息
        let errorMessage = "无法加载照片数据"
        let errorDescription = "请检查网络连接或稍后重试"
        
        if (error instanceof Error) {
          if (error.message.includes('500')) {
            errorMessage = "后端服务暂时不可用"
            errorDescription = "后端API服务器出现问题，请联系管理员或稍后重试"
          } else if (error.message.includes('401')) {
            errorMessage = "登录已过期"
            errorDescription = "请重新登录后再试"
          } else if (error.message.includes('403')) {
            errorMessage = "权限不足"
            errorDescription = "您没有权限访问此照片"
          } else if (error.message.includes('404')) {
            errorMessage = "照片不存在"
            errorDescription = "该照片可能已被删除"
          }
        }
        
        toast({
          title: errorMessage,
          description: errorDescription,
          variant: "destructive",
          duration: 5000,
        })
        
        // 设置离线模式
         setIsOfflineMode(true)
         
         // 设置一个默认的照片数据，允许用户至少看到编辑界面
         setPhotoData({
           id: parseInt(photoId),
           title: `照片 #${photoId}`,
           description: '',
           tags: [],
           category: '',
           status: 'draft',
           location_name: '',
           visibility: 'public',
           url_list: [],
           user_id: userInfo?.id || 0
         })
      } finally {
        setIsLoading(false)
      }
    }

    if (photoId && isLoggedIn) {
      fetchPhotoData()
    }
  }, [photoId, userInfo, isLoggedIn, toast, router])

  const addTag = () => {
    if (tagInput.trim() && photoData && !photoData.tags.includes(tagInput.trim())) {
      setPhotoData(prev => prev ? {
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      } : null)
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPhotoData(prev => prev ? {
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    } : null)
  }

  // 文件选择处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('文件选择事件触发')
    const files = Array.from(e.target.files || [])
    console.log('选择的文件数量:', files.length)
    if (files.length > 0) {
      console.log('开始处理选择的文件:', files.map(f => f.name))
      processFiles(files)
    } else {
      console.log('没有选择文件')
    }
  }

  // 拖拽处理
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // 处理文件
  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast({
        title: "文件格式错误",
        description: "请选择图片文件",
        variant: "destructive",
        duration: 2000,
      })
      return
    }

    console.log('处理文件:', imageFiles.length, '个图片文件')
    
    // 先添加文件到状态
    setNewFiles(prev => {
      const updatedFiles = [...prev, ...imageFiles]
      console.log('更新后的 newFiles:', updatedFiles.length, '个文件')
      return updatedFiles
    })

    // 创建预览
    const newPreviewUrls: string[] = []
    const previewPromises = imageFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      })
    })
    
    try {
      const previews = await Promise.all(previewPromises)
      setNewPreviews(prev => [...prev, ...previews])
      console.log('预览创建完成:', previews.length, '个预览')
    } catch (error) {
      console.error('预览创建失败:', error)
    }
  }

  // 删除现有图片
  const removeExistingImage = (index: number) => {
    setPhotoData(prev => prev ? {
      ...prev,
      url_list: prev.url_list.filter((_, i) => i !== index)
    } : null)
  }

  // 删除新添加的图片
  const removeNewImage = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => {
      const newPrevs = prev.filter((_, i) => i !== index)
      // 清理 URL 对象
      if (prev[index] && prev[index].startsWith('blob:')) {
        URL.revokeObjectURL(prev[index])
      }
      return newPrevs
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    if (!photoData) return
    
    setIsSaving(true)
    
    try {
      let finalUrlList = [...photoData.url_list]
      
      // 如果有新文件需要上传
      if (newFiles.length > 0) {
        console.log('准备上传新文件:', newFiles.length, '个文件')
        const token = localStorage.getItem('access_token')
        const uploadedUrls: string[] = []
        
        // 逐个上传文件（与照片上传功能保持一致）
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i]
          console.log(`上传第${i + 1}个文件:`, file.name, file.type, file.size, 'bytes')
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          console.log('FormData 内容:', Array.from(uploadFormData.entries()))
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            throw new Error(`第${i + 1}个文件上传失败`)
          }

          const uploadResult = await uploadResponse.json()
          uploadedUrls.push(uploadResult.url)
        }
        
        finalUrlList = [...finalUrlList, ...uploadedUrls]
      }
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: photoData.title,
          description: photoData.description,
          tags: photoData.tags,
          category: photoData.category,
          status: photoData.status,
          location_name: photoData.location_name,
          visibility: photoData.visibility,
          url_list: finalUrlList,
        }),
      })

      if (response.ok) {
        toast({
          title: "保存成功",
          description: "照片信息已更新",
          duration: 2000,
        })
        router.push('/gallery')
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('Save failed:', error)
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "请重试",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
        </CardContent>
      </Card>
    )
  }

  if (!photoData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">照片数据加载失败</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">编辑照片</CardTitle>
          <Button
            variant="outline"
            onClick={() => router.push('/gallery')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回照片墙
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 离线模式警告 */}
        {isOfflineMode && (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>离线编辑模式：</strong>无法连接到后端服务器，您可以编辑照片信息，但保存功能暂时不可用。请稍后重试或联系管理员。
            </AlertDescription>
          </Alert>
        )}
        
        {/* 照片管理区域 */}
        <div className="space-y-2">
          <Label>照片管理</Label>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {(photoData.url_list && photoData.url_list.length > 0) || newPreviews.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* 现有图片 */}
                {photoData.url_list && photoData.url_list.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <Image
                      src={url}
                      alt={`${photoData.title} - 图片 ${index + 1}`}
                      width={200}
                      height={150}
                      className="rounded-lg object-cover w-full h-32 border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    {/* 图片加载失败时的占位符 */}
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-muted rounded-lg border">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs">图片加载失败</p>
                      </div>
                    </div>
                    {/* 删除按钮 */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeExistingImage(index)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {/* 图片序号 */}
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
                
                {/* 新添加的图片 */}
                {newPreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <Image
                      src={preview}
                      alt={`新图片 ${index + 1}`}
                      width={200}
                      height={150}
                      className="rounded-lg object-cover w-full h-32 border border-primary"
                    />
                    {/* 删除按钮 */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNewImage(index)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {/* 新图片标识 */}
                    <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                      新 {index + 1}
                    </div>
                  </div>
                ))}
                
                {/* 添加更多照片的按钮 */}
                <div 
                  className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">添加更多</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">点击或拖拽上传照片（支持多选）</p>
                  <p className="text-sm text-muted-foreground">支持 JPG、PNG、GIF 格式，可同时选择多张图片</p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          {((photoData.url_list && photoData.url_list.length > 0) || newPreviews.length > 0) && (
            <p className="text-sm text-muted-foreground">
              现有图片: {photoData.url_list?.length || 0} 张
              {newPreviews.length > 0 && (
                <span className="text-primary ml-2">新增图片: {newPreviews.length} 张</span>
              )}
            </p>
          )}
        </div>
        
        {/* 标题 */}
        <div className="space-y-2">
          <Label htmlFor="title">标题 *</Label>
          <Input
            id="title"
            value={photoData.title}
            onChange={(e) => setPhotoData(prev => prev ? { ...prev, title: e.target.value } : null)}
            placeholder="为您的照片起个标题"
            required
          />
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={photoData.description}
            onChange={(e) => setPhotoData(prev => prev ? { ...prev, description: e.target.value } : null)}
            placeholder="描述一下这张照片的故事..."
            rows={3}
          />
        </div>

        {/* 类型选择 */}
        <div className="space-y-2">
          <Label>类型 *</Label>
          <Select
            value={photoData.category}
            onValueChange={(value) => setPhotoData(prev => prev ? { ...prev, category: value } : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择照片类型" />
            </SelectTrigger>
            <SelectContent>
              {PHOTO_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <Label>标签</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="添加标签"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {photoData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photoData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 状态选择 */}
        <div className="space-y-2">
          <Label>状态</Label>
          <Select
            value={photoData.status}
            onValueChange={(value: ContentStatus) => setPhotoData(prev => prev ? { ...prev, status: value } : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择内容状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
              <SelectItem value="private">私密</SelectItem>
              <SelectItem value="archived">已归档</SelectItem>
              <SelectItem value="deleted">已删除</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 地点 */}
        <div className="space-y-2">
          <Label htmlFor="location">拍摄地点</Label>
          <Input
            id="location"
            value={photoData.location_name}
            onChange={(e) => setPhotoData(prev => prev ? { ...prev, location_name: e.target.value } : null)}
            placeholder="输入拍摄地点"
          />
        </div>

        {/* 可见性选择 */}
        <div className="space-y-2">
          <Label>可见性</Label>
          <Select
            value={photoData.visibility}
            onValueChange={(value: Visibility) => setPhotoData(prev => prev ? { ...prev, visibility: value } : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择可见性" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">公开</SelectItem>
              <SelectItem value="friends">仅好友可见</SelectItem>
              <SelectItem value="private">仅自己可见</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 保存按钮 */}
        <div className="flex gap-4">
          <Button 
            onClick={handleSave}
            className="flex-1" 
            disabled={isSaving || !photoData.title || !photoData.category || isOfflineMode}
            title={isOfflineMode ? "离线模式下无法保存" : ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isOfflineMode ? "保存不可用" : "保存更改"}
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/gallery')}
            disabled={isSaving}
          >
            {isOfflineMode ? "返回" : "取消"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}