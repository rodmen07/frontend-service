import { GoalDiagram } from '../../components/GoalDiagram'
import type { GoalPlan } from '../../types'

interface GoalDiagramsSectionProps {
  goalPlans: GoalPlan[]
}

export function GoalDiagramsSection({ goalPlans }: GoalDiagramsSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold">Goal Diagrams</h2>
      <p className="mb-4 text-sm text-slate-600">
        Visual flow of generated goals and their composite tasks.
      </p>

      {goalPlans.length === 0 ? (
        <p className="text-sm text-slate-600">
          Generate a plan to create your first diagram.
        </p>
      ) : (
        <div className="space-y-4">
          {goalPlans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-800">{plan.goal}</h3>
                <span className="text-xs text-slate-500">
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
