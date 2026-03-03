import { GoalDiagramsSection } from './features/plans/GoalDiagramsSection'
import { SiteHeader } from './features/site/SiteHeader'
import { useSiteContent } from './features/site/useSiteContent'
import { TaskManagerSection } from './features/tasks/TaskManagerSection'
import { useTaskManager } from './features/tasks/useTaskManager'

function App() {
  const baseUrl = import.meta.env.BASE_URL
  const content = useSiteContent(baseUrl)
  const {
    tasks,
    taskTitle,
    tasksLoading,
    taskError,
    submitting,
    workingTaskId,
    goalInput,
    plannedTasks,
    planning,
    creatingPlanTasks,
    plannerStatus,
    goalPlans,
    pendingCount,
    setTaskTitle,
    setGoalInput,
    loadTasks,
    handleCreateTask,
    handleToggleTask,
    handleDeleteTask,
    handleGeneratePlan,
    handleCreatePlannedTasks,
  } = useTaskManager()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <SiteHeader content={content} />

        <TaskManagerSection
          pendingCount={pendingCount}
          tasksLoading={tasksLoading}
          taskError={taskError}
          goalInput={goalInput}
          planning={planning}
          creatingPlanTasks={creatingPlanTasks}
          plannerStatus={plannerStatus}
          plannedTasks={plannedTasks}
          taskTitle={taskTitle}
          submitting={submitting}
          tasks={tasks}
          workingTaskId={workingTaskId}
          onRefresh={loadTasks}
          onGoalInputChange={setGoalInput}
          onGeneratePlan={handleGeneratePlan}
          onCreatePlannedTasks={handleCreatePlannedTasks}
          onTaskTitleChange={setTaskTitle}
          onCreateTask={handleCreateTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />

        <GoalDiagramsSection goalPlans={goalPlans} />
      </div>
    </main>
  )
}

export default App
