import type { FormEvent } from 'react'
import type { PlannerTone, Task } from '../../types'
import type { PlannerStatus } from './useTaskManager'

interface TaskManagerSectionProps {
  pendingCount: number
  tasksLoading: boolean
  taskError: string
  goalInput: string
  planning: boolean
  creatingPlanTasks: boolean
  plannerStatus: PlannerStatus
  plannedTasks: string[]
  taskTitle: string
  submitting: boolean
  tasks: Task[]
  workingTaskId: number | null
  onRefresh: () => void
  onGoalInputChange: (value: string) => void
  onGeneratePlan: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onCreatePlannedTasks: () => Promise<void>
  onTaskTitleChange: (value: string) => void
  onCreateTask: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onToggleTask: (task: Task) => Promise<void>
  onDeleteTask: (task: Task) => Promise<void>
}

function plannerToneClass(tone: PlannerTone): string {
  switch (tone) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    default:
      return 'border-blue-200 bg-blue-50 text-blue-700'
  }
}

export function TaskManagerSection({
  pendingCount,
  tasksLoading,
  taskError,
  goalInput,
  planning,
  creatingPlanTasks,
  plannerStatus,
  plannedTasks,
  taskTitle,
  submitting,
  tasks,
  workingTaskId,
  onRefresh,
  onGoalInputChange,
  onGeneratePlan,
  onCreatePlannedTasks,
  onTaskTitleChange,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
}: TaskManagerSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Task Manager</h2>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onRefresh}
          disabled={tasksLoading}
        >
          Refresh
        </button>
      </div>

      <p className="mb-4 text-sm text-slate-600">
        Pending tasks: <strong>{pendingCount}</strong>
      </p>

      <form className="mb-3 space-y-3" onSubmit={onGeneratePlan}>
        <textarea
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-300 placeholder:text-slate-400 focus:ring"
          placeholder="Describe your long-term goal..."
          value={goalInput}
          onChange={(event) => onGoalInputChange(event.target.value)}
          rows={4}
          disabled={planning || creatingPlanTasks}
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={planning || creatingPlanTasks}
        >
          {planning ? 'Generating plan…' : 'Generate Composite Tasks'}
        </button>
      </form>

      <p className={`mb-4 rounded-xl border px-3 py-2 text-sm ${plannerToneClass(plannerStatus.tone)}`}>
        {plannerStatus.message}
      </p>

      {plannedTasks.length > 0 && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-base font-semibold">Generated Plan</h3>
          <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            {plannedTasks.map((task, index) => (
              <li key={`${task}-${index}`}>{task}</li>
            ))}
          </ol>
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              void onCreatePlannedTasks()
            }}
            disabled={creatingPlanTasks}
          >
            {creatingPlanTasks ? 'Creating tasks…' : 'Create All Planned Tasks'}
          </button>
        </div>
      )}

      <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={onCreateTask}>
        <input
          type="text"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-300 placeholder:text-slate-400 focus:ring"
          placeholder="Add a task title"
          value={taskTitle}
          onChange={(event) => onTaskTitleChange(event.target.value)}
          maxLength={120}
          disabled={submitting}
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Adding…' : 'Add Task'}
        </button>
      </form>

      {taskError && (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {taskError}
        </p>
      )}

      {tasksLoading ? (
        <p className="text-sm text-slate-600">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-slate-600">No tasks yet. Create your first one.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const isWorking = workingTaskId === task.id
            return (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={task.completed}
                    disabled={isWorking}
                    onChange={() => {
                      void onToggleTask(task)
                    }}
                  />
                  <span className={task.completed ? 'line-through text-slate-400' : ''}>
                    {task.title}
                  </span>
                </label>
                <button
                  type="button"
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isWorking}
                  onClick={() => {
                    void onDeleteTask(task)
                  }}
                >
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
