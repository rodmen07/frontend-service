import type { RoadmapContent, RoadmapStatus } from '../../types'

interface RoadmapSectionProps {
  content: RoadmapContent
}

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  'shipped':     'Shipped',
  'in-progress': 'In Progress',
  'planned':     'Planned',
}

const STATUS_CLASS: Record<RoadmapStatus, string> = {
  'shipped':     'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  'in-progress': 'border-amber-400/40 bg-amber-500/10 text-amber-300',
  'planned':     'border-zinc-500/40 bg-zinc-700/40 text-zinc-400',
}

const STATUS_DOT: Record<RoadmapStatus, string> = {
  'shipped':     'bg-emerald-400',
  'in-progress': 'bg-amber-400 animate-pulse',
  'planned':     'bg-zinc-500',
}

const STATUS_ORDER: RoadmapStatus[] = ['in-progress', 'planned', 'shipped']

export function RoadmapSection({ content }: RoadmapSectionProps) {
  if (content.items.length === 0) return null

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: content.items.filter((item) => item.status === status),
  })).filter((g) => g.items.length > 0)

  return (
    <section className="forge-panel rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Roadmap</h2>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {STATUS_ORDER.map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[s].replace(' animate-pulse', '')}`} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {grouped.map(({ status, items }) => (
          <div key={status}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {STATUS_LABEL[status]}
              </h3>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-zinc-700/40 bg-zinc-800/50 p-4 transition hover:border-zinc-600/50"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-white leading-snug">{item.title}</span>
                    <span
                      className={`shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASS[item.status]}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
