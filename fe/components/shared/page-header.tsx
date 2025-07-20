interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="text-center space-y-4">
      <h1 className="font-sans text-4xl md:text-5xl font-bold text-primary">{title}</h1>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>
    </div>
  )
}
