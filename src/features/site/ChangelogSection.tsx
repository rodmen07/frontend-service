import { useState } from 'react'
import type { ChangelogContent, ChangelogEntryType } from '../../types'

interface ChangelogSectionProps {
  content: ChangelogContent
}

const TYPE_LABEL: Record<ChangelogEntryType, string> = {
  new: 'New',
  improved: 'Improved',
  fixed: 'Fixed',
}

const TYPE_CLASS: Record<ChangelogEntryType, string> = {
  new:      'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  improved: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
  fixed:    'border-rose-400/40 bg-rose-500/10 text-rose-300',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function ChangelogSection({ content }: ChangelogSectionProps) {
  const [expandedCount, setExpandedCount] = useState(2)

  if (content.entries.length === 0) return null

  const visible = content.entries.slice(0, expandedCount)
  const hasMore = expandedCount < content.entries.length

  return (
    <section className="forge-panel rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Changelog</h2>
        <span className="rounded-full border border-zinc-600/50 bg-zinc-800/60 px-2.5 py-0.5 text-xs text-zinc-400">
          {content.entries.length} releases
        </span>
      </div>

      <div className="relative space-y-6">
        {/* Timeline spine */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-700/50" />

        {visible.map((entry) => (
          <div key={entry.version} className="relative pl-7">
            {/* Timeline dot */}
            <span className="absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-amber-400/50 bg-zinc-900">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-sm font-bold text-white">v{entry.version}</span>
              <span className="text-xs text-zinc-500">{formatDate(entry.date)}</span>
            </div>

            <ul className="mt-3 space-y-2">
              {entry.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${TYPE_CLASS[change.type]}`}
                  >
                    {TYPE_LABEL[change.type]}
                  </span>
                  <span className="text-sm leading-relaxed text-zinc-300">{change.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="mt-6 w-full rounded-xl border border-zinc-600/40 bg-zinc-800/50 py-2 text-sm text-zinc-400 transition hover:border-zinc-500/50 hover:text-zinc-200"
          onClick={() => setExpandedCount(content.entries.length)}
        >
          Show {content.entries.length - expandedCount} older release{content.entries.length - expandedCount === 1 ? '' : 's'}
        </button>
      )}
    </section>
  )
}
