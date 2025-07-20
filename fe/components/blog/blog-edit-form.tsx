"use client"

import { useState, useRef, useTransition, useEffect } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Plus, X, Loader2, FileText, Eye, ArrowLeft } from "lucide-react"
import { getBlogData, updateBlogData } from "@/app/blog-edit/actions"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { BLOG_CATEGORY_OPTIONS } from '@/lib/blog-constants'

// 内容状态类型
type ContentStatus = "draft" | "published" | "private" | "archived" | "deleted"

// 可见性类型
type Visibility = "public" | "friends" | "private"

interface BlogData {
  title: string
  content: string
  summary: string
  tags: string[]
  category: string
  status: ContentStatus
  visibility: Visibility
}

interface BlogEditFormProps {
  blogId: string
}

export function BlogEditForm({ blogId }: BlogEditFormProps) {
  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    content: "",
    summary: "",
    tags: [],
    category: "",
    status: "draft",
    visibility: "public",
  })
  const [tagInput, setTagInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const { userInfo } = useAuth()
  const router = useRouter()

  // 加载博客数据
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setIsLoading(true)
        const authToken = localStorage.getItem('access_token')
        if (!authToken) {
          setLoadError('未找到认证信息，请重新登录')
          return
        }

        const result = await getBlogData(blogId, authToken)
        if (result.status === 'error') {
          setLoadError(result.message)
          return
        }

        const data = result.data
        setBlogData({
          title: data.title || '',
          content: data.content || '',
          summary: data.summary || '',
          tags: data.tags || [],
          category: data.category || '',
          status: data.status || 'draft',
          visibility: data.visibility || 'public',
        })
      } catch (error) {
        setLoadError('加载博客数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    if (blogId) {
      loadBlogData()
    }
  }, [blogId])

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !blogData.tags.includes(tagInput.trim())) {
      setBlogData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  // 移除标签
  const removeTag = (tagToRemove: string) => {
    setBlogData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 表单提交处理
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // 验证必填字段
    if (!blogData.title.trim()) {
      toast({
        title: "请填写标题",
        description: "博客标题不能为空",
        variant: "destructive",
        duration: 2000,
      })
      return
    }
    
    if (!blogData.content.trim()) {
      toast({
        title: "请填写内容",
        description: "博客内容不能为空",
        variant: "destructive",
        duration: 2000,
      })
      return
    }
    
    if (!blogData.category) {
      toast({
        title: "请选择分类",
        description: "请为博客选择一个分类",
        variant: "destructive",
        duration: 2000,
      })
      return
    }
    
    startTransition(async () => {
      try {
        const formData = new FormData(event.currentTarget)
        const result = await updateBlogData(formData)
        
        if (result && result.status === 'error') {
          toast({
            title: "更新失败",
            description: result.message,
            variant: "destructive",
            duration: 2000,
          })
        } else if (result && result.status === 'success') {
          toast({
            title: "更新成功",
            description: result.message || "博客已成功更新",
            duration: 2000,
          })
          
          // 处理客户端重定向
          if (result.redirectTo) {
            setTimeout(() => {
              window.location.href = result.redirectTo
            }, 1000) // 给用户时间看到成功消息
          }
        }
      } catch (error) {
        toast({
          title: "更新失败",
          description: error instanceof Error ? error.message : "未知错误",
          variant: "destructive",
          duration: 2000,
        })
      }
    })
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">加载博客数据中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">加载失败</h2>
            <p className="text-muted-foreground mb-6">{loadError}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                重试
              </Button>
              <Link href="/blog">
                <Button variant="default">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回博客列表
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href={`/blog/${blogId}`}
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          返回博客详情
        </Link>
      </div>

      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <FileText className="h-6 w-6" />
            编辑博客
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} ref={formRef} className="space-y-6">
            {/* 隐藏字段用于传递数据给Server Action */}
            <input type="hidden" name="blogId" value={blogId} />
            <input type="hidden" name="title" value={blogData.title} />
            <input type="hidden" name="content" value={blogData.content} />
            <input type="hidden" name="summary" value={blogData.summary} />
            <input type="hidden" name="category" value={blogData.category} />
            <input type="hidden" name="tags" value={JSON.stringify(blogData.tags)} />
            <input type="hidden" name="status" value={blogData.status} />
            <input type="hidden" name="visibility" value={blogData.visibility} />
            <input type="hidden" name="authToken" value={typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : ''} />
            <input type="hidden" name="userIsAdmin" value={userInfo?.is_admin ? 'true' : 'false'} />
            
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={blogData.title}
                onChange={(e) => setBlogData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="为您的博客起个标题"
                required
              />
            </div>

            {/* 摘要 */}
            <div className="space-y-2">
              <Label htmlFor="summary">摘要</Label>
              <Textarea
                id="summary"
                value={blogData.summary}
                onChange={(e) => setBlogData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="简要描述博客内容..."
                rows={2}
              />
            </div>

            {/* 内容编辑区域 */}
            <div className="space-y-2">
              <Label>内容 *</Label>
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    编辑
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    预览
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-4">
                  <Textarea
                    value={blogData.content}
                    onChange={(e) => setBlogData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="在这里写下您的博客内容，支持 Markdown 格式..."
                    rows={20}
                    className="font-mono"
                    required
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    支持 Markdown 格式：**粗体**、*斜体*、`代码`、[链接](url)、# 标题等
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg p-4 min-h-[500px] bg-muted/20">
                    {blogData.content ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            td: ({ vAlign, ...props }: any) => {
                              const { vAlign: _, ...restProps } = props
                              return <td {...restProps} />
                            },
                            th: ({ vAlign, ...props }: any) => {
                              const { vAlign: _, ...restProps } = props
                              return <th {...restProps} />
                            }
                          }}
                        >
                          {blogData.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-20">
                        在编辑区域输入内容后，这里将显示预览效果
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* 分类选择 */}
            <div className="space-y-2">
              <Label>分类 *</Label>
              <Select
                value={blogData.category}
                onValueChange={(value) => setBlogData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择博客分类" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORY_OPTIONS.map((category) => (
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
              {blogData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {blogData.tags.map((tag, index) => (
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
                value={blogData.status}
                onValueChange={(value: ContentStatus) => setBlogData(prev => ({ ...prev, status: value }))}
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

            {/* 可见性选择 */}
            <div className="space-y-2">
              <Label>可见性</Label>
              <Select
                value={blogData.visibility}
                onValueChange={(value: Visibility) => setBlogData(prev => ({ ...prev, visibility: value }))}
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
            
            {/* 提交按钮 */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isPending || !blogData.title || !blogData.content || !blogData.category}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    更新博客
                  </>
                )}
              </Button>
              <Link href={`/blog/${blogId}`}>
                <Button type="button" variant="outline">
                  取消
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}