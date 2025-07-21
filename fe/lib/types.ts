import type React from "react"
import type { BlogCategory } from './blog-constants'

export type BlogPost = {
  slug: string
  title: string
  date: string
  readTime: string
  excerpt: string
  tags: string[]
  category: BlogCategory
  imageUrl?: string
  content?: string
}

export type GalleryPost = {
  id: number
  src: string
  srcList?: string[]
  alt: string
  title: string
  description: string
  location_name: string
  tags: string[]
  category: string
  content: string
  user_id?: number
}

export type ContactInfo = {
  icon: React.ElementType
  label: string
  value: string
  href: string
}

export type NavItem = {
  href: string
  label: string
}

export type ContactFormState = {
  message: string
  status: "success" | "error" | "idle"
}

export type LoginFormState = {
  message: string
  status: "idle" | "success" | "error"
  data?: {
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
}

export type PhotoUploadState = {
  message: string
  status: "success" | "error" | "idle"
}
