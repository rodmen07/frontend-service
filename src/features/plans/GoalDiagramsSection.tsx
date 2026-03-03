import { GoalDiagram } from '../../components/GoalDiagram'
import type { GoalPlan } from '../../types'

interface GoalDiagramsSectionProps {
  goalPlans: GoalPlan[]
}

export function GoalDiagramsSection({ goalPlans }: GoalDiagramsSectionProps) {
  return (
    <section className="rounded-3xl border border-white/15 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
      <h2 className="mb-3 text-xl font-semibold text-white">Goal Diagrams</h2>
      <p className="mb-4 text-sm text-slate-300">
        Visual flow of generated goals and their composite tasks.
      </p>

      {goalPlans.length === 0 ? (
        <p className="text-sm text-slate-300">
          Generate a plan to create your first diagram.
        </p>
      ) : (
        <div className="space-y-4">
          {goalPlans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-2xl border border-white/15 bg-slate-800/50 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-100">{plan.goal}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(plan.createdAt).toLocaleString()}
                </span>
              </div>
              <GoalDiagram plan={plan} />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
