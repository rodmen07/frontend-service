import { useState } from 'react'
import type { SiteContent } from '../../types'
import { SlideOver } from './SlideOver'

interface HeroSectionProps {
  content: SiteContent
}

export function HeroSection({ content }: HeroSectionProps) {
  const [open, setOpen] = useState(false)
  const tagline = content.heroTagline || 'AI + Cloud Launchpad'

  return (
    <>
      <header className="forge-panel rounded-3xl border border-amber-300/20 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-12">
        <button
          onClick={() => setOpen(true)}
          className="reveal mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-rose-500/30 hover:brightness-105 active:scale-95 animate-pulse-strong glow-ring"
        >
          <span className="mr-2 animate-wiggle">✨</span>
          {tagline}
        </button>

        <h1 className="reveal animate-float-slow text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {content.title}
        </h1>
        <p className="reveal reveal-delay-1 mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
          {content.subtitle}
        </p>
        <div className="reveal reveal-delay-2 mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#/case-studies"
            className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/25 hover:text-amber-100 animate-pop"
          >
            See the work →
          </a>
          <a
            href="#/contact"
            className="rounded-xl border border-zinc-600/50 bg-zinc-800/60 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500/60 hover:bg-zinc-700/60 hover:text-zinc-100 animate-pop"
          >
            Book a free call →
          </a>
        </div>
      </header>

      <SlideOver open={open} onClose={() => setOpen(false)} title={tagline}>
        <p>
          I help startup teams ship fast on AWS + GCP with Terraform, Databricks-ready
          data foundations, and production-grade engineering from day one.
        </p>
        <div className="mt-4 flex gap-2">
          <a href="#/case-studies" className="btn-accent">
            See the work
          </a>
          <a href="#/contact" className="btn-neutral">
            Book a free call
          </a>
        </div>
      </SlideOver>
    </>
  )
}
