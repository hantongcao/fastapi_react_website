"use server"

import type { ContactFormState } from "@/lib/types"
import { API_CONFIG } from "@/lib/config"

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = formData.get("name")
  const email = formData.get("email")
  const theme = formData.get("theme")
  const context = formData.get("context")

  // Basic validation
  if (!name || !email || !context) {
    return {
      message: "请填写所有必填项。",
      status: "error",
    }
  }

  try {
    const response = await fetch(API_CONFIG.CONTACT_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.toString(),
        email: email.toString(),
        theme: theme?.toString() || '',
        context: context.toString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("Contact form submitted successfully:", result)

    return {
      message: `感谢您，${name}！您的消息已成功发送。`,
      status: "success",
    }
  } catch (error) {
    console.error("Failed to submit contact form:", error)
    return {
      message: "发送失败，请稍后重试。",
      status: "error",
    }
  }
}
