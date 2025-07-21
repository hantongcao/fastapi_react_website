// 照片分类配置
export const PHOTO_CATEGORIES = [
  { value: "SELFIE", label: "自拍" },
  { value: "DAILY", label: "日常" },
  { value: "PORTRAIT", label: "人像" },
  { value: "LANDSCAPE", label: "风景" },
  { value: "ART", label: "艺术" },
] as const

// 分类标签映射
export const CATEGORY_LABELS: Record<string, string> = {
  SELFIE: "自拍",
  DAILY: "日常",
  PORTRAIT: "人像",
  LANDSCAPE: "风景",
  ART: "艺术",
}

// 照片分类类型
export type PhotoCategory = typeof PHOTO_CATEGORIES[number]['value']