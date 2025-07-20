import { ContactForm } from "@/components/contact/contact-form"
import { Mail, Phone, MapPin, Github } from "lucide-react"
import type { ContactInfo } from "@/lib/types"

export default function ContactPage() {
  const contactInfo: ContactInfo[] = [
    {
      icon: Mail,
      label: "邮箱",
      value: "your.email@example.com",
      href: "mailto:your.email@example.com"
    },
    {
      icon: Phone,
      label: "电话",
      value: "+86 138 0000 0000",
      href: "tel:+8613800000000"
    },
    {
      icon: MapPin,
      label: "位置",
      value: "中国，北京",
      href: "#"
    },
    {
      icon: Github,
      label: "GitHub",
      value: "github.com/yourusername",
      href: "https://github.com/yourusername"
    }
  ]

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8 pt-4 text-center lg:text-left">
          <div className="space-y-3">
            <h1 className="font-sans text-4xl md:text-5xl font-bold text-primary">保持联系</h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto lg:mx-0">
              有项目想合作、有问题想咨询，或者只是想打个招呼？我很乐意收到您的来信。请填写右侧的表单，我会尽快给您回复。
            </p>
          </div>
          <div className="space-y-4">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-center justify-center lg:justify-start gap-4">
                <item.icon className="h-6 w-6 text-primary" />
                <a href={item.href} className="text-lg hover:text-primary transition-colors">
                  {item.value}
                </a>
              </div>
            ))}
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  )
}
