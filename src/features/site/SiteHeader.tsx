import { API_BASE_URL } from '../../config'
import type { SiteContent } from '../../types'

interface SiteHeaderProps {
  content: SiteContent
}

export function SiteHeader({ content }: SiteHeaderProps) {
  return (
    <header className="rounded-3xl border border-white/15 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">{content.title}</h1>
      <p className="mt-3 max-w-3xl text-slate-300">{content.subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          href={content.ctaHref}
        >
          {content.ctaLabel}
        </a>
        <span className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-xs text-slate-300">
          API: {API_BASE_URL}
        </span>
      </div>
    </header>
  )
}
