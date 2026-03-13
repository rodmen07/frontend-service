const FACTS = [
  { label: 'Current role', value: 'Software Engineer at Smoothstack, focused on cloud and platform engineering in production environments.' },
  { label: 'Consulting scope', value: 'Cloud/Security consulting exposure supporting government-focused programs for AFS/IRS.' },
  { label: 'Build profile', value: 'Hands-on delivery across frontend, backend, and cloud infrastructure: React/TypeScript, Node.js/Express, Ruby/Rails, and IaC workflows.' },
  { label: 'Prior domain', value: '5 years in Finance/FinTech operations, bringing regulated-environment rigor to startup delivery.' },
  { label: 'Education', value: 'BA in Economics and Mathematics.' },
  { label: 'Solo operator', value: 'No subcontractors, no account managers. You work directly with the engineer doing the work.' },
  { label: 'Built in public', value: '9-service microservices platform and a DynamoDB idempotency prototype — both on GitHub.' },
  { label: 'Location', value: 'San Antonio, TX — available remote worldwide, overlap with US and EU business hours.' },
  { label: 'Security posture', value: 'Secure-by-default across every layer: JWT/RBAC, secrets management, least-privilege IAM, and audit logging — informed by compliance exposure on federal programs.' },
]

export function AboutSection() {
  return (
    <section className="forge-panel rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10">
            <span className="text-2xl font-black text-amber-300">RM</span>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Roderick Mendoza</h2>
          <p className="mt-1 text-sm text-amber-300/80">Cloud & Infrastructure Consultant</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            I help founders and small product teams move from idea to reliable production systems
            without hiring a full internal platform team too early. My work spans full-stack
            implementation, cloud infrastructure, and operational handoff, with a focus on
            AWS/GCP, Terraform, CI/CD, and secure delivery patterns.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {FACTS.map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-zinc-800/60 bg-zinc-800/40 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400/70">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#/case-studies"
              className="rounded-lg border border-zinc-600/50 bg-zinc-800/60 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500/60 hover:text-zinc-100"
            >
              View the work →
            </a>
            <a
              href="https://github.com/rodmen07"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-600/50 bg-zinc-800/60 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500/60 hover:text-zinc-100"
            >
              GitHub →
            </a>
            <a
              href="https://www.linkedin.com/in/roderick-mendoza-9133b7b5/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-600/50 bg-zinc-800/60 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500/60 hover:text-zinc-100"
            >
              LinkedIn →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
