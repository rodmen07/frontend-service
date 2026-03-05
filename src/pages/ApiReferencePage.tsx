import { useState } from 'react'
import { PageLayout } from './PageLayout'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface Param {
  name: string
  type: string
  required: boolean
  description: string
}

interface Endpoint {
  method: HttpMethod
  path: string
  summary: string
  auth: boolean
  adminOnly?: boolean
  queryParams?: Param[]
  bodyParams?: Param[]
  responseShape?: string
  notes?: string
}

interface EndpointGroup {
  label: string
  endpoints: Endpoint[]
}

const GROUPS: EndpointGroup[] = [
  {
    label: 'Auth',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/auth/token',
        summary: 'Issue a JWT for a subject (username)',
        auth: false,
        bodyParams: [
          { name: 'subject', type: 'string', required: true, description: 'Username (1–40 chars, alphanumeric + hyphens)' },
        ],
        responseShape: '{ access_token, token_type, expires_in }',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/token/admin',
        summary: 'Issue a JWT with admin role claim',
        auth: false,
        bodyParams: [
          { name: 'subject', type: 'string', required: true, description: 'Admin username' },
          { name: 'admin_secret', type: 'string', required: true, description: 'Server-side secret (Fly secret)' },
        ],
        responseShape: '{ access_token, token_type, expires_in }',
      },
      {
        method: 'POST',
        path: '/api/v1/auth/token/verify',
        summary: 'Verify a JWT and return its claims',
        auth: false,
        bodyParams: [
          { name: 'token', type: 'string', required: true, description: 'The JWT to verify' },
        ],
        responseShape: '{ active, subject, roles, exp, issuer }',
      },
    ],
  },
  {
    label: 'Tasks',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/tasks',
        summary: 'List all tasks for the authenticated user',
        auth: true,
        queryParams: [
          { name: 'limit', type: 'number', required: false, description: 'Max results (default 50)' },
          { name: 'offset', type: 'number', required: false, description: 'Pagination offset (default 0)' },
          { name: 'completed', type: 'boolean', required: false, description: 'Filter by completion state' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status: todo | doing | done' },
          { name: 'q', type: 'string', required: false, description: 'Full-text search across title and goal' },
        ],
        responseShape: 'Task[]',
      },
      {
        method: 'POST',
        path: '/api/v1/tasks',
        summary: 'Create a new task',
        auth: true,
        bodyParams: [
          { name: 'title', type: 'string', required: true, description: 'Task title (1–120 chars)' },
          { name: 'difficulty', type: 'number', required: false, description: 'Story points 1–6 (default 1)' },
          { name: 'goal', type: 'string', required: false, description: 'Goal label for grouping (≤160 chars)' },
          { name: 'status', type: 'string', required: false, description: 'todo | doing | done (default todo)' },
          { name: 'source', type: 'string', required: false, description: 'manual | ai_generated (default manual)' },
          { name: 'due_date', type: 'string', required: false, description: 'ISO 8601 date string e.g. 2025-12-31' },
        ],
        responseShape: 'Task',
        notes: 'Returns 201 Created with the created Task object.',
      },
      {
        method: 'PATCH',
        path: '/api/v1/tasks/:id',
        summary: 'Partially update a task',
        auth: true,
        bodyParams: [
          { name: 'title', type: 'string', required: false, description: 'New title (1–120 chars)' },
          { name: 'completed', type: 'boolean', required: false, description: 'Sets status to done/todo accordingly' },
          { name: 'difficulty', type: 'number', required: false, description: '1–6' },
          { name: 'goal', type: 'string', required: false, description: 'Update goal label' },
          { name: 'status', type: 'string', required: false, description: 'todo | doing | done' },
          { name: 'due_date', type: 'string', required: false, description: 'ISO date or empty string to clear' },
        ],
        responseShape: 'Task',
        notes: 'Only supplied fields are updated. Sending status and completed together is allowed — status takes precedence.',
      },
      {
        method: 'DELETE',
        path: '/api/v1/tasks/:id',
        summary: 'Delete a task by ID',
        auth: true,
        responseShape: '204 No Content',
      },
    ],
  },
  {
    label: 'AI Planner',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/tasks/plan',
        summary: 'Generate an AI task plan for a goal',
        auth: true,
        bodyParams: [
          { name: 'goal', type: 'string', required: true, description: 'Short-term goal (1–500 chars)' },
          { name: 'feedback', type: 'string', required: false, description: 'Refinement instructions (≤500 chars)' },
          { name: 'target_count', type: 'number', required: false, description: 'Requested task count 1–15 (default 7)' },
        ],
        responseShape: '{ goal, tasks: string[] }',
        notes: 'Proxied to the AI Orchestrator. Returns 429 if per-user rate limit is exceeded.',
      },
      {
        method: 'DELETE',
        path: '/api/v1/tasks/plan',
        summary: 'Delete all AI-generated tasks under a specific goal',
        auth: true,
        queryParams: [
          { name: 'goal', type: 'string', required: true, description: 'Goal label to clear (exact match)' },
        ],
        responseShape: '{ deleted, goal }',
      },
    ],
  },
  {
    label: 'Admin',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/admin/metrics',
        summary: 'Platform-wide aggregate metrics',
        auth: true,
        adminOnly: true,
        responseShape: '{ total_tasks, completed_tasks, pending_tasks, total_requests, unique_subjects }',
      },
      {
        method: 'GET',
        path: '/api/v1/admin/requests',
        summary: 'Paginated request audit log',
        auth: true,
        adminOnly: true,
        queryParams: [
          { name: 'limit', type: 'number', required: false, description: 'Max results (default 50)' },
          { name: 'offset', type: 'number', required: false, description: 'Pagination offset' },
        ],
        responseShape: 'AdminRequestLog[]',
      },
      {
        method: 'GET',
        path: '/api/v1/admin/users',
        summary: 'Per-subject activity summary',
        auth: true,
        adminOnly: true,
        queryParams: [
          { name: 'limit', type: 'number', required: false, description: 'Max results (default 50)' },
          { name: 'offset', type: 'number', required: false, description: 'Pagination offset' },
        ],
        responseShape: 'AdminUserActivity[]',
      },
    ],
  },
  {
    label: 'Health',
    endpoints: [
      {
        method: 'GET',
        path: '/health',
        summary: 'Liveness probe — always returns 200 if the process is running',
        auth: false,
        responseShape: '{ status: "ok" }',
      },
      {
        method: 'GET',
        path: '/ready',
        summary: 'Readiness probe — returns 200 only after migrations succeed',
        auth: false,
        responseShape: '{ status: "ready" }',
      },
    ],
  },
]

