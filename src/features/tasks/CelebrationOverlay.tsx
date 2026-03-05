import { useEffect, useRef, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
}

const COLORS = [
  '#f59e0b', // amber
  '#fb923c', // orange
  '#a3e635', // lime
  '#34d399', // emerald
  '#60a5fa', // blue
  '#c084fc', // purple
  '#f472b6', // pink
  '#ffffff', // white
]

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

interface CelebrationOverlayProps {
  trigger: number // increment to trigger a burst
  message?: string
}

export function CelebrationOverlay({ trigger, message }: CelebrationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const [visible, setVisible] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const counterRef = useRef(0)

  useEffect(() => {
    if (trigger === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Spawn particles from the bottom-center ish area
    const cx = canvas.width / 2
    const cy = canvas.height * 0.6

    const newParticles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
      id: Date.now() + i,
      x: cx + randomBetween(-80, 80),
      y: cy,
      vx: randomBetween(-6, 6),
      vy: randomBetween(-14, -4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(4, 9),
      life: 1,
    }))

    particlesRef.current = [...particlesRef.current, ...newParticles]
    setVisible(true)

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setVisible(false), 2500)
  }, [trigger])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.01)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.35 // gravity
        p.vx *= 0.98  // air drag
        p.life -= 0.016

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  if (!visible && particlesRef.current.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {visible && message && (
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-bounce rounded-2xl border border-amber-400/40 bg-zinc-900/90 px-6 py-3 text-center shadow-2xl shadow-amber-500/20 backdrop-blur-sm">
            <p className="text-lg font-bold text-amber-300">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
