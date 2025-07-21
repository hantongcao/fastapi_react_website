// 图片处理工具函数

// 图片懒加载配置
export const LAZY_LOADING_CONFIG = {
  rootMargin: '50px',
  threshold: 0.1,
}

// 支持的图片格式
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

// 最大文件大小 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// 验证图片文件
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // 检查文件类型
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: '不支持的文件格式，请选择 JPEG、PNG、WebP 或 GIF 格式的图片'
    }
  }

  // 检查文件大小
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `文件大小不能超过 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`
    }
  }

  return { isValid: true }
}

// 生成图片预览 URL
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('无法生成图片预览'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

// 压缩图片
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // 设置画布尺寸
      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height)

      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片压缩失败'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

// 获取图片尺寸
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('无法获取图片尺寸'))
    }
    img.src = URL.createObjectURL(file)
  })
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成缩略图 URL
export function generateThumbnailUrl(originalUrl: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizeMap = {
    small: '150x150',
    medium: '300x300',
    large: '600x600'
  }
  
  // 如果是本地文件，直接返回原 URL
  if (originalUrl.startsWith('/uploads/')) {
    return originalUrl
  }
  
  // 如果有 CDN 或图片处理服务，可以在这里添加缩略图生成逻辑
  return originalUrl
}

// 创建图片懒加载观察器
export function createImageLazyLoader() {
  let observer: IntersectionObserver | null = null
  
  const observeImage = (element: HTMLImageElement) => {
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              const src = img.dataset.src
              if (src) {
                img.src = src
                img.removeAttribute('data-src')
                observer?.unobserve(img)
              }
            }
          })
        },
        LAZY_LOADING_CONFIG
      )
    }
    
    observer.observe(element)
  }
  
  const disconnect = () => {
    observer?.disconnect()
    observer = null
  }
  
  return { observeImage, disconnect }
}