'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { LoginDialog } from '@/components/auth/login-dialog'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

import { Loader2, Mail, User, MessageSquare, Calendar, Search, X, Trash2, ChevronLeft, ChevronRight, Lock } from 'lucide-react'

interface ContactItem {
  id: number
  name: string
  email: string
  theme: string
  context: string
  created_at: string
}

interface ContactResponse {
  items: ContactItem[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPage: number
  }
}

export default function ContactDetailsPage() {
  const { isLoggedIn, userInfo, isLoading } = useAuth()
  const router = useRouter()
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showContent, setShowContent] = useState(false)

  const fetchContacts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true)
      setError(null)
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        perPage: '10',
        watch: 'false'
      })
      
      if (search.trim()) {
        searchParams.append('search', search.trim())
      }
      
      const response = await fetch(`/api/contacts?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('获取联系信息失败')
      }
      
      const data: ContactResponse = await response.json()
      setContacts(data.items)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  // 权限验证和内容显示控制
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

  // 只有在权限验证通过后才获取联系信息
  useEffect(() => {
    if (showContent) {
      fetchContacts(1, searchQuery)
    }
  }, [showContent])

  const handleSearch = () => {
    setIsSearching(true)
    fetchContacts(1, searchQuery)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearching(true)
    fetchContacts(1, '')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id)
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('删除联系信息失败')
      }
      
      // 删除成功后刷新列表
      await fetchContacts(pagination.page, searchQuery)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPage) {
      fetchContacts(page, searchQuery)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderPaginationItems = () => {
    const items = []
    const { page, totalPage } = pagination
    
    // 显示页码的逻辑
    const showPages = []
    
    if (totalPage <= 7) {
      // 如果总页数小于等于7，显示所有页码
      for (let i = 1; i <= totalPage; i++) {
        showPages.push(i)
      }
    } else {
      // 复杂的分页逻辑
      if (page <= 4) {
        showPages.push(1, 2, 3, 4, 5, -1, totalPage)
      } else if (page >= totalPage - 3) {
        showPages.push(1, -1, totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage)
      } else {
        showPages.push(1, -1, page - 1, page, page + 1, -1, totalPage)
      }
    }
    
    return showPages.map((pageNum, index) => {
      if (pageNum === -1) {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">...</span>
          </PaginationItem>
        )
      }
      
      return (
        <PaginationItem key={pageNum}>
          <PaginationLink
            onClick={() => handlePageChange(pageNum)}
            isActive={pageNum === page}
            className={`cursor-pointer transition-colors ${
              pageNum === page 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      )
    })
  }

  // 如果正在加载认证状态，显示加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg text-primary">验证登录状态...</span>
          </div>
        </div>
      </div>
    )
  }

  // 如果用户未登录，返回null（会被重定向）
  if (!isLoggedIn) {
    return null
  }

  // 如果用户不是管理员，显示权限不足页面
  if (!userInfo?.is_admin) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Lock className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary">需要管理员权限</h1>
              <p className="text-muted-foreground max-w-md">
                此页面仅限管理员访问。如果您认为这是错误，请联系系统管理员。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 如果还没有显示内容权限，返回null
  if (!showContent) {
    return null
  }

  // 如果正在加载数据，显示加载状态
  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg text-primary">加载中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">错误: {error}</p>
            <button 
              onClick={() => fetchContacts(pagination.page)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-3">
          <h1 className="font-sans text-4xl md:text-5xl font-bold text-primary">联系详情</h1>
          <p className="text-muted-foreground text-lg">
            查看所有联系信息，共 {pagination.total} 条记录
          </p>
        </div>

        {/* 搜索功能 */}
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索姓名、邮箱或主题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-10"
                disabled={loading || isSearching}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading || isSearching}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading || isSearching}
              className="px-6"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '搜索'
              )}
            </Button>
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              搜索结果: "{searchQuery}" - 找到 {pagination.total} 条记录
            </p>
          )}
        </div>

        {/* 联系信息列表 */}
        <div className="grid gap-6">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {contact.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10 border-primary/20 hover:border-primary/30 transition-colors"
                          disabled={deletingId === contact.id}
                        >
                          {deletingId === contact.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要删除来自 <strong>{contact.name}</strong> ({contact.email}) 的联系信息吗？
                            <br />此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(contact.id)}
                            disabled={deletingId === contact.id}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {deletingId === contact.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              '确认删除'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">邮箱:</span>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">时间:</span>
                    <span className="text-sm text-primary">
                      {formatDate(contact.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">主题:</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{contact.theme}</Badge>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm leading-relaxed">{contact.context}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 分页组件 */}
        {pagination.totalPage > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
          <PaginationLink
            onClick={() => handlePageChange(pagination.page - 1)}
            className={`cursor-pointer transition-colors gap-1 pl-2.5 ${
              pagination.page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-primary/10 hover:text-primary'
            }`}
            size="default"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>上一页</span>
          </PaginationLink>
        </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
          <PaginationLink
            onClick={() => handlePageChange(pagination.page + 1)}
            className={`cursor-pointer transition-colors gap-1 pr-2.5 ${
              pagination.page === pagination.totalPage ? 'pointer-events-none opacity-50' : 'hover:bg-primary/10 hover:text-primary'
            }`}
            size="default"
          >
            <span>下一页</span>
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* 分页信息 */}
        <div className="text-center text-muted-foreground">
          第 <span className="text-primary font-bold text-lg">{pagination.page}</span> / {pagination.totalPage} 页 |
          显示第 <span className="text-primary font-medium">{(pagination.page - 1) * pagination.perPage + 1}</span> - <span className="text-primary font-medium">{Math.min(pagination.page * pagination.perPage, pagination.total)}</span> 条，
          共 <span className="text-primary font-medium">{pagination.total}</span> 条记录
        </div>
      </div>
    </div>
  )
}