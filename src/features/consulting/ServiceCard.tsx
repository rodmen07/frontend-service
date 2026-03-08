import type { ServiceItem } from '../../types'

export function ServiceCard({ icon, title, description, tags }: ServiceItem) {
  return (
    <article className="interactive-card flex flex-col gap-3 rounded-xl border border-zinc-500/35 bg-zinc-800/70 p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <h3 className="text-sm font-semibold text-amber-200">{title}</h3>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-zinc-300">{description}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-amber-400/20 bg-amber-500/8 px-2 py-0.5 text-[11px] font-medium text-amber-300/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
