import { useState, useEffect, useCallback, useRef } from 'react'
import { PageLayout } from './PageLayout'
import { useAuth } from '../features/auth/AuthContext'
import { PROJECTS_API_BASE_URL } from '../config'

// --- Types ---

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  target_end_date: string | null
}

interface Milestone {
  id: string
  project_id: string
  name: string
  description: string | null
  due_date: string | null
  status: string
  sort_order: number
}

interface Deliverable {
  id: string
  milestone_id: string
  name: string
  description: string | null
  status: string
}

interface Message {
  id: string
  project_id: string
  author_id: string
  author_role: string
  body: string
  created_at: string
}

// --- API helper ---

async function api<T>(path: string, token: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PROJECTS_API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...opts.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `${res.status} ${res.statusText}`)
  }
  return res.json()
}

// --- Sub-components ---

const STATUS_STYLES: Record<string, string> = {
  planning:    'bg-zinc-700/40 text-zinc-300',
  active:      'bg-emerald-500/15 text-emerald-300',
  on_hold:     'bg-amber-500/15 text-amber-300',
  completed:   'bg-blue-500/15 text-blue-300',
  cancelled:   'bg-red-500/15 text-red-300',
  pending:     'bg-zinc-700/40 text-zinc-400',
  in_progress: 'bg-amber-500/15 text-amber-300',
  blocked:     'bg-red-500/15 text-red-400',
  done:        'bg-emerald-500/15 text-emerald-300',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status.toLowerCase()] ?? 'bg-zinc-700/40 text-zinc-400'
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function DeliverableRow({ d }: { d: Deliverable }) {
  const done = d.status === 'completed' || d.status === 'done'
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className={`mt-0.5 h-4 w-4 shrink-0 rounded border text-center text-[10px] leading-[14px] ${
        done ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-zinc-600/40 bg-zinc-800/40 text-zinc-500'
      }`}>
        {done ? '✓' : ''}
      </span>
      <div className="min-w-0">
        <p className={`text-sm ${done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{d.name}</p>
        {d.description && <p className="mt-0.5 text-xs text-zinc-500">{d.description}</p>}
      </div>
      <StatusBadge status={d.status} />
    </div>
  )
}

function MilestoneCard({ milestone, deliverables }: { milestone: Milestone; deliverables: Deliverable[] }) {
  const [open, setOpen] = useState(true)
  const total = deliverables.length
  const done = deliverables.filter((d) => d.status === 'completed' || d.status === 'done').length

  return (
    <div className="forge-panel surface-card-strong overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-100">{milestone.name}</span>
          <StatusBadge status={milestone.status} />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {milestone.due_date && (
            <span className="text-xs text-zinc-500">Due {milestone.due_date.slice(0, 10)}</span>
          )}
          {total > 0 && (
            <span className="text-xs text-zinc-400">{done}/{total}</span>
          )}
          <span className="text-xs text-zinc-500">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-700/40 px-4 pb-3">
          {milestone.description && (
            <p className="py-2 text-xs text-zinc-400">{milestone.description}</p>
          )}
          {total > 0 && (
            <>
              {total > 1 && (
                <div className="mb-3 mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                    style={{ width: `${(done / total) * 100}%` }}
                  />
                </div>
              )}
              <div className="divide-y divide-zinc-700/20">
                {deliverables.map((d) => <DeliverableRow key={d.id} d={d} />)}
              </div>
            </>
          )}
          {total === 0 && (
            <p className="py-2 text-xs text-zinc-500">No deliverables yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

function MessageThread({
  messages,
  onSend,
  currentUserId,
  sending,
}: {
  messages: Message[]
  onSend: (body: string) => Promise<void>
  currentUserId: string
  sending: boolean
}) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body) return
    setDraft('')
    await onSend(body)
  }

  return (
    <div className="forge-panel surface-card-strong flex flex-col">
      <div className="border-b border-zinc-700/40 px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-200">Messages</h3>
      </div>

      <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-zinc-500">No messages yet. Ask a question below.</p>
        )}
        {messages.map((m) => {
          const isMe = m.author_id === currentUserId
          return (
            <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <span className={`mt-1 h-6 w-6 shrink-0 rounded-full text-center text-[10px] leading-6 ${
                m.author_role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-zinc-700/60 text-zinc-300'
              }`}>
                {m.author_role === 'admin' ? 'A' : 'C'}
              </span>
              <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                isMe
                  ? 'bg-amber-500/15 text-zinc-100'
                  : 'bg-zinc-800/60 text-zinc-200'
              }`}>
                {m.body}
                <p className="mt-1 text-[10px] text-zinc-500">{m.created_at.slice(0, 16).replace('T', ' ')}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="border-t border-zinc-700/40 p-3 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question or request an update…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-600/50 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-400/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="btn-accent btn-sm shrink-0 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}

