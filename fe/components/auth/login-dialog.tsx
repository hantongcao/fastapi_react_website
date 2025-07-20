"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, User, ChevronDown, Settings, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { loginUser } from "@/app/auth/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    username: string
    is_admin: boolean
    full_name: string
    require_password_change: boolean
    id: number
    created_at: string
    updated_at: string
  }
}

export function LoginDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()
  const { isLoggedIn, userInfo, login, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // 需要登录权限的页面路径
  const protectedRoutes = ['/contact-details']

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      
      const result = await loginUser({ message: "", status: "idle" }, formData)
      
      if (result.status === "success" && result.data) {
        login(result.data.access_token, result.data.user)
        setIsOpen(false)
        
        toast({
          title: "登录成功",
          description: `欢迎回来，${result.data.user.full_name || result.data.user.username}！`,
          duration: 2000,
        })
      } else {
        toast({
          title: "登录失败",
          description: result.message,
          variant: "destructive",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "登录失败",
        description: "网络连接错误，请检查网络设置或服务器状态",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setUsername("")
    setPassword("")
    
    // 如果当前页面需要登录权限，则跳转到主页
    if (protectedRoutes.includes(pathname)) {
      router.push('/')
    }
    
    toast({
      title: "已退出登录",
      description: "您已成功退出登录",
      duration: 2000,
    })
  }



  if (isLoggedIn && userInfo) {
    const displayName = userInfo.full_name || userInfo.username
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-full hover:bg-accent/50 transition-all duration-200">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {userInfo.is_admin ? '管理员' : '用户'}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userInfo.username}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
            <LogIn className="mr-2 h-4 w-4 rotate-180" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 font-medium px-4 py-2 transition-colors duration-200"
        >
          登录
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>登录</DialogTitle>
          <DialogDescription>
            请输入您的用户名和密码进行登录
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}