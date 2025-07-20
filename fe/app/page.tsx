"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Rss } from "lucide-react"
import { BlogPostCard } from "@/components/blog/blog-post-card"
import { useState, useEffect } from "react"
import type { BlogPost } from "@/lib/types"
import { BLOG_CATEGORIES, type BlogCategory } from "@/lib/blog-constants"

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

// 将API数据转换为BlogPost格式
const convertApiBlogToBlogPost = (apiBlog: ApiBlog): BlogPost => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readTime} 分钟阅读`
  }

  // 将API返回的category字符串转换为BlogCategory类型
  const mapCategory = (category: string): BlogCategory => {
    const upperCategory = category.toUpperCase()
    return Object.values(BLOG_CATEGORIES).includes(upperCategory as BlogCategory) 
      ? upperCategory as BlogCategory 
      : BLOG_CATEGORIES.TECH // 默认值
  }

  return {
    slug: apiBlog.id.toString(),
    title: apiBlog.title,
    date: formatDate(apiBlog.created_at),
    readTime: calculateReadTime(apiBlog.content),
    excerpt: apiBlog.summary || apiBlog.content.substring(0, 150) + '...',
    tags: apiBlog.tags,
    category: mapCategory(apiBlog.category)
  }
}

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/blogs?page=1&perPage=3&watch=false`)
        if (response.ok) {
          const data: ApiResponse = await response.json()
          const convertedPosts = data.items.map(convertApiBlogToBlogPost)
          setRecentPosts(convertedPosts)
        }
      } catch (error) {
        console.error('获取近期文章失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPosts()
  }, [])

  return (
    <div className="animate-fade-in-up">
      {/* 英雄区域 */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="font-sans text-5xl md:text-7xl font-bold tracking-tight">
              当代码与
              <br />
              <span className="text-primary">创想交汇</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
              欢迎来到我的数字空间。我是一位充满热情的开发者和设计师，致力于探索技术与美学的交集。在这里，我分享我的旅程、见解和创作。
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="group">
                <Link href="/blog">
                  阅读博客
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">联系我</Link>
              </Button>
            </div>
          </div>
          <div className="relative w-full max-w-md mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
            <div className="relative rounded-2xl shadow-2xl overflow-hidden">
              <Image
                src="/placeholder.svg?width=500&height=500"
                alt="抽象数字艺术"
                width={500}
                height={500}
                className="rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 近期文章 */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-sans text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Rss className="text-primary" />
              近期文章
            </h2>
            <Button asChild variant="ghost" className="group">
              <Link href="/blog">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} variant="compact" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
