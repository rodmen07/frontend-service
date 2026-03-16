import { useEffect, useRef, useState, useCallback } from 'react'
import { AI_ORCHESTRATOR_URL } from '../../config'

const COOLDOWN_MS = 60_000
const STORAGE_KEY = 'rmcc_consult_last'

function secondsLeft(): number {
  const last = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)
  const elapsed = Date.now() - last
  return elapsed >= COOLDOWN_MS ? 0 : Math.ceil((COOLDOWN_MS - elapsed) / 1000)
}

type ConsultState =
  | { phase: 'idle' }
  | { phase: 'cooldown'; secondsLeft: number }
  | { phase: 'loading'; elapsed: number }
  | { phase: 'ready'; response: string }
  | { phase: 'error'; message: string }
  | { phase: 'disabled' }

export function AskAISection() {
  const [description, setDescription] = useState('')
  const [state, setState] = useState<ConsultState>(() => {
    if (!AI_ORCHESTRATOR_URL) return { phase: 'disabled' }
    const secs = secondsLeft()
    if (secs > 0) return { phase: 'cooldown', secondsLeft: secs }
    return { phase: 'idle' }
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (state.phase !== 'cooldown') return
    timerRef.current = setInterval(() => {
      const secs = secondsLeft()
      if (secs <= 0) {
        clearInterval(timerRef.current!)
        setState({ phase: 'idle' })
      } else {
        setState({ phase: 'cooldown', secondsLeft: secs })
      }
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'loading') { elapsedRef.current = 0; return }
    elapsedRef.current = 0
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1
      setState({ phase: 'loading', elapsed: elapsedRef.current })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [state.phase === 'loading'])

  async function submit() {
    const trimmed = description.trim()
    if (!trimmed || !AI_ORCHESTRATOR_URL) return

    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setState({ phase: 'loading', elapsed: 0 })

    try {
      const r = await fetch(`${AI_ORCHESTRATOR_URL}/consult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmed }),
      })
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(body.detail ?? `HTTP ${r.status}`)
      }
      const data = await r.json()
      const response: string = data.response ?? ''
      if (!response) throw new Error('No response returned')
      setState({ phase: 'ready', response })
    } catch (e) {
      setState({ phase: 'error', message: (e as Error).message })
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function startCooldown() {
    const secs = secondsLeft()
    if (secs > 0) setState({ phase: 'cooldown', secondsLeft: secs })
  }

  const canSubmit = state.phase === 'idle' || state.phase === 'error'

  if (state.phase === 'disabled') return null

  return (
    <section className="forge-panel space-y-4 rounded-2xl border border-zinc-500/30 bg-zinc-900/80 p-6 backdrop-blur-xl">
      <div>
        <h2 className="text-lg font-bold text-white">How Can I Help?</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Describe your project or problem — get a direct answer on how I can help.
        </p>
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. We're a small fintech startup that needs to migrate from a monolith to a containerised architecture on AWS. We have a 3-person eng team and a hard deadline in Q3."
          rows={3}
          disabled={!canSubmit}
          className="w-full resize-none rounded-xl border border-zinc-600/40 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
              submit()
              startCooldown()
            }
          }}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => { submit(); startCooldown() }}
            disabled={!canSubmit || !description.trim()}
            className="btn-accent px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.phase === 'loading'
              ? <span className="flex items-center gap-2"><svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Thinking…</span>
              : 'Ask →'
            }
          </button>
          {state.phase === 'cooldown' && (
            <span className="text-xs text-zinc-500">
              Next question available in {state.secondsLeft}s
            </span>
          )}
          {canSubmit && state.phase !== 'error' && (
            <span className="text-xs text-zinc-600">or Cmd+Enter</span>
          )}
        </div>
      </div>

      {state.phase === 'loading' && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="mb-3 flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-amber-300">
              Generating response
              <span className="ml-1 inline-flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="inline-block h-1 w-1 animate-bounce rounded-full bg-amber-400"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </span>
            <span className="ml-auto text-xs text-zinc-500">{state.elapsed}s</span>
          </div>
          <div className="space-y-2">
            {[92, 78, 55].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded-full bg-zinc-700/50"
                style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {state.phase === 'error' && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
          <p className="text-sm font-medium text-red-300">Something went wrong</p>
          <p className="mt-1 text-xs text-red-400/80">{state.message}</p>
        </div>
      )}

      {state.phase === 'ready' && (
        <div className="rounded-xl border border-zinc-700/40 bg-zinc-800/40 p-4">
          <div className="space-y-3">
            {state.response.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-zinc-200">
                {para}
              </p>
            ))}
          </div>
          <div className="mt-4 border-t border-zinc-700/40 pt-3">
            <p className="text-xs text-zinc-500">
              Ready to move forward?{' '}
              <a href="#/contact" className="text-amber-400 transition-colors hover:text-amber-300">
                Get in touch →
              </a>
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
