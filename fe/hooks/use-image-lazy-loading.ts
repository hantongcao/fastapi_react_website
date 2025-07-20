import { useRef, useCallback, useEffect } from 'react'
import { LAZY_LOADING_CONFIG } from '@/lib/image-utils'

// 图片懒加载 Hook
export function useImageLazyLoading() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  const observeImage = useCallback((element: HTMLImageElement) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              const src = img.dataset.src
              if (src) {
                img.src = src
                img.removeAttribute('data-src')
                img.classList.add('loaded')
                observerRef.current?.unobserve(img)
              }
            }
          })
        },
        LAZY_LOADING_CONFIG
      )
    }
    
    observerRef.current.observe(element)
  }, [])
  
  const unobserveImage = useCallback((element: HTMLImageElement) => {
    observerRef.current?.unobserve(element)
  }, [])
  
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])
  
  return { observeImage, unobserveImage }
}

// 图片预加载 Hook
export function useImagePreloader() {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
      img.src = src
    })
  }, [])
  
  const preloadImages = useCallback(async (srcs: string[]): Promise<void> => {
    try {
      await Promise.all(srcs.map(src => preloadImage(src)))
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }
  }, [preloadImage])
  
  return { preloadImage, preloadImages }
}