"use client"

import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import Link from "next/link"
import { ArrowLeft, Calendar, Eye, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'
import { useAuth } from "@/hooks/use-auth"

// API响应类型
interface ApiBlogDetail {
  id: number
  title: string
  content: string
  summary: string
  status: string
  visibility: string
  tags: string[]
  category: string
  created_at: string
  updated_at: string
  author: {
    name: string
    avatar: string
  }
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<ApiBlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string>('')
  const { isLoggedIn, userInfo } = useAuth()

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getId()
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchBlog = async () => {
      try {
        setLoading(true)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/blogs/${id}`)
        
        if (response.status === 404) {
          notFound()
          return
        }
        
        if (!response.ok) {
          throw new Error('获取博客详情失败')
        }
        
        const data: ApiBlogDetail = await response.json()
        setBlog(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }



  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-24 mb-8"></div>
          <div className="h-12 bg-muted rounded mb-4"></div>
          <div className="h-4 bg-muted rounded w-48 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">加载失败</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!blog) {
    notFound()
    return null
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          返回博客
        </Link>
      </div>

      <article>
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{blog.category}</Badge>
              <span>•</span>
              <span>{blog.status === 'published' ? '已发布' : '草稿'}</span>
            </div>
            {isLoggedIn && userInfo?.is_admin && (
              <Link href={`/blog-edit/${blog.id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  编辑
                </Button>
              </Link>
            )}
          </div>
          
          <h1 className="font-sans text-4xl md:text-5xl font-bold mb-4 leading-tight">{blog.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{blog.stats.views} 次阅读</span>
            </div>
          </div>
          

          
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          {blog.summary && (
            <div className="bg-muted/50 rounded-lg p-4 mb-8">
              <p className="text-muted-foreground italic">{blog.summary}</p>
            </div>
          )}
        </header>

        <div className="prose dark:prose-invert prose-lg max-w-none mb-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              code: ({ className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match
                return isInline ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                )
              },
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
            {blog.content}
          </ReactMarkdown>
        </div>
      </article>


    </div>
  )
}
