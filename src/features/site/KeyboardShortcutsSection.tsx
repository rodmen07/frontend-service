const SHORTCUT_GROUPS = [
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['Tab'], description: 'Move focus to the next interactive element' },
      { keys: ['Shift', 'Tab'], description: 'Move focus to the previous element' },
      { keys: ['Enter'], description: 'Activate focused button or submit focused form' },
      { keys: ['Esc'], description: 'Close confirmation dialogs' },
    ],
  },
  {
    label: 'Task Manager',
    shortcuts: [
      { keys: ['Space'], description: 'Toggle the focused task checkbox' },
      { keys: ['Ctrl', 'Enter'], description: 'Submit the Add Task or Generate Plan form' },
      { keys: ['Tab'], description: 'Cycle through Title → Goal → Difficulty → Add Task' },
    ],
  },
  {
    label: 'AI Planner',
    shortcuts: [
      { keys: ['Ctrl', 'Enter'], description: 'Generate a plan from the goal textarea' },
      { keys: ['Tab'], description: 'Move between Goal → Steps → Generate fields' },
    ],
  },
  {
    label: 'Coming soon',
    shortcuts: [
      { keys: ['G', 'T'], description: 'Jump to Task Manager', planned: true },
      { keys: ['G', 'P'], description: 'Jump to AI Planner', planned: true },
      { keys: ['/'], description: 'Focus task search', planned: true },
      { keys: ['?'], description: 'Open keyboard shortcuts panel', planned: true },
      { keys: ['N'], description: 'Open new task form', planned: true },
    ],
  },
]

interface KeyProps {
  label: string
}

function Key({ label }: KeyProps) {
  return (
    <kbd className="inline-flex items-center rounded border border-zinc-600/60 bg-zinc-800 px-1.5 py-0.5 text-[11px] font-mono font-medium text-zinc-300 shadow-sm">
      {label}
    </kbd>
  )
}

export function KeyboardShortcutsSection() {
  return (
    <section className="forge-panel rounded-3xl border border-zinc-500/30 bg-zinc-900/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold text-white">Keyboard shortcuts</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {group.label}
            </h3>
            <div className="space-y-2">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className={`flex items-center justify-between gap-4 rounded-lg border border-zinc-700/35 bg-zinc-800/50 px-3 py-2 ${
                    'planned' in shortcut && shortcut.planned ? 'opacity-50' : ''
                  }`}
                >
                  <span className="text-xs text-zinc-300">{shortcut.description}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={key} className="flex items-center gap-1">
                        {i > 0 && <span className="text-[10px] text-zinc-600">+</span>}
                        <Key label={key} />
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
