import { useRef, useState, useEffect, useCallback } from 'react'

interface FocusCardProps {
  children: React.ReactNode
  className?: string
  /** Max rotateX angle (degrees) at full distance from center. Default 48. */
  maxAngle?: number
  /** Minimum opacity when fully rotated away. Default 0.35. */
  minOpacity?: number
  /** Distance (as fraction of vh) at which rotation/fade max out. Default 0.6. */
  fadeRadius?: number
}

/**
 * Cards sit on an imaginary vertical wheel. The card centered in the viewport
 * faces the viewer flat-on; cards above/below rotate away as if the wheel is
 * spinning, with matching opacity and scale falloff.
 * Respects prefers-reduced-motion.
 */
export function FocusCard({
  children,
  className,
  maxAngle = 48,
  minOpacity = 0.35,
  fadeRadius = 0.6,
}: FocusCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const rafRef = useRef<number>(0)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const elementCenter = rect.top + rect.height / 2
    const viewportCenter = window.innerHeight / 2
    const maxDist = window.innerHeight * fadeRadius

    // signed: positive when card is above center (rotates over the top of the wheel)
    const signed = viewportCenter - elementCenter
    const t = Math.min(Math.abs(signed) / maxDist, 1)

    // rotateX: positive → top goes away (card tilts backward over the wheel)
    //          negative → bottom goes away (card tilts forward under the wheel)
    const angle = (signed / (maxDist || 1)) * maxAngle

    const opacity = 1 - t * (1 - minOpacity)
    const scale = 1 - t * 0.06

    setStyle({
      opacity,
      transform: `perspective(900px) rotateX(${angle}deg) scale(${scale})`,
      transformOrigin: 'center center',
      transition: 'opacity 120ms ease, transform 120ms ease',
    })
  }, [maxAngle, minOpacity, fadeRadius])

  useEffect(() => {
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
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  )
}
