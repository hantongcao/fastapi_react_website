"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { submitContactForm } from "@/app/contact/actions"
import type { ContactFormState } from "@/lib/types"

const initialState: ContactFormState = {
  message: "",
  status: "idle",
}

function SubmitButton() {
  // This component is not needed for useActionState, but if you were using useFormStatus:
  // const { pending } = useFormStatus()
  // return (
  //   <Button type="submit" size="lg" className="w-full group" disabled={pending}>
  //     {pending ? "发送中..." : "发送消息"}
  //     <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
  //   </Button>
  // )
  return null // Placeholder
}

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>发送消息</CardTitle>
        <CardDescription>填写下面的表单，我会尽快与您取得联系。</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" name="name" placeholder="您的姓名" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" name="email" type="email" placeholder="您的邮箱" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="theme">主题</Label>
            <Input id="theme" name="theme" placeholder="消息主题" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="context">内容</Label>
            <Textarea id="context" name="context" placeholder="请在此输入您的消息..." rows={5} required />
          </div>
          <Button type="submit" size="lg" className="w-full group" disabled={isPending}>
            {isPending ? "发送中..." : "发送消息"}
            <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          {state.status !== "idle" && (
            <p className={`text-sm text-center ${state.status === "error" ? "text-destructive" : "text-primary"}`}>
              {state.message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
