import { PageLayout } from './PageLayout'

export function ContactPage() {
  return (
    <PageLayout>
      <section className="forge-panel rounded-3xl border border-amber-300/20 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-12">
        <h1 className="text-3xl font-bold text-white">Get in touch</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
          Currently available for new projects. Every engagement starts with a free 30-minute discovery call — no commitment required.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="mailto:rodmendoza07@gmail.com"
            className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-6 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/25 hover:text-amber-100"
          >
            rodmendoza07@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/roderick-mendoza-9133b7b5/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-zinc-600/50 bg-zinc-800/60 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500/60 hover:bg-zinc-700/60 hover:text-zinc-100"
          >
            LinkedIn →
          </a>
        </div>

        <p className="mt-8 text-xs text-zinc-600">Based in San Antonio, TX — open to remote worldwide.</p>
      </section>
    </PageLayout>
  )
}
