export type PlannerTone = 'info' | 'success' | 'warning'

export interface SiteContent {
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
}

export interface Task {
  id: number
  title: string
  completed: boolean
}

export interface GoalPlan {
  id: number
  goal: string
  tasks: string[]
  createdAt: string
}
