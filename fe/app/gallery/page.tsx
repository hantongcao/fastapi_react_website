"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, MapPin, Camera, Tag, FolderOpen, Loader2, Edit, Trash2, ZoomIn } from "lucide-react"
import type { GalleryPost } from "@/lib/types"
import { PageHeader } from "@/components/shared/page-header"
import { GalleryLightbox } from "@/components/gallery/gallery-lightbox"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"


import { CATEGORY_LABELS } from "@/lib/photo-constants"
const POSTS_PER_PAGE = 3
const PHOTOS_PER_PAGE = 3

// API响应类型
interface ApiPhoto {
  id: number
  title: string
  description: string
  url_list: string[]
  location_name: string
  category: string
  tags: string[]
  user_id?: number
  created_at: string
  updated_at: string
}

interface ApiResponse {
  items: ApiPhoto[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPage: number
  }
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPost, setSelectedPost] = useState<GalleryPost | null>(null)
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: number]: number}>({})
  const [autoSlideIntervals, setAutoSlideIntervals] = useState<{[key: number]: NodeJS.Timeout}>({})
  const { isLoggedIn, userInfo } = useAuth()
  const router = useRouter()



  // 从API获取照片数据
  const fetchPhotos = async (page: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/photos?page=${page}&perPage=${PHOTOS_PER_PAGE}&watch=false`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      // 转换API数据为GalleryPost格式
      const galleryPosts: GalleryPost[] = data.items.map((photo) => {
        // 处理图片URL列表 - 直接使用静态文件路径
        const processedUrls = photo.url_list.filter(url => url && url.trim() !== '')
        
        // 使用第一张图片作为主要显示图片
        const mainImageUrl = processedUrls.length > 0 ? processedUrls[0] : "/placeholder.svg"
        
        return {
          id: photo.id,
          src: mainImageUrl,
          srcList: processedUrls,
          alt: photo.title,
          title: photo.title,
          description: photo.description,
          location_name: photo.location_name,
          category: photo.category,
          tags: photo.tags,
          content: photo.description, // 保持与GalleryPost类型兼容
          user_id: photo.user_id
        }
      })
      
      setPhotos(galleryPosts)
      setCurrentPage(data.pagination.page)
      setTotalPages(data.pagination.totalPage)
      setError(null)
    } catch (err) {
      console.error('API请求失败:', err)
      setPhotos([])
      setCurrentPage(1)
      setTotalPages(1)
      setError('加载照片数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos(1)
  }, [])

  // 清理定时器的effect
  useEffect(() => {
    // 清理函数
    return () => {
      Object.values(autoSlideIntervals).forEach(interval => clearInterval(interval))
    }
  }, [autoSlideIntervals])

  const handlePageChange = (page: number) => {
    fetchPhotos(page)
  }

  const prevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  // 删除照片
  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('确定要删除这张照片吗？')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // 重新获取当前页面的照片
        fetchPhotos(currentPage)
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('删除照片失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 编辑照片 - 跳转到编辑页面
  const handleEditPhoto = (photoId: number) => {
    // 使用 Next.js 路由进行跳转
    router.push(`/photo-edit/${photoId}`)
  }

  // 检查当前用户是否可以编辑/删除照片 - 仅限管理员
  const canEditPhoto = (photo: GalleryPost) => {
    return isLoggedIn && userInfo && userInfo.is_admin
  }

  // 处理照片轮播
  const handleNextImage = (photoId: number, imageCount: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [photoId]: ((prev[photoId] || 0) + 1) % imageCount
    }))
  }

  const handlePrevImage = (photoId: number, imageCount: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [photoId]: ((prev[photoId] || 0) - 1 + imageCount) % imageCount
    }))
  }

  // 获取当前显示的图片
  const getCurrentImage = (post: GalleryPost) => {
    const images = post.srcList && post.srcList.length > 0 ? post.srcList : [post.src]
    const currentIndex = currentImageIndexes[post.id] || 0
    const currentImage = images[currentIndex] || post.src
    
    // 验证URL是否有效，如果无效则返回占位符
    if (!currentImage || currentImage.trim() === '') {
      return '/placeholder.svg'
    }
    
    return currentImage
  }

  // 获取图片总数
  const getImageCount = (post: GalleryPost) => {
    return post.srcList && post.srcList.length > 0 ? post.srcList.length : 1
  }

  // 开始自动轮播（鼠标悬停时）
  const startAutoSlide = (photoId: number, imageCount: number) => {
    if (imageCount > 1 && !autoSlideIntervals[photoId]) {
      const interval = setInterval(() => {
        setCurrentImageIndexes(prev => ({
          ...prev,
          [photoId]: ((prev[photoId] || 0) + 1) % imageCount
        }))
      }, 2000)
      
      setAutoSlideIntervals(prev => ({
        ...prev,
        [photoId]: interval
      }))
    }
  }

  // 停止自动轮播（鼠标离开时）
  const stopAutoSlide = (photoId: number) => {
    if (autoSlideIntervals[photoId]) {
      clearInterval(autoSlideIntervals[photoId])
      setAutoSlideIntervals(prev => {
        const newIntervals = { ...prev }
        delete newIntervals[photoId]
        return newIntervals
      })
    }
  }

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-[calc(100vh-14rem)] animate-fade-in-up">
        <div className="mb-12">
          <PageHeader title="光影集" description="一个通过我的镜头捕捉，并用文字记录的故事精选集。" />
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">加载中...</span>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchPhotos(currentPage)} variant="outline">
              重试
            </Button>
          </div>
        )}

        {/* 照片列表 */}
        {!loading && !error && (
          <div className="grid gap-6">
            {photos.map((post) => (
            <Card key={post.id} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setSelectedPost(post)}
                       className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20 hover:border-primary/30 transition-colors"
                     >
                       <ZoomIn className="h-4 w-4" />
                     </Button>
                     {canEditPhoto(post) && (
                       <>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEditPhoto(post.id)}
                           className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20 hover:border-primary/30 transition-colors"
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="destructive"
                           size="sm"
                           onClick={() => handleDeletePhoto(post.id)}
                           className=""
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </>
                     )}
                   </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* 照片预览 */}
                  <div className="md:col-span-1">
                    <div 
                      className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group" 
                      onClick={() => setSelectedPost(post)}
                      onMouseEnter={() => startAutoSlide(post.id, getImageCount(post))}
                      onMouseLeave={() => stopAutoSlide(post.id)}
                    >
                      <Image
                        src={getCurrentImage(post) || "/placeholder.svg"}
                        alt={post.alt}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      
                      {/* 轮播控制按钮 - 仅在有多张图片时显示 */}
                      {getImageCount(post) > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePrevImage(post.id, getImageCount(post))
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8"
                            aria-label="上一张图片"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNextImage(post.id, getImageCount(post))
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8"
                            aria-label="下一张图片"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          
                          {/* 图片计数器和指示器 */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {(currentImageIndexes[post.id] || 0) + 1} / {getImageCount(post)}
                          </div>
                          
                          {/* 小圆点指示器 */}
                          <div className="absolute bottom-2 right-2 flex gap-1">
                            {Array.from({ length: getImageCount(post) }).map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentImageIndexes(prev => ({
                                    ...prev,
                                    [post.id]: index
                                  }))
                                }}
                                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                  (currentImageIndexes[post.id] || 0) === index
                                    ? 'bg-white'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`查看第${index + 1}张图片`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* 单图片数量标识 - 统一显示在底部中央 */}
                      {getImageCount(post) === 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          1 / 1
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 照片信息 */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* 只有当拍摄地点不为空时才显示 */}
                      {post.location_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">拍摄地点:</span>
                          <span className="text-sm text-primary font-bold">{post.location_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">分类:</span>
                        <span className="text-sm text-primary font-bold">{CATEGORY_LABELS[post.category] || post.category}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {/* 只有当标签不为空时才显示标签区域 */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">标签:</span>
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 只显示描述，避免重复 */}
                      {post.description && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm leading-relaxed">{post.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* 分页组件 */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-8">
            <Button
              variant="ghost"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              上一页
            </Button>
            
            <div className="text-center text-muted-foreground px-4 py-2 bg-muted/50 rounded-full">
              第 <span className="text-primary font-bold text-lg mx-1">{currentPage}</span> / {totalPages} 页
            </div>
            
            <Button
              variant="ghost"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-200 hover:scale-105"
            >
              下一页
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {selectedPost && <GalleryLightbox post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </>
  )
}
