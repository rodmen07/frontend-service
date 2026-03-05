import type { ScrollMenuItem } from './useScrollSpy'

interface SideNavProps {
  menuItems: ScrollMenuItem[]
  activeSectionId: string
  onMenuJump: (sectionId: string) => void
}

export function SideNav({ menuItems, activeSectionId, onMenuJump }: SideNavProps) {
  return (
    <aside className="hidden xl:block">
      <nav className="sticky top-24 rounded-2xl border border-zinc-500/30 bg-zinc-900/70 p-3 shadow-xl shadow-black/40 backdrop-blur-xl" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">On This Screen</p>
        <ul className="space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9.5rem)' }}>
          {menuItems.map((item) => {
            const isActive = activeSectionId === item.id
            if (item.isExternal) {
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="block rounded-lg border border-zinc-500/35 bg-zinc-800/70 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-700"
                  >
                    {item.label}
                  </a>
                </li>
              )
            }

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    onMenuJump(item.id)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left text-sm transition ${
                    isActive
                      ? 'border-amber-300/40 bg-amber-500/10 text-amber-100'
                      : 'border-zinc-500/35 bg-zinc-800/70 text-zinc-200 hover:bg-zinc-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-[10px] uppercase tracking-wide text-amber-200">On screen</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
