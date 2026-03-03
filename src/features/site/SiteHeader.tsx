import { API_BASE_URL } from '../../config'
import type { SiteContent } from '../../types'

interface SiteHeaderProps {
  content: SiteContent
}

export function SiteHeader({ content }: SiteHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{content.title}</h1>
      <p className="mt-2 text-slate-600">{content.subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          href={content.ctaHref}
        >
          {content.ctaLabel}
        </a>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          API: {API_BASE_URL}
        </span>
      </div>
    </header>
  )
}
