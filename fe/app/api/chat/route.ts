import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { API_CONFIG } from "@/lib/config"

// Create a custom OpenAI provider instance
const eazytec = createOpenAI({
  apiKey: API_CONFIG.EAZYTEC_API_KEY,
  baseURL: API_CONFIG.EAZYTEC_BASE_URL,
})

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  if (!API_CONFIG.EAZYTEC_API_KEY) {
    return new Response("API key not found", { status: 500 })
  }

  const result = await streamText({
    model: eazytec(API_CONFIG.EAZYTEC_MODEL),
    system:
      "You are a helpful assistant. You are a part of a personal blog website. Be friendly, helpful, and slightly informal.",
    messages,
  })

  return result.toDataStreamResponse()
}
