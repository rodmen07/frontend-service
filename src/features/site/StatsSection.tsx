import type { AdminMetrics, Task } from '../../types'
import { writingTierForPoints } from '../tasks/useTaskManager'

interface StatsSectionProps {
  isAuthenticated: boolean
  isAdmin: boolean
  tasks: Task[]
  storyPoints: number
  pendingCount: number
  metrics: AdminMetrics | null
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}

function StatCard({ label, value, sub, accent = 'border-zinc-700/50 bg-zinc-800/60' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${accent}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-400">{sub}</p>}
    </div>
  )
}

export function StatsSection({
  isAuthenticated,
  isAdmin,
  tasks,
  storyPoints,
  pendingCount,
  metrics,
}: StatsSectionProps) {
  const completedCount = tasks.filter((t) => t.status === 'done').length
  const totalCount = tasks.length
  const tier = writingTierForPoints(storyPoints)
  const goalsSet = new Set(tasks.map((t) => t.goal).filter(Boolean)).size

  return (
    <section className="forge-panel rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold text-white">Your stats</h2>

      {!isAuthenticated ? (
        <div className="rounded-2xl border border-zinc-700/40 bg-zinc-800/40 px-5 py-8 text-center">
          <p className="text-sm text-zinc-400">Sign in to track your story points, tasks, and tier progression.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Story points"
              value={storyPoints}
              sub={`${tier} tier`}
              accent="border-amber-400/30 bg-amber-500/10"
            />
            <StatCard
              label="Tasks completed"
              value={completedCount}
              sub={totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% of ${totalCount}` : 'No tasks yet'}
            />
            <StatCard
              label="Pending"
              value={pendingCount}
              sub="across all goals"
            />
            <StatCard
              label="Active goals"
              value={goalsSet}
              sub="tracked goals"
            />
          </div>

          {isAdmin && metrics && (
            <>
              <p className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Platform — admin view
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Platform tasks"
                  value={metrics.total_tasks}
                  sub={`${metrics.completed_tasks} completed`}
                  accent="border-purple-400/30 bg-purple-500/10"
                />
                <StatCard
                  label="Active users"
                  value={metrics.unique_subjects}
                  sub="unique subjects"
                  accent="border-purple-400/30 bg-purple-500/10"
                />
                <StatCard
                  label="API requests"
                  value={metrics.total_requests.toLocaleString()}
                  sub="total processed"
                  accent="border-purple-400/30 bg-purple-500/10"
                />
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