// --- Main page ---

export function PortalPage() {
  const { token, claims } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [deliverablesByMilestone, setDeliverablesByMilestone] = useState<Record<string, Deliverable[]>>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'no_project'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      window.location.hash = '#/portal/login'
    }
  }, [token])

  const load = useCallback(async () => {
    if (!token) return
    setStatus('loading')
    setError(null)

    try {
      const projects = await api<Project[]>('/api/v1/projects', token)
      if (projects.length === 0) {
        setStatus('no_project')
        return
      }

      const p = projects[0]
      setProject(p)

      const [ms, msgs] = await Promise.all([
        api<Milestone[]>(`/api/v1/projects/${p.id}/milestones`, token),
        api<Message[]>(`/api/v1/projects/${p.id}/messages`, token),
      ])

      const sorted = [...ms].sort((a, b) => a.sort_order - b.sort_order)
      setMilestones(sorted)
      setMessages(msgs)

      const deliverables = await Promise.all(
        sorted.map((m) =>
          api<Deliverable[]>(`/api/v1/milestones/${m.id}/deliverables`, token)
            .then((ds) => ({ id: m.id, ds }))
            .catch(() => ({ id: m.id, ds: [] }))
        )
      )

      const byId: Record<string, Deliverable[]> = {}
      deliverables.forEach(({ id, ds }) => { byId[id] = ds })
      setDeliverablesByMilestone(byId)

      setStatus('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project data')
      setStatus('error')
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const sendMessage = async (body: string) => {
    if (!token || !project) return
    setSending(true)
    try {
      const msg = await api<Message>(
        `/api/v1/projects/${project.id}/messages`,
        token,
        { method: 'POST', body: JSON.stringify({ body }) }
      )
      setMessages((prev) => [...prev, msg])
    } catch {
      // silently fail — user still sees their draft cleared
    } finally {
      setSending(false)
    }
  }

  if (!token) return null

  if (!PROJECTS_API_BASE_URL) {
    return (
      <PageLayout title="Client portal">
        <p className="text-sm text-amber-400">VITE_PROJECTS_API_BASE_URL is not configured.</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Client portal">
      {status === 'loading' && (
        <p className="text-sm text-zinc-400">Loading your project…</p>
      )}

      {status === 'error' && (
        <div className="forge-panel surface-card-strong p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button className="btn-neutral btn-sm mt-3" onClick={load}>Retry</button>
        </div>
      )}

      {status === 'no_project' && (
        <div className="forge-panel surface-card-strong p-6 text-center">
          <p className="text-sm text-zinc-300">No project has been assigned to your account yet.</p>
          <p className="mt-1 text-xs text-zinc-500">
            Reach out via the <a href="#/contact" className="text-amber-400 hover:text-amber-300">contact page</a> if you think this is a mistake.
          </p>
        </div>
      )}

      {status === 'idle' && project && (
        <div className="space-y-5">
          {/* Project header */}
          <div className="forge-panel surface-card-strong p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">{project.name}</h2>
                {project.description && (
                  <p className="mt-1 text-sm text-zinc-400">{project.description}</p>
                )}
              </div>
              <StatusBadge status={project.status} />
            </div>
            {(project.start_date || project.target_end_date) && (
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                {project.start_date && <span>Started {project.start_date.slice(0, 10)}</span>}
                {project.target_end_date && <span>Target {project.target_end_date.slice(0, 10)}</span>}
              </div>
            )}
          </div>

          {/* Milestones */}
          {milestones.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Timeline</h3>
              {milestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  deliverables={deliverablesByMilestone[m.id] ?? []}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No milestones have been set yet.</p>
          )}

          {/* Messages */}
          <MessageThread
            messages={messages}
            onSend={sendMessage}
            currentUserId={claims?.sub ?? ''}
            sending={sending}
          />
        </div>
      )}
    </PageLayout>
  )
}
