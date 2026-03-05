import { PageLayout } from './PageLayout'

const SERVICES = [
  {
    name: 'task-portal-service',
    label: 'Frontend',
    tech: 'React 19 · TypeScript · Vite · Tailwind v3',
    color: 'border-cyan-500/30 bg-cyan-900/10',
    badge: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300',
    dot: 'bg-cyan-400',
    description: 'Static SPA deployed on Fly.io. Hash-based client router with no server configuration required. Communicates with the Task API over HTTPS. Builds to a single asset bundle with tree-shaking.',
    responsibilities: [
      'Authentication UI — sign-in, session management, JWT storage',
      'Task Manager — Kanban board, list view, bulk operations, CSV export',
      'AI Planner UI — goal input, plan preview, feedback-driven regeneration',
      'CMS-driven content — FAQ, Highlights, Changelog, Roadmap loaded from JSON at runtime',
      'Admin Dashboard — request logs, user activity, platform metrics (admin role only)',
    ],
  },
  {
    name: 'task-api-service',
    label: 'Task API',
    tech: 'Rust · Axum · SQLite · sqlx · Tokio',
    color: 'border-orange-500/30 bg-orange-900/10',
    badge: 'border-orange-400/40 bg-orange-500/15 text-orange-300',
    dot: 'bg-orange-400',
    description: 'Core backend service. Handles all task CRUD, JWT auth, and proxies AI planning requests to the orchestrator. Persistent SQLite database on a Fly volume. Runs sqlx migrations on startup.',
    responsibilities: [
      'JWT issuance and verification — stateless, role-claim based',
      'Task CRUD — create, read, update (PATCH), delete with input validation',
      'AI plan proxy — forwards goal + context to orchestrator, returns task list',
      'Admin endpoints — metrics, request audit log, user activity',
      'CORS via tower-http, structured request logging with duration tracking',
    ],
  },
  {
    name: 'ai-orchestrator-service',
    label: 'AI Orchestrator',
    tech: 'Python · FastAPI · Anthropic SDK',
    color: 'border-purple-500/30 bg-purple-900/10',
    badge: 'border-purple-400/40 bg-purple-500/15 text-purple-300',
    dot: 'bg-purple-400',
    description: 'Internal-only service not exposed to the public internet. Receives planning requests from the Task API, constructs prompts, calls the Anthropic Claude API, and returns a structured task list.',
    responsibilities: [
      'Prompt construction — goal, existing task context, feedback, target count',
      'Claude API call via anthropic.AsyncAnthropic with configurable model and retries',
      'Response parsing — extracts task list from LLM output, normalises formatting',
      'Per-user rate limiting to prevent abuse',
      'Health and readiness endpoints for Fly.io probes',
    ],
  },
]

const REQUEST_FLOW = [
  { step: 1, actor: 'Browser', action: 'User submits a goal in the AI Planner form' },
  { step: 2, actor: 'Frontend', action: 'POST /api/v1/tasks/plan with Bearer JWT + goal payload' },
  { step: 3, actor: 'Task API', action: 'Validates JWT, extracts subject, checks rate limit' },
  { step: 4, actor: 'Task API', action: 'Fetches user\'s existing task titles for context' },
  { step: 5, actor: 'Task API', action: 'POST to AI Orchestrator (internal network only)' },
  { step: 6, actor: 'AI Orchestrator', action: 'Builds prompt, calls Anthropic Claude API' },
  { step: 7, actor: 'AI Orchestrator', action: 'Parses response, returns JSON task list' },
  { step: 8, actor: 'Task API', action: 'Returns plan to frontend' },
  { step: 9, actor: 'Frontend', action: 'Renders plan preview — user reviews and confirms' },
  { step: 10, actor: 'Frontend', action: 'POST /api/v1/tasks for each confirmed task (sequentially)' },
]

