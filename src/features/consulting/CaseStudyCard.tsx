import type { CaseStudy } from '../../types'

interface CaseStudyCardProps extends CaseStudy {
  featured?: boolean
}

export function CaseStudyCard({ title, subtitle, description, techStack, highlights, githubUrl, detailUrl, featured }: CaseStudyCardProps) {
  return (
    <article className={`forge-panel flex flex-col gap-4 rounded-2xl border border-zinc-500/35 bg-zinc-800/70 p-6 ${featured ? 'shadow-2xl shadow-black/40' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-sm text-amber-300/80">{subtitle}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {detailUrl && (
            <a
              href={detailUrl}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:border-amber-400/60 hover:text-amber-200"
            >
              View case study →
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-600/50 bg-zinc-700/50 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500/60 hover:text-zinc-100"
            >
              GitHub →
            </a>
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-300">{description}</p>

      {highlights.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-zinc-400">
              <span className="mt-px shrink-0 text-amber-400">›</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}

      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-zinc-700/40 pt-4">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-zinc-700/50 bg-zinc-800/60 px-2 py-0.5 text-[11px] font-medium text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
