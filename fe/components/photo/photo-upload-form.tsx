"use client"

import { useState, useRef, useEffect, useTransition } from "react"

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
import { Progress } from "@/components/ui/progress"
import { Upload, X, Plus, Image as ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { submitPhotoData } from "@/app/photo-upload/actions"
import type { PhotoUploadState } from "@/lib/types"

import { PHOTO_CATEGORIES } from "@/lib/photo-constants"

// 内容状态枚举
export type ContentStatus = "draft" | "published" | "private" | "archived" | "deleted"

// 可见性枚举
export type Visibility = "public" | "friends" | "private"

interface PhotoData {
  title: string
  description: string
  tags: string[]
  category: string
  files: File[]
  status?: ContentStatus
  location_name?: string
  visibility?: Visibility
}



export function PhotoUploadForm() {
  const [photoData, setPhotoData] = useState<PhotoData>({
    title: "",
    description: "",
    tags: [],
    category: "",
    files: [],
    status: "draft",
    location_name: "",
    visibility: "public",
  })
  const [tagInput, setTagInput] = useState("")
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const { userInfo } = useAuth()
  
  const [isPending, startTransition] = useTransition()
  


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith("image/"))
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "文件格式错误",
        description: "请只选择图片文件",
        variant: "destructive",
        duration: 2000,
      })
    }
    
    if (imageFiles.length > 0) {
      setPhotoData(prev => ({ ...prev, files: [...prev.files, ...imageFiles] }))
      
      // 生成预览
      imageFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith("image/"))
    
    if (imageFiles.length > 0) {
      setPhotoData(prev => ({ ...prev, files: [...prev.files, ...imageFiles] }))
      
      // 生成预览
      imageFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const addTag = () => {
    if (tagInput.trim() && !photoData.tags.includes(tagInput.trim())) {
      setPhotoData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPhotoData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileUpload = async () => {
    if (photoData.files.length === 0) return null
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      const token = localStorage.getItem('access_token')
      const uploadedUrls: string[] = []
      
      // 逐个上传文件
      for (let i = 0; i < photoData.files.length; i++) {
        const file = photoData.files[i]
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        
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
        
        // 更新进度
        setUploadProgress(Math.round(((i + 1) / photoData.files.length) * 100))
      }
      
      setUploadedFileUrls(uploadedUrls)
      
      toast({
        title: "文件上传成功",
        description: `成功上传${uploadedUrls.length}张图片，现在可以提交照片信息了`,
        duration: 2000,
      })
      
      return { urls: uploadedUrls }
    } catch (error) {
      console.error('File upload failed:', error)
      toast({
        title: "文件上传失败",
        description: error instanceof Error ? error.message : "文件上传失败，请重试。",
        variant: "destructive",
        duration: 2000,
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // 确保文件已上传
    if (uploadedFileUrls.length === 0) {
      toast({
        title: "请先上传文件",
        description: "请先点击'上传文件'按钮上传图片文件",
        variant: "destructive",
        duration: 2000,
      })
      return
    }
    
    startTransition(async () => {
      try {
        const formData = new FormData(event.currentTarget)
        const result = await submitPhotoData(formData)
        if (result.status === 'success') {
          toast({
            title: "上传成功",
            description: result.message,
            duration: 2000,
          })
          // 重置表单
          setPhotoData({
            title: "",
            description: "",
            tags: [],
            category: "",
            files: [],
            status: "draft",
            location_name: "",
            visibility: "public",
          })
          setPreviews([])
          setUploadedFileUrls([])
          setUploadProgress(0)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          formRef.current?.reset()
        } else {
          toast({
            title: "上传失败",
            description: result.message,
            variant: "destructive",
            duration: 2000,
          })
        }
      } catch (error) {
        toast({
          title: "上传失败",
          description: error instanceof Error ? error.message : "未知错误",
          variant: "destructive",
          duration: 2000,
        })
      }
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">上传照片</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} ref={formRef} className="space-y-6">
          {/* 隐藏字段用于传递数据给Server Action */}
          <input type="hidden" name="title" value={photoData.title} />
          <input type="hidden" name="description" value={photoData.description} />
          <input type="hidden" name="category" value={photoData.category} />
          <input type="hidden" name="tags" value={JSON.stringify(photoData.tags)} />
          <input type="hidden" name="status" value={photoData.status || 'draft'} />
          <input type="hidden" name="location_name" value={photoData.location_name || ''} />
          <input type="hidden" name="visibility" value={photoData.visibility || 'public'} />
          <input type="hidden" name="authToken" value={typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''} />
          <input type="hidden" name="userIsAdmin" value={userInfo?.is_admin ? 'true' : 'false'} />
          {uploadedFileUrls.length > 0 && (
            <>
              <input type="hidden" name="url_list" value={JSON.stringify(uploadedFileUrls)} />
              <input type="hidden" name="fileFormat" value={photoData.files[0]?.type.split('/')[1] || 'jpg'} />
            </>
          )}
          
          {/* 文件上传区域 */}
          <div className="space-y-2">
            <Label>选择照片</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {previews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`预览 ${index + 1}`}
                        width={200}
                        height={150}
                        className="rounded-lg object-cover w-full h-32"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          const newPreviews = previews.filter((_, i) => i !== index)
                          const newFiles = photoData.files.filter((_, i) => i !== index)
                          setPreviews(newPreviews)
                          setPhotoData(prev => ({ ...prev, files: newFiles }))
                          if (newFiles.length === 0 && fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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
                <div className="space-y-4">
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
          </div>

          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={photoData.title}
              onChange={(e) => setPhotoData(prev => ({ ...prev, title: e.target.value }))}
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
              onChange={(e) => setPhotoData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="描述一下这张照片的故事..."
              rows={3}
            />
          </div>

          {/* 类型选择 */}
          <div className="space-y-2">
            <Label>类型 *</Label>
            <Select
              value={photoData.category}
              onValueChange={(value) => setPhotoData(prev => ({ ...prev, category: value }))}
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
              onValueChange={(value: ContentStatus) => setPhotoData(prev => ({ ...prev, status: value }))}
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
              value={photoData.location_name || ""}
              onChange={(e) => setPhotoData(prev => ({ ...prev, location_name: e.target.value }))}
              placeholder="输入拍摄地点"
            />
          </div>

          {/* 可见性选择 */}
          <div className="space-y-2">
            <Label>可见性</Label>
            <Select
              value={photoData.visibility}
              onValueChange={(value: Visibility) => setPhotoData(prev => ({ ...prev, visibility: value }))}
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

          {/* 上传进度 */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>上传进度</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
            
            {/* 文件上传成功状态 */}
            {uploadedFileUrls.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center text-green-700">
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">已成功上传{uploadedFileUrls.length}个文件</span>
                </div>
                <p className="text-xs text-green-600 mt-1">现在可以填写照片信息并提交</p>
              </div>
            )}

          {/* 文件上传按钮 */}
          {photoData.files.length > 0 && uploadedFileUrls.length === 0 && (
            <Button 
              type="button" 
              onClick={handleFileUpload}
              className="w-full mb-4" 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传文件中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  上传{photoData.files.length}个文件
                </>
              )}
            </Button>
          )}
          
          {/* 提交表单按钮 */}
          <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending || isUploading || uploadedFileUrls.length === 0 || !photoData.title || !photoData.category}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  提交照片信息
                </>
              )}
            </Button>
        </form>
      </CardContent>
    </Card>
  )
}