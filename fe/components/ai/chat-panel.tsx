"use client"

import { useChat } from "@ai-sdk/react"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal, LoaderCircle } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { ExamplePrompts } from "./example-prompts"

export function ChatPanel() {
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 chat-background">
        {messages.length > 0 ? (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        ) : (
          <ExamplePrompts onPromptClick={handlePromptClick} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t bg-background/80 p-4 backdrop-blur-lg">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl items-end gap-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
            placeholder="请输入您的问题..."
            className="max-h-36 min-h-12 resize-none text-base"
            rows={1}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-12 w-12 flex-shrink-0" disabled={isLoading || !input}>
            {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
            <span className="sr-only">发送</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
