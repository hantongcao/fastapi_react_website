"use client"

import Image from "next/image"
import { X, MapPin, FolderOpen, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { GalleryPost } from "@/lib/types"

// 分类映射
import { CATEGORY_LABELS } from "@/lib/photo-constants"

interface GalleryLightboxProps {
  post: GalleryPost
  onClose: () => void
}

export function GalleryLightbox({ post, onClose }: GalleryLightboxProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = post.srcList && post.srcList.length > 0 ? post.srcList : [post.src]
  const hasMultipleImages = images.length > 1

  // 标准化图片URL
  const normalizeImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg'
    
    // 如果是绝对路径（http://或https://开头），提取相对路径
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      // 如果是uploads路径，转换为API路径
      if (pathname.startsWith('/uploads/')) {
        return `/api/images${pathname}`
      }
      return pathname
    }
    
    // 处理相对路径
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`
    
    // 如果是uploads路径，转换为API路径
    if (normalizedUrl.startsWith('/uploads/')) {
      return `/api/images${normalizedUrl}`
    }
    
    return normalizedUrl
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-card border rounded-lg w-full max-w-6xl max-h-[95vh] flex flex-col overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[60vh] md:h-[70vh] flex-shrink-0">
          <img 
            src={normalizeImageUrl(images[currentImageIndex]) || "/placeholder.svg"} 
            alt={post.alt} 
            className="w-full h-full object-contain" 
          />
          
          {/* 图片导航按钮 */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                aria-label="上一张图片"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                aria-label="下一张图片"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
              
              {/* 图片计数器 */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
        <div className="p-6 space-y-4">
          <h2 className="font-sans text-2xl font-bold">{post.title}</h2>
          
          {/* 基本信息 */}
          <div className="grid md:grid-cols-2 gap-4">
            {post.location_name && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">拍摄地点:</span>
                <span className="text-sm text-primary">{post.location_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">分类:</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{CATEGORY_LABELS[post.category] || post.category}</Badge>
            </div>
          </div>
          
          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">标签:</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 描述内容 - 只显示一次 */}
          {post.description && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{post.description}</p>
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 bg-background/50 hover:bg-background/70 text-foreground rounded-full"
        aria-label="关闭"
      >
        <X className="w-6 h-6" />
      </Button>
    </div>
  )
}
