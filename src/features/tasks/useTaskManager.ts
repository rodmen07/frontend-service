import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createTaskWithDifficulty,
  deleteTask,
  listTasks,
  planTasksFromGoal,
  updateTask,
} from '../../api/tasks'
import type { GoalPlan, PlannerTone, Task } from '../../types'
import { normalizePlanTask, normalizePlanTasks } from './planNormalization'
import { playCelebrationSound, playTaskCompletionSound } from './taskAudio'

export interface PlannerStatus {
  tone: PlannerTone
  message: string
}

const INITIAL_PLANNER_STATUS: PlannerStatus = {
  tone: 'info',
  message: 'Planner ready. Enter a long-term goal to generate task breakdowns.',
}

const PROGRESSION_STORAGE_KEY = 'taskforge.gamification.progress'

interface ProgressState {
  forgedPoints: number
  rubies: number
  completedTaskIds: number[]
  rewardedPlanIds: number[]
}

function normalizeDifficulty(value: number): number {
  const rounded = Math.round(value)
  if (rounded < 1) {
    return 1
  }

  if (rounded > 5) {
    return 5
  }

  return rounded
}

function readProgressState(): ProgressState {
  try {
    const raw = window.localStorage.getItem(PROGRESSION_STORAGE_KEY)
    if (!raw) {
      return { forgedPoints: 0, rubies: 0, completedTaskIds: [], rewardedPlanIds: [] }
    }

    const parsed = JSON.parse(raw) as ProgressState
    return {
      forgedPoints: Number(parsed.forgedPoints) || 0,
      rubies: Number(parsed.rubies) || 0,
      completedTaskIds: Array.isArray(parsed.completedTaskIds)
        ? parsed.completedTaskIds.filter((value): value is number => Number.isInteger(value))
        : [],
      rewardedPlanIds: Array.isArray(parsed.rewardedPlanIds)
        ? parsed.rewardedPlanIds.filter((value): value is number => Number.isInteger(value))
        : [],
    }
  } catch {
    return { forgedPoints: 0, rubies: 0, completedTaskIds: [], rewardedPlanIds: [] }
  }
}

