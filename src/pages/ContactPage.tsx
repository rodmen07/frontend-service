import { useState } from 'react'
import { PageLayout } from './PageLayout'
import { FocusCard } from '../features/layout/FocusCard'
import { HowItWorksSection } from '../features/site/HowItWorksSection'
import { MONITORING_URL } from '../config'

type Phase = 'idle' | 'sending' | 'sent' | 'error'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'Required'
    if (!email.trim()) errors.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email'
    if (!message.trim()) errors.message = 'Required'
    else if (message.trim().length < 10) errors.message = 'At least 10 characters'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setPhase('sending')
    try {
      const res = await fetch(`${MONITORING_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setPhase('sent')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setPhase('error')
    }
  }

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-lg border ${hasError ? 'border-red-500/60 bg-red-500/8' : 'border-zinc-700/60 bg-zinc-800/70'} px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition hover:border-zinc-600 focus:border-amber-400/55 focus:ring-2 focus:ring-amber-400/35`
  const labelClass = 'mb-1.5 block text-sm font-medium text-zinc-400'

  return (
    <PageLayout>
      <FocusCard>
      <section className="forge-panel surface-card-strong rounded-3xl p-8 shadow-2xl shadow-black/50 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold text-white">Get in touch</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Every engagement starts with a free 30-minute discovery call. Share your current
              stack, timeline, and constraints so we can quickly shape the right implementation path.
            </p>
          </div>
          <div className="surface-card rounded-xl px-4 py-3 text-xs text-zinc-300">
            <p className="font-semibold text-white">Typical response time</p>
            <p className="mt-1 text-zinc-400">Within 1 business day</p>
          </div>
        </div>

        {phase === 'sent' ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
              ✓ Message sent — I'll be in touch within 1 business day.
            </div>
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="btn-neutral px-5 py-2 text-sm"
            >
              Send another message
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>Your name <span className="text-red-400">*</span></label>
              <input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors(fe => ({ ...fe, name: '' })) }}
                className={fieldClass(!!fieldErrors.name)}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email <span className="text-red-400">*</span></label>
              <input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(fe => ({ ...fe, email: '' })) }}
                className={fieldClass(!!fieldErrors.email)}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="message" className={labelClass}>Message <span className="text-red-400">*</span></label>
            <textarea
              id="message"
              rows={5}
              placeholder="Tell me a bit about your stack, what you're trying to solve, and your rough timeline..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); setFieldErrors(fe => ({ ...fe, message: '' })) }}
              className={`${fieldClass(!!fieldErrors.message)} resize-none`}
            />
            {fieldErrors.message && <p className="mt-1 text-xs text-red-400">{fieldErrors.message}</p>}
          </div>

          {phase === 'error' && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Something went wrong — please try again or reach out directly below.
            </div>
          )}

          <button
            type="submit"
            disabled={phase === 'sending'}
            className="btn-accent px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {phase === 'sending' ? 'Sending…' : 'Send message →'}
          </button>
        </form>
        )}
      </section>
      </FocusCard>

      <FocusCard>
        <section className="forge-panel surface-card rounded-2xl p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Or reach me directly</p>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:rodmendoza07@gmail.com" className="btn-neutral px-4 py-2 text-sm">
              rodmendoza07@gmail.com
            </a>
            <a
              href="https://www.linkedin.com/in/roderick-mendoza-9133b7b5/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neutral px-4 py-2 text-sm"
            >
              LinkedIn →
            </a>
            <a
              href="https://www.upwork.com/freelancers/~01d4b41a81a0ae3ec6?mp_source=share"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neutral px-4 py-2 text-sm"
            >
              Upwork →
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-600">Based in San Antonio, TX — open to remote worldwide.</p>
          <p className="mt-1 text-xs text-zinc-600">Email link opens your default mail client — works best on mobile.</p>
        </section>
      </FocusCard>

      <FocusCard>
        <HowItWorksSection />
      </FocusCard>
    </PageLayout>
  )
}
