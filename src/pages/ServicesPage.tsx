import { PageLayout } from './PageLayout'
import { ServiceCard } from '../features/consulting/ServiceCard'
import { HowItWorksSection } from '../features/site/HowItWorksSection'
import { useServicesContent } from '../features/consulting/useServicesContent'

export function ServicesPage() {
  const baseUrl = import.meta.env.BASE_URL
  const { intro, services } = useServicesContent(baseUrl)

  return (
    <PageLayout>
      <section className="forge-panel rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white">Services</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{intro}</p>

        {services.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        )}
      </section>

      <HowItWorksSection />

      <div className="text-center">
        <a
          href="#/contact"
          className="inline-block rounded-xl border border-amber-400/40 bg-amber-500/15 px-6 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/25 hover:text-amber-100"
        >
          Let's discuss your project →
        </a>
      </div>
    </PageLayout>
  )
}
