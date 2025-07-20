import { cn } from "@/lib/utils"
import type { Message } from "ai/react"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { memo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import remarkGfm from "remark-gfm"

interface ChatMessageProps {
  message: Message
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === "user"

  return (
    <div
      className={cn("flex items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500", {
        "justify-end": isUser,
      })}
    >
      {!isUser && (
        <Avatar className="h-9 w-9 border bg-background">
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl p-4 text-sm prose dark:prose-invert max-w-none prose-p:my-0",
          isUser ? "bg-muted" : "bg-primary/10",
        )}
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            td: ({ vAlign, ...props }: any) => {
              const { vAlign: _, ...restProps } = props
              return <td {...restProps} />
            },
            th: ({ vAlign, ...props }: any) => {
              const { vAlign: _, ...restProps } = props
              return <th {...restProps} />
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      {isUser && (
        <Avatar className="h-9 w-9 border bg-background">
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
})

ChatMessage.displayName = "ChatMessage"
