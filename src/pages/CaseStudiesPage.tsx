import { PageLayout } from './PageLayout'
import { CaseStudyCard } from '../features/consulting/CaseStudyCard'
import { useCaseStudiesContent } from '../features/consulting/useCaseStudiesContent'

export function CaseStudiesPage() {
  const baseUrl = import.meta.env.BASE_URL
  const { intro, featured, others } = useCaseStudiesContent(baseUrl)

  return (
    <PageLayout>
      <section className="forge-panel rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white">Case Studies</h1>
        <p className="mt-2 text-sm text-zinc-400">{intro}</p>
      </section>

      {featured.title && (
        <CaseStudyCard {...featured} featured />
      )}

      {others.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {others.map((cs) => (
            <CaseStudyCard key={cs.title} {...cs} />
          ))}
        </div>
      )}

      <div className="text-center">
        <a
          href="#/contact"
          className="inline-block rounded-xl border border-amber-400/40 bg-amber-500/15 px-6 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/25 hover:text-amber-100"
        >
          Start your own project →
        </a>
      </div>
    </PageLayout>
  )
}
