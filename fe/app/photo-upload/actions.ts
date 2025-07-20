"use server"

import type { PhotoUploadState } from "@/lib/types"
import { API_CONFIG } from "@/lib/config"

export async function submitPhotoData(
  formData: FormData
): Promise<PhotoUploadState> {
  console.log("=== Server Action Called ===")
  console.log("FormData entries:")
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`)
  }
  
  const title = formData.get("title")
  const description = formData.get("description")
  const category = formData.get("category")
  const tags = formData.get("tags")
  const urlListStr = formData.get("url_list")
  const fileFormat = formData.get("fileFormat")
  const status = formData.get("status")
  const locationName = formData.get("location_name")
  const visibility = formData.get("visibility")
  const authToken = formData.get("authToken")
  const userIsAdmin = formData.get("userIsAdmin")

  // 解析URL列表
  let urlList: string[]
  try {
    urlList = JSON.parse(urlListStr as string)
  } catch (error) {
    return {
      message: "URL列表格式错误",
      status: "error",
    }
  }

  console.log("Extracted values:", { title, description, category, tags, urlList, fileFormat, status, locationName, visibility })

  // 权限检查 - 仅限管理员
  if (!authToken) {
    return {
      message: "需要登录才能上传照片。",
      status: "error",
    }
  }

  if (userIsAdmin !== "true") {
    return {
      message: "只有管理员才能上传照片。",
      status: "error",
    }
  }

  // Basic validation
  if (!title || !category || !urlList || urlList.length === 0) {
    console.log("Validation failed:", { title: !!title, category: !!category, urlList: !!urlList })
    return {
      message: "请填写标题、选择类型并上传图片。",
      status: "error",
    }
  }

  // 解析tags列表
  let parsedTags: string[] = []
  if (tags) {
    try {
      parsedTags = JSON.parse(tags.toString())
    } catch (error) {
      // 如果JSON解析失败，尝试按逗号分割（向后兼容）
      parsedTags = tags.toString().split(",").filter(tag => tag.trim())
    }
  }

  try {
    const submitData = {
      title: title.toString(),
      description: description?.toString() || "",
      url_list: urlList,
      format: fileFormat?.toString() || "jpg",
      location_name: locationName?.toString() || "",
      status: status?.toString() || "draft",
      visibility: visibility?.toString() || "public",
      tags: parsedTags,
      category: category.toString(),
      taken_at: new Date().toISOString()
    }

    console.log("Submitting photo data to:", API_CONFIG.PHOTOS_API_URL)
    console.log("Submit data:", submitData)

    const response = await fetch(API_CONFIG.PHOTOS_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData),
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response text:", errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("Photo submitted successfully:", result)

    return {
      message: "照片已成功上传！",
      status: "success",
    }
  } catch (error) {
    console.error("Failed to submit photo:", error)
    return {
      message: error instanceof Error ? error.message : "上传失败，请稍后重试。",
      status: "error",
    }
  }
}