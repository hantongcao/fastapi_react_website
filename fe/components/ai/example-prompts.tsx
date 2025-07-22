"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

const prompts = ["空腹能吃饭吗？", "陨石为什么每次都能精准砸到陨石坑？", "眼镜没发明之前，眼镜蛇叫什么？"]

interface ExamplePromptsProps {
  onPromptClick: (prompt: string) => void
}

export function ExamplePrompts({ onPromptClick }: ExamplePromptsProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 rounded-full bg-primary/10 p-4">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold font-sans">AI 小助手</h2>
      <p className="mt-2 text-muted-foreground">开始battle，或尝试下面的灵魂之问</p>
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
