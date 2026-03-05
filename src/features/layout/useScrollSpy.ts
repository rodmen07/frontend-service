import { useEffect, useState } from 'react'

export interface ScrollMenuItem {
  id: string
  label: string
  isExternal?: boolean
  href?: string
}

interface ScrollSpyResult {
  activeSectionId: string
  sectionStateClass: (sectionId: string) => string
  handleMenuJump: (sectionId: string) => void
}

export function useScrollSpy(menuItems: ScrollMenuItem[]): ScrollSpyResult {
  const [activeSectionId, setActiveSectionId] = useState('hero')
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, number>>({})

  useEffect(() => {
    const sectionIds = menuItems.filter((item) => !item.isExternal).map((item) => item.id)
    if (!sectionIds.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setSectionVisibility((previous) => {
          const next = { ...previous }
          for (const entry of entries) {
            next[entry.target.id] = entry.intersectionRatio
          }
          return next
        })

        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visibleEntries[0]) {
          setActiveSectionId(visibleEntries[0].target.id)
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.2, 0.45, 0.65, 0.85, 1],
      },
    )

    for (const sectionId of sectionIds) {
      const node = document.getElementById(sectionId)
      if (node) {
        observer.observe(node)
      }
    }

    return () => observer.disconnect()
  }, [menuItems])

  const handleMenuJump = (sectionId: string) => {
    const node = document.getElementById(sectionId)
    if (!node) {
      return
    }

    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.history.replaceState(null, '', `#${sectionId}`)
  }

  const sectionStateClass = (sectionId: string) => {
    const ratio = sectionVisibility[sectionId] ?? 0
    if (ratio >= 0.55) {
      return 'section-carousel-item section-carousel-active'
    }
    if (ratio >= 0.2) {
      return 'section-carousel-item section-carousel-near'
    }
    return 'section-carousel-item section-carousel-away'
  }

  return { activeSectionId, sectionStateClass, handleMenuJump }
}