const METHOD_COLOR: Record<HttpMethod, string> = {
  GET:    'border-sky-400/40 bg-sky-500/10 text-sky-300',
  POST:   'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  PATCH:  'border-amber-400/40 bg-amber-500/10 text-amber-300',
  DELETE: 'border-red-400/40 bg-red-500/10 text-red-300',
}

const TASK_SHAPE = `{
  id:         number
  title:      string
  completed:  boolean
  difficulty: number        // 1–6
  goal:       string | null
  status:     "todo" | "doing" | "done"
  source:     "manual" | "ai_generated"
  due_date:   string | null // ISO date or null
}`

export function ApiReferencePage() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(GROUPS.map((g) => g.label)))

  function toggle(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <PageLayout title="API Reference">
      {/* Base URL */}
      <section className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Base URL</h2>
        <code className="block rounded-lg border border-zinc-700/50 bg-zinc-950/60 px-4 py-2.5 text-sm text-amber-300">
          https://taskforge-api.fly.dev
        </code>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          All endpoints accept and return <span className="text-zinc-200">application/json</span>.
          Authenticated routes require an <span className="text-zinc-200">Authorization: Bearer &lt;token&gt;</span> header.
          Tokens are issued by the <code className="text-zinc-300">/api/v1/auth/token</code> endpoint and expire after 24 hours.
        </p>
      </section>

      {/* Task shape */}
      <section className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">Task object</h2>
        <pre className="overflow-x-auto rounded-lg border border-zinc-700/50 bg-zinc-950/60 px-4 py-3 text-xs leading-relaxed text-zinc-300">
          {TASK_SHAPE}
        </pre>
      </section>

      {/* Endpoint groups */}
      {GROUPS.map((group) => {
        const isOpen = openGroups.has(group.label)
        return (
          <section key={group.label} className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(group.label)}
              className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
            >
              <h2 className="text-lg font-semibold text-white">{group.label}</h2>
              <span className="flex items-center gap-2">
                <span className="rounded-full border border-zinc-600/40 bg-zinc-800/60 px-2 py-px text-[11px] text-zinc-400">
                  {group.endpoints.length} endpoint{group.endpoints.length !== 1 ? 's' : ''}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {isOpen && (
              <div className="divide-y divide-zinc-800/60 border-t border-zinc-700/40">
                {group.endpoints.map((ep) => (
                  <div key={`${ep.method}-${ep.path}`} className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[11px] font-bold uppercase ${METHOD_COLOR[ep.method]}`}>
                        {ep.method}
                      </span>
                      <code className="text-sm text-zinc-100">{ep.path}</code>
                      {ep.auth && (
                        <span className="rounded border border-zinc-600/40 bg-zinc-800/60 px-1.5 py-px text-[10px] text-zinc-400">
                          auth
                        </span>
                      )}
                      {ep.adminOnly && (
                        <span className="rounded border border-amber-400/30 bg-amber-500/10 px-1.5 py-px text-[10px] text-amber-300">
                          admin
                        </span>
                      )}
                    </div>

                    <p className="mb-3 text-sm text-zinc-300">{ep.summary}</p>

                    {ep.queryParams && ep.queryParams.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Query parameters</p>
                        <div className="overflow-x-auto rounded-lg border border-zinc-700/40 bg-zinc-950/40">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-zinc-800/60">
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Name</th>
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Type</th>
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Required</th>
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40">
                              {ep.queryParams.map((p) => (
                                <tr key={p.name}>
                                  <td className="px-3 py-2 font-mono text-amber-200">{p.name}</td>
                                  <td className="px-3 py-2 text-zinc-400">{p.type}</td>
                                  <td className="px-3 py-2">{p.required ? <span className="text-rose-400">yes</span> : <span className="text-zinc-600">no</span>}</td>
                                  <td className="px-3 py-2 text-zinc-300">{p.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {ep.bodyParams && ep.bodyParams.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Request body</p>
                        <div className="overflow-x-auto rounded-lg border border-zinc-700/40 bg-zinc-950/40">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-zinc-800/60">
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Field</th>
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Type</th>
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Required</th>
                                <th className="px-3 py-2 text-left font-semibold text-zinc-400">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/40">
                              {ep.bodyParams.map((p) => (
                                <tr key={p.name}>
                                  <td className="px-3 py-2 font-mono text-amber-200">{p.name}</td>
                                  <td className="px-3 py-2 text-zinc-400">{p.type}</td>
                                  <td className="px-3 py-2">{p.required ? <span className="text-rose-400">yes</span> : <span className="text-zinc-600">no</span>}</td>
                                  <td className="px-3 py-2 text-zinc-300">{p.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Response</span>
                        <code className="rounded border border-zinc-700/40 bg-zinc-950/60 px-2 py-0.5 text-xs text-zinc-300">{ep.responseShape}</code>
                      </div>
                      {ep.notes && (
                        <p className="text-xs text-zinc-500 italic">{ep.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}

      {/* Error format */}
      <section className="rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <h2 className="mb-3 text-lg font-semibold text-white">Error responses</h2>
        <p className="mb-3 text-sm text-zinc-400">All errors return a consistent JSON envelope:</p>
        <pre className="mb-4 overflow-x-auto rounded-lg border border-zinc-700/50 bg-zinc-950/60 px-4 py-3 text-xs text-zinc-300">{`{
  "code":    "TASK_NOT_FOUND",      // machine-readable error code
  "message": "task not found",      // human-readable description
  "details": { ... }                // optional — validation field errors etc.
}`}</pre>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { status: '400', label: 'Validation error' },
            { status: '401', label: 'Missing or invalid JWT' },
            { status: '403', label: 'Insufficient role' },
            { status: '404', label: 'Resource not found' },
            { status: '429', label: 'Rate limit exceeded' },
            { status: '500', label: 'Internal server error' },
          ].map((e) => (
            <div key={e.status} className="flex items-center gap-2 rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-2">
              <span className="font-mono text-sm font-bold text-rose-300">{e.status}</span>
              <span className="text-xs text-zinc-400">{e.label}</span>
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
