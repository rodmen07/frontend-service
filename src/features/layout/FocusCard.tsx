import { useRef, useState, useEffect, useCallback } from 'react'

interface FocusCardProps {
  children: React.ReactNode
  className?: string
  /** Distance from viewport center at which opacity bottoms out. Default 0.55 (55% of vh). */
  fadeRadius?: number
  /** Minimum opacity when fully out of focus. Default 0.45. */
  minOpacity?: number
}

/**
 * Wraps content so it fades to full opacity when centered in the viewport
 * and dims as it scrolls away from center. Respects prefers-reduced-motion.
 */
export function FocusCard({
  children,
  className,
  fadeRadius = 0.55,
  minOpacity = 0.45,
}: FocusCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [opacity, setOpacity] = useState(1)
  const rafRef = useRef<number>(0)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const elementCenter = rect.top + rect.height / 2
    const viewportCenter = window.innerHeight / 2
    const dist = Math.abs(elementCenter - viewportCenter)
    const maxDist = window.innerHeight * fadeRadius
    const t = Math.min(dist / maxDist, 1)
    setOpacity(1 - t * (1 - minOpacity))
  }, [fadeRadius, minOpacity])

  useEffect(() => {
    // Skip effect for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      cancelAnimationFrame(rafRef.current)
    }
  }, [update])

  return (
    <div
      ref={ref}
      style={{ opacity, transition: 'opacity 150ms ease' }}
      className={className}
    >
      {children}
    </div>
  )
}
