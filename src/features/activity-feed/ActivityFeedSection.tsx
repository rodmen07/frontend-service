import { useEffect, useState } from 'react'
import type { Task } from '../../types'
import { listActivities, type Activity } from '../../api/activities'

interface FeedItem {
  id: string
  type: 'task_completed' | 'plan_generated' | 'crm_activity'
  title: string
  subtitle?: string
  timestamp: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

function deriveFeedItems(tasks: Task[], activities: Activity[]): FeedItem[] {
  const items: FeedItem[] = []

  // Completed tasks
  for (const task of tasks) {
    if (task.completed) {
      items.push({
        id: `task-${task.id}`,
        type: 'task_completed',
        title: task.title,
        subtitle: task.goal ?? undefined,
        timestamp: task.created_at,
      })
    }
  }

  // AI plan groups — one entry per unique goal that has ai_generated tasks
  const planGoals = new Map<string, { count: number; timestamp: string }>()
  for (const task of tasks) {
    if (task.source === 'ai_generated' && task.goal) {
      const existing = planGoals.get(task.goal)
      if (!existing || task.created_at < existing.timestamp) {
        planGoals.set(task.goal, {
          count: (existing?.count ?? 0) + 1,
          timestamp: existing ? existing.timestamp : task.created_at,
        })
      } else {
        planGoals.set(task.goal, { count: existing.count + 1, timestamp: existing.timestamp })
      }
    }
  }
  for (const [goal, { count, timestamp }] of planGoals) {
    items.push({
      id: `plan-${goal}`,
      type: 'plan_generated',
      title: `AI plan: "${goal}"`,
      subtitle: `${count} task${count !== 1 ? 's' : ''} generated`,
      timestamp,
    })
  }

  // CRM activities
  for (const activity of activities) {
    items.push({
      id: `activity-${activity.id}`,
      type: 'crm_activity',
      title: activity.subject,
      subtitle: activity.activity_type,
      timestamp: activity.created_at,
    })
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return items.slice(0, 30)
}

const DOT_COLOR: Record<FeedItem['type'], string> = {
  task_completed: 'bg-green-500',
  plan_generated: 'bg-amber-500',
  crm_activity: 'bg-blue-500',
}

const LABEL: Record<FeedItem['type'], string> = {
  task_completed: 'Task completed',
  plan_generated: 'AI plan',
  crm_activity: 'CRM',
}

const LABEL_COLOR: Record<FeedItem['type'], string> = {
  task_completed: 'text-green-400',
  plan_generated: 'text-amber-400',
  crm_activity: 'text-blue-400',
}

interface Props {
  tasks: Task[]
  token: string
  isAuthenticated: boolean
}

export function ActivityFeedSection({ tasks, token, isAuthenticated }: Props) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    listActivities(token).then(setActivities).catch(() => {
      // Service unavailable — show task events only
    })
  }, [isAuthenticated, token])

  const items = deriveFeedItems(tasks, activities)

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="mb-1 text-lg font-semibold text-zinc-100">Activity Feed</h2>
      <p className="mb-6 text-sm text-zinc-400">
        Recent task completions, AI plans, and CRM events.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No activity yet — complete a task or add a CRM activity to see your feed.
        </p>
      ) : (
        <ol className="relative border-l border-zinc-700">
          {items.map((item) => (
            <li key={item.id} className="mb-6 ml-4 last:mb-0">
              <span
                className={`absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-900 ${DOT_COLOR[item.type]}`}
              />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{item.title}</p>
                  {item.subtitle && (
                    <p className="truncate text-xs text-zinc-500">{item.subtitle}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className={`text-xs font-medium ${LABEL_COLOR[item.type]}`}>
                    {LABEL[item.type]}
                  </span>
                  <span className="text-xs text-zinc-600">{timeAgo(item.timestamp)}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