const DESIGN_DECISIONS = [
  {
    title: 'Why SQLite instead of Postgres?',
    body: 'SQLite on a persistent Fly volume eliminates connection pooling complexity, removes a managed database dependency, and keeps the task API self-contained. For a single-tenant portfolio project with moderate traffic, SQLite\'s write serialisation is not a bottleneck.',
  },
  {
    title: 'Why is the AI orchestrator a separate service?',
    body: 'Separating the LLM integration means the Python ecosystem (HTTPX, Pydantic, Anthropic SDK) is isolated from the Rust backend. Either service can be redeployed independently. The orchestrator can also be swapped for a different model or provider without touching the task API.',
  },
  {
    title: 'Why is the orchestrator not public-facing?',
    body: 'The AI orchestrator has no authentication of its own — it trusts all requests arriving on its internal Fly network. Keeping it private means only the task API (which does authenticate) can reach it. This avoids duplicating auth logic and limits the attack surface.',
  },
  {
    title: 'Why stateless JWT instead of sessions?',
    body: 'Stateless tokens let any instance of the task API verify a request without shared session storage. This makes horizontal scaling trivial and removes a Redis or DB dependency. Role claims are embedded in the token so admin access requires no extra database lookup.',
  },
  {
    title: 'Why a hash router instead of react-router-dom?',
    body: 'Hash routing works with a static file host without any server-side route configuration. The entire implementation is ~15 lines in main.tsx. For a project with fewer than ten routes, adding a routing library would be over-engineering.',
  },
]

export function ArchitecturePage() {
  return (
    <PageLayout title="Architecture">
      {/* Overview diagram (text-based) */}
      <section className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-white">System overview</h2>
        <p className="mb-5 text-sm leading-relaxed text-zinc-300">
          TaskForge is composed of three independently deployed services on Fly.io. The frontend communicates only with
          the Task API. The AI Orchestrator is internal-only and unreachable from the public internet.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-zinc-700/50 bg-zinc-950/60 p-4 font-mono text-xs leading-relaxed text-zinc-300">
          <pre>{`
  ┌─────────────────────────────┐
  │       Browser (User)        │
  └──────────────┬──────────────┘
                 │ HTTPS
  ┌──────────────▼──────────────┐
  │    task-portal-service      │  React SPA (Fly.io)
  │    (static files)           │
  └──────────────┬──────────────┘
                 │ HTTPS + JWT
  ┌──────────────▼──────────────┐
  │    task-api-service         │  Rust / Axum (Fly.io)
  │    SQLite on Fly volume     │
  └──────────────┬──────────────┘
                 │ Fly internal network only
  ┌──────────────▼──────────────┐
  │  ai-orchestrator-service    │  Python / FastAPI (Fly.io)
  │  Anthropic Claude API ──────┼──► api.anthropic.com
  └─────────────────────────────┘
`.trim()}</pre>
        </div>
      </section>

      {/* Service cards */}
      <section className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h2 className="mb-5 text-lg font-semibold text-white">Services</h2>
        <div className="space-y-4">
          {SERVICES.map((svc) => (
            <article key={svc.name} className={`rounded-2xl border p-5 ${svc.color}`}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${svc.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${svc.dot}`} />
                  {svc.label}
                </span>
                <code className="text-xs text-zinc-400">{svc.name}</code>
                <span className="ml-auto text-xs text-zinc-500">{svc.tech}</span>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-zinc-300">{svc.description}</p>
              <ul className="space-y-1">
                {svc.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2 text-xs text-zinc-400">
                    <span className="mt-0.5 shrink-0 text-zinc-600">›</span>
                    {r}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Request flow */}
      <section className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h2 className="mb-5 text-lg font-semibold text-white">AI planning request flow</h2>
        <ol className="space-y-2">
          {REQUEST_FLOW.map((item) => (
            <li key={item.step} className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/15 text-xs font-bold text-amber-300">
                {item.step}
              </span>
              <div className="flex min-w-0 flex-wrap items-baseline gap-2 pt-0.5">
                <span className="shrink-0 rounded border border-zinc-600/50 bg-zinc-800/60 px-1.5 py-px text-[10px] font-semibold text-zinc-400">
                  {item.actor}
                </span>
                <span className="text-sm text-zinc-300">{item.action}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Design decisions */}
      <section className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h2 className="mb-5 text-lg font-semibold text-white">Design decisions</h2>
        <div className="space-y-4">
          {DESIGN_DECISIONS.map((d) => (
            <div key={d.title} className="rounded-xl border border-zinc-700/40 bg-zinc-800/40 p-4">
              <h3 className="mb-2 text-sm font-semibold text-amber-200">{d.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <a
          href="#/"
          className="inline-block rounded-xl border border-zinc-600/50 bg-zinc-800/60 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500/60 hover:bg-zinc-700/60 hover:text-zinc-100"
        >
          ← Back to home
        </a>
      </div>
    </PageLayout>
  )
}
