"use client"

import { Search, ArrowLeft, ArrowRight, Calendar, Tag, FolderOpen, Loader2, Edit, Trash2, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { BLOG_CATEGORY_LABELS } from '@/lib/blog-constants'

const POSTS_PER_PAGE = 4

// API响应类型
interface ApiBlog {
  id: number
  title: string
  content: string
  summary: string
  status: string
  visibility: string
  tags: string[]
  category: string
  like_count: number
  comment_count: number
  share_count: number
  view_count: number
  created_at: string
  updated_at: string
}

interface ApiResponse {
  items: ApiBlog[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPage: number
  }
}



// 状态标签映射
const STATUS_LABELS: { [key: string]: string } = {
  'draft': '草稿',
  'published': '已发布',
  'archived': '已归档'
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<ApiBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const { isLoggedIn, userInfo } = useAuth()

  // 从API获取博客数据
  const fetchBlogs = async (page: number, search?: string, category?: string, status?: string) => {
    setLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      let url = `${baseUrl}/api/blogs?page=${page}&perPage=${POSTS_PER_PAGE}&watch=false`
      
      // 添加搜索参数
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`
      }
      
      // 添加分类筛选
      if (category && category !== 'all') {
        url += `&category=${category}`
      }
      
      // 添加状态筛选
      if (status && status !== 'all') {
        url += `&status=${status}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      setBlogs(data.items)
      setCurrentPage(data.pagination.page)
      setTotalPages(data.pagination.totalPage)
      setError(null)
    } catch (err) {
      console.error('获取博客数据失败:', err)
      setBlogs([])
      setCurrentPage(1)
      setTotalPages(1)
      // 只有在网络错误或服务器错误时才显示错误信息
      // 如果是404或数据为空，则不显示错误
      if (err instanceof Error && !err.message.includes('404')) {
        setError('获取博客数据失败，请稍后重试')
      } else {
        setError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs(1, searchTerm, selectedCategory, selectedStatus)
  }, [searchTerm, selectedCategory, selectedStatus])

  const handlePageChange = (page: number) => {
    fetchBlogs(page, searchTerm, selectedCategory, selectedStatus)
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

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // 处理分类筛选
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }

  // 处理状态筛选
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }



  // 截取摘要
  const getExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // 检查当前用户是否可以编辑/删除博客 - 仅限管理员
  const canEditBlog = () => {
    return isLoggedIn && userInfo && userInfo.is_admin
  }

  // 编辑博客 - 跳转到编辑页面
  const handleEditBlog = (blogId: number) => {
    window.location.href = `/blog-edit/${blogId}`
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-[calc(100vh-14rem)] animate-fade-in-up">
      <div className="mb-12">
        <PageHeader title="我的数字花园" description="一个关于 Web 开发、设计和前沿技术的文章集合。" />
      </div>

      {/* 搜索与筛选 */}
      <div className="mb-8 space-y-4">
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="搜索文章..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        
        {/* 筛选器 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有分类</SelectItem>
              {Object.entries(BLOG_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <Button onClick={() => fetchBlogs(currentPage, searchTerm, selectedCategory, selectedStatus)} variant="outline">
            重试
          </Button>
        </div>
      )}

      {/* 博客列表 */}
      {!loading && !error && (
        <>
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">暂无博客文章</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                  ? '没有找到符合条件的文章，请尝试调整搜索条件' 
                  : '还没有发布任何文章，敬请期待'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <Link href={`/blog/${blog.id}`} className="hover:text-primary transition-colors">
                      {blog.title}
                    </Link>
                  </CardTitle>
                  {canEditBlog() && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBlog(blog.id)}
                        className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20 hover:border-primary/30 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20 hover:border-primary/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* 元信息 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">分类:</span>
                      <span className="text-sm text-primary font-bold">{BLOG_CATEGORY_LABELS[blog.category] || blog.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">状态:</span>
                      <Badge 
                        variant={blog.status === 'published' ? 'default' : blog.status === 'draft' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {STATUS_LABELS[blog.status] || blog.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* 摘要 */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">
                      {blog.summary || getExcerpt(blog.content)}
                    </p>
                  </div>
                  
                  {/* 标签 */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">标签:</span>
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link 
                  href={`/blog/${blog.id}`} 
                  className="text-primary font-semibold flex items-center group/link hover:text-primary/80 transition-colors"
                >
                  阅读全文
                  <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardFooter>
            </Card>
              ))}
            </div>
          )}
        </>
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
  )
}
