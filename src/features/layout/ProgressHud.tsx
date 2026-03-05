interface ProgressHudProps {
  completionPercent: number
  completedCount: number
  pendingLabel: number
  isAuthenticated: boolean
  currentSubject: string
}

export function ProgressHud({
  completionPercent,
  completedCount,
  pendingLabel,
  isAuthenticated,
  currentSubject,
}: ProgressHudProps) {
  return (
    <section className="sticky top-2 z-40 rounded-2xl border border-zinc-500/30 bg-zinc-900/75 p-3 shadow-xl shadow-black/40 backdrop-blur-xl">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <p className="font-semibold text-zinc-100">
          Progress HUD: <span className="text-amber-200">{completionPercent}% complete</span>
        </p>
        <div className="flex flex-wrap items-center gap-2 text-zinc-300">
          <span className="rounded-lg border border-zinc-500/40 bg-zinc-800/80 px-2 py-1">{completedCount} done</span>
          <span className="rounded-lg border border-zinc-500/40 bg-zinc-800/80 px-2 py-1">{pendingLabel} pending</span>
          <span className="rounded-lg border border-zinc-500/40 bg-zinc-800/80 px-2 py-1">
            {isAuthenticated ? `Signed in: ${currentSubject || 'user'}` : 'Signed out'}
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all duration-500"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </section>
  )
}
