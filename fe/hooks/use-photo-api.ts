import { useState, useCallback } from 'react'
import { handleApiResponse, getErrorMessage, validatePhotoData } from '@/lib/error-handler'
import type { GalleryPost } from '@/lib/types'

interface UsePhotoApiReturn {
  loading: boolean
  error: string | null
  fetchPhoto: (id: string) => Promise<GalleryPost | null>
  updatePhoto: (id: string, data: any) => Promise<boolean>
  deletePhoto: (id: string) => Promise<boolean>
  uploadPhoto: (formData: FormData) => Promise<boolean>
  clearError: () => void
}

export function usePhotoApi(): UsePhotoApiReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchPhoto = useCallback(async (id: string): Promise<GalleryPost | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/photos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await handleApiResponse(response)
      return data
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePhoto = useCallback(async (id: string, photoData: any): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      // 验证数据
      const validation = validatePhotoData(photoData)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        return false
      }
      
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
      })
      
      await handleApiResponse(response)
      return true
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePhoto = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      await handleApiResponse(response)
      return true
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadPhoto = useCallback(async (formData: FormData): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })
      
      await handleApiResponse(response)
      return true
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchPhoto,
    updatePhoto,
    deletePhoto,
    uploadPhoto,
    clearError,
  }
}