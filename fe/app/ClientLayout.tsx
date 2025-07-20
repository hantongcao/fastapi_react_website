"use client"
import { usePathname } from "next/navigation"
import type React from "react"
import { Noto_Sans_SC } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-sc",
})

function BodyClassManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAiPage = pathname === "/ai-assistant"

  return <body className={`${notoSansSC.variable} font-sans ${isAiPage ? "pb-0" : "pb-20"}`}>{children}</body>
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <BodyClassManager>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col bg-background text-foreground">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </BodyClassManager>
    </html>
  )
}
