"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

const prompts = ["给我推荐三本关于 UI 设计的书籍", "如何用 React 实现一个秒表组件？", "写一首关于代码的短诗"]

interface ExamplePromptsProps {
  onPromptClick: (prompt: string) => void
}

export function ExamplePrompts({ onPromptClick }: ExamplePromptsProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-4">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold font-sans">AI 助手</h2>
      <p className="mt-2 text-muted-foreground">开始对话，或尝试下面的示例提示</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {prompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            className="rounded-full bg-transparent"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}
