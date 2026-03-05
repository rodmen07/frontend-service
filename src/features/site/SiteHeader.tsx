import type { SiteContent } from '../../types'

interface SiteHeaderProps {
  content: SiteContent
}

export function SiteHeader({
  content,
}: SiteHeaderProps) {
  return (
    <header className="forge-panel rounded-3xl border border-amber-300/20 bg-zinc-900/80 p-6 text-center shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">{content.title}</h1>
      <p className="mx-auto mt-3 max-w-4xl text-zinc-300">{content.subtitle}</p>
    </header>
  )
}
