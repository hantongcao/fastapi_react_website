"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { LoginDialog } from "@/components/auth/login-dialog"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SITE_TITLE } from "@/lib/constants"

const NAV_ITEMS = [
  { href: "/", label: "主页", requireAuth: false, requireAdmin: false },
  { href: "/blog", label: "博客", requireAuth: false, requireAdmin: false },
  { href: "/blog-write", label: "写博客", requireAuth: true, requireAdmin: true },
  { href: "/gallery", label: "照片墙", requireAuth: false, requireAdmin: false },
  { href: "/photo-upload", label: "照片上传", requireAuth: true, requireAdmin: true },
  { href: "/ai-assistant", label: "AI 助手", requireAuth: false, requireAdmin: false },
  { href: "/contact", label: "联系我", requireAuth: false, requireAdmin: false },
  { href: "/contact-details", label: "联系详情", requireAuth: true, requireAdmin: true },
]

type NavItem = {
  href: string
  label: string
  requireAuth: boolean
  requireAdmin: boolean
}

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isLoggedIn, userInfo, isLoading } = useAuth()

  // 根据登录状态和管理员权限过滤导航项
  const filteredNavItems = NAV_ITEMS.filter(item => {
    // 如果正在加载认证状态，只显示不需要权限的项目，避免闪烁
    if (isLoading) {
      return !item.requireAuth && !item.requireAdmin
    }
    if (item.requireAdmin) {
      return isLoggedIn && userInfo?.is_admin
    }
    if (item.requireAuth) {
      return isLoggedIn
    }
    return true
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground group-hover:scale-110 transition-transform">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="font-sans font-bold text-xl text-foreground">{SITE_TITLE}</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {filteredNavItems.map((item: NavItem) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <LoginDialog />
          <ThemeToggle />
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">切换菜单</span>
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border/40">
          <nav className="flex flex-col space-y-1 p-4">
            {filteredNavItems.map((item: NavItem) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-accent-foreground hover:bg-accent/50",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