export function useTaskManager(isAuthenticated: boolean) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDifficulty, setTaskDifficulty] = useState(1)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [taskError, setTaskError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [workingTaskId, setWorkingTaskId] = useState<number | null>(null)
  const [goalInput, setGoalInput] = useState('')
  const [plannedTasks, setPlannedTasks] = useState<string[]>([])
  const [planning, setPlanning] = useState(false)
  const [plannedTaskDifficulty, setPlannedTaskDifficulty] = useState(2)
  const [creatingPlanTasks, setCreatingPlanTasks] = useState(false)
  const [plannerStatus, setPlannerStatus] = useState<PlannerStatus>(INITIAL_PLANNER_STATUS)
  const [goalPlans, setGoalPlans] = useState<GoalPlan[]>([])
  const [celebrationToken, setCelebrationToken] = useState(0)
  const [forgedPoints, setForgedPoints] = useState(0)
  const [rubies, setRubies] = useState(0)
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<number>>(new Set())
  const [rewardedPlanIds, setRewardedPlanIds] = useState<Set<number>>(new Set())
  const previousPendingRef = useRef<number | null>(null)

  useEffect(() => {
    const progress = readProgressState()
    setForgedPoints(progress.forgedPoints)
    setRubies(progress.rubies)
    setCompletedTaskIds(new Set(progress.completedTaskIds))
    setRewardedPlanIds(new Set(progress.rewardedPlanIds))
  }, [])

  useEffect(() => {
    const serializable: ProgressState = {
      forgedPoints,
      rubies,
      completedTaskIds: Array.from(completedTaskIds),
      rewardedPlanIds: Array.from(rewardedPlanIds),
    }
    window.localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(serializable))
  }, [completedTaskIds, forgedPoints, rewardedPlanIds, rubies])

  const pendingCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  )

  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) {
      setTasks([])
      setTasksLoading(false)
      return
    }

    setTasksLoading(true)
    setTaskError('')

    try {
      const payload = await listTasks()
      setTasks(Array.isArray(payload) ? payload : [])
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : 'Failed to load tasks')
    } finally {
      setTasksLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setTasks([])
      setTasksLoading(false)
      return
    }

    loadTasks()
  }, [isAuthenticated, loadTasks])

  useEffect(() => {
    const previousPending = previousPendingRef.current
    previousPendingRef.current = pendingCount

    if (previousPending === null) {
      return
    }

    if (tasks.length > 0 && previousPending > 0 && pendingCount === 0) {
      playCelebrationSound()
      setCelebrationToken(Date.now())
    }
  }, [pendingCount, tasks.length])

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setTaskError('Sign in is required to create tasks')
      return
    }

    const normalizedTitle = taskTitle.trim()
    if (!normalizedTitle) {
      setTaskError('Title is required')
      return
    }

    setSubmitting(true)
    setTaskError('')

    try {
      const createdTask = await createTaskWithDifficulty(
        normalizedTitle,
        normalizeDifficulty(taskDifficulty),
      )
      setTasks((current) => [...current, createdTask])
      setTaskTitle('')
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : 'Failed to create task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleTask = async (task: Task) => {
    if (!isAuthenticated) {
      setTaskError('Sign in is required to update tasks')
      return
    }

    setWorkingTaskId(task.id)
    setTaskError('')

    try {
      const updatedTask = await updateTask(task.id, { completed: !task.completed })
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? updatedTask : item)),
      )
      if (!task.completed && updatedTask.completed) {
        if (!completedTaskIds.has(task.id)) {
          setForgedPoints((current) => current + normalizeDifficulty(updatedTask.difficulty))
          setCompletedTaskIds((current) => new Set(current).add(task.id))
        }
        playTaskCompletionSound()
      }
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : 'Failed to update task')
    } finally {
      setWorkingTaskId(null)
    }
  }

  const handleDeleteTask = async (task: Task) => {
    if (!isAuthenticated) {
      setTaskError('Sign in is required to delete tasks')
      return
    }

    setWorkingTaskId(task.id)
    setTaskError('')

    try {
      await deleteTask(task.id)
      setTasks((current) => current.filter((item) => item.id !== task.id))
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : 'Failed to delete task')
    } finally {
      setWorkingTaskId(null)
    }
  }

  const handleGeneratePlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isAuthenticated) {
      setTaskError('Sign in is required to generate plans')
      setPlannerStatus({
        tone: 'warning',
        message: 'Sign in before generating a plan.',
      })
      return
    }

    const goal = goalInput.trim()
    if (!goal) {
      setTaskError('A long-term goal is required')
      setPlannerStatus({
        tone: 'warning',
        message: 'Enter a long-term goal before generating a plan.',
      })
      return
    }

    setPlanning(true)
    setTaskError('')
    setPlannerStatus({ tone: 'info', message: 'Generating task plan…' })

    try {
      const plan = await planTasksFromGoal(goal)
      const generated = normalizePlanTasks(
        Array.isArray(plan.tasks) ? plan.tasks : [],
      )
      setPlannedTasks(generated)

      if (generated.length > 0) {
        const nextPlan: GoalPlan = {
          id: Date.now(),
          goal,
          tasks: generated,
          createdAt: new Date().toISOString(),
        }
        setGoalPlans((current) => [nextPlan, ...current].slice(0, 8))

        setPlannerStatus({
          tone: 'success',
          message: `Generated ${generated.length} tasks. Review and create them when ready.`,
        })
      } else {
        setPlannerStatus({
          tone: 'warning',
          message: 'No tasks were generated. Try a more specific goal.',
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate plan'
      setTaskError(message)

      if (message.includes('LLM_API_KEY_MISSING')) {
        setPlannerStatus({
          tone: 'warning',
          message: 'Planner is not configured yet on backend (missing LLM key).',
        })
      } else if (
        message.includes('LLM_UPSTREAM_RESPONSE_FAILED') ||
        message.includes('429') ||
        message.toLowerCase().includes('rate')
      ) {
        setPlannerStatus({
          tone: 'warning',
          message: 'Planner provider is temporarily rate-limited. Retry in a minute.',
        })
      } else {
        setPlannerStatus({
          tone: 'warning',
          message: 'Planner is temporarily unavailable. Please try again shortly.',
        })
      }
    } finally {
      setPlanning(false)
    }
  }

  const handleCreatePlannedTasks = async () => {
    if (!isAuthenticated) {
      setTaskError('Sign in is required to create planned tasks')
      return
    }

    if (plannedTasks.length === 0) {
      return
    }

    setCreatingPlanTasks(true)
    setTaskError('')
    setPlannerStatus({ tone: 'info', message: 'Creating planned tasks…' })

    const created: Task[] = []
    const failed: string[] = []
    let firstErrorMessage = ''

    for (const plannedTitle of plannedTasks) {
      const title = normalizePlanTask(plannedTitle)
      if (!title) {
        continue
      }

      try {
        const task = await createTaskWithDifficulty(
          title,
          normalizeDifficulty(plannedTaskDifficulty),
        )
        created.push(task)
      } catch (error) {
        failed.push(title)
        if (!firstErrorMessage) {
          firstErrorMessage =
            error instanceof Error ? error.message : 'Failed to create planned tasks'
        }
      }
    }

    if (created.length > 0) {
      setTasks((current) => [...current, ...created])
    }

    if (failed.length === 0) {
      setPlannedTasks([])
      setGoalInput('')
      setPlannerStatus({
        tone: 'success',
        message: `Created ${created.length} tasks from your plan.`,
      })
    } else {
      setPlannedTasks(failed)
      setTaskError(firstErrorMessage)
      setPlannerStatus({
        tone: 'warning',
        message: `Created ${created.length} tasks. ${failed.length} could not be created. You can retry.`,
      })
    }

    setCreatingPlanTasks(false)
  }

  useEffect(() => {
    if (goalPlans.length === 0 || tasks.length === 0) {
      return
    }

    const completedTitles = new Set(
      tasks
        .filter((task) => task.completed)
        .map((task) => task.title.trim().toLowerCase()),
    )

    const newlyCompletedPlans = goalPlans.filter((plan) => {
      if (rewardedPlanIds.has(plan.id)) {
        return false
      }

      return plan.tasks.every((task) => completedTitles.has(task.trim().toLowerCase()))
    })

    if (newlyCompletedPlans.length === 0) {
      return
    }

    const nextRewarded = new Set(rewardedPlanIds)
    for (const plan of newlyCompletedPlans) {
      nextRewarded.add(plan.id)
    }

    setRewardedPlanIds(nextRewarded)
    setRubies((current) => current + newlyCompletedPlans.length)
    setPlannerStatus({
      tone: 'success',
      message: `Plan completed! You forged ${newlyCompletedPlans.length} ruby reward${newlyCompletedPlans.length > 1 ? 's' : ''}.`,
    })
  }, [goalPlans, rewardedPlanIds, tasks])

  const handleSetTaskDifficulty = async (task: Task, difficulty: number) => {
    if (!isAuthenticated) {
      setTaskError('Sign in is required to update task difficulty')
      return
    }

    setWorkingTaskId(task.id)
    setTaskError('')

    try {
      const updatedTask = await updateTask(task.id, {
        difficulty: normalizeDifficulty(difficulty),
      })
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? updatedTask : item)),
      )
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : 'Failed to update task')
    } finally {
      setWorkingTaskId(null)
    }
  }

  return {
    tasks,
    taskTitle,
    taskDifficulty,
    tasksLoading,
    taskError,
    submitting,
    workingTaskId,
    goalInput,
    plannedTaskDifficulty,
    plannedTasks,
    planning,
    creatingPlanTasks,
    plannerStatus,
    goalPlans,
    celebrationToken,
    forgedPoints,
    rubies,
    pendingCount,
    setTaskTitle,
    setTaskDifficulty,
    setGoalInput,
    setPlannedTaskDifficulty,
    loadTasks,
    handleCreateTask,
    handleSetTaskDifficulty,
    handleToggleTask,
    handleDeleteTask,
    handleGeneratePlan,
    handleCreatePlannedTasks,
  }
}
