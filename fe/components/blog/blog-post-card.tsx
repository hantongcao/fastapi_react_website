import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar } from "lucide-react"
import type { BlogPost } from "@/lib/types"

interface BlogPostCardProps {
  post: BlogPost
  variant?: "full" | "compact"
}

export function BlogPostCard({ post, variant = "full" }: BlogPostCardProps) {
  const cardClasses =
    "group bg-card hover:border-primary transition-all duration-300 flex flex-col hover:shadow-lg hover:-translate-y-2"

  if (variant === "compact") {
    return (
      <Card className={cardClasses}>
        <CardHeader>
          <span className="text-sm text-primary font-semibold mb-1">{post.category}</span>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm">{post.excerpt}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{post.date}</span>
          </div>
        </div>
        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/blog/${post.slug}`} className="text-primary font-semibold flex items-center group/link">
          阅读全文
          <ArrowRight className="ml-1 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  )
}
