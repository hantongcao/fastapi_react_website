import type React from "react"
import type { Metadata } from "next"
import { SITE_TITLE } from "@/lib/constants"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: `${SITE_TITLE} - 个人博客`,
  description: "一个分享技术见解、设计灵感和创意构想的现代化个人博客。",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'