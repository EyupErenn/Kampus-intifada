'use client'

import { useEffect, useRef, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

// --- color helpers ----------------------------------------------------------

const RED = '#dc2626'
const GREEN = '#16a34a'
const BLACK = '#111111'

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r},${g},${bl})`
}

const RED_RGB = hexToRgb(RED)
const GREEN_RGB = hexToRgb(GREEN)
const BLACK_RGB = hexToRgb(BLACK)

// cycle red -> green -> black -> red based on t in [0,1)
function cycleColor(t: number): string {
  const x = ((t % 1) + 1) % 1
  if (x < 1 / 3) return lerpColor(RED_RGB, GREEN_RGB, x * 3)
  if (x < 2 / 3) return lerpColor(GREEN_RGB, BLACK_RGB, (x - 1 / 3) * 3)
  return lerpColor(BLACK_RGB, RED_RGB, (x - 2 / 3) * 3)
}

// --- geometry types ---------------------------------------------------------

interface Seagull {
  baseAngle: number // fixed position on the orbit
  rotation: number // current self-rotation of its cardioid
  rotSpeed: number // varying individual speed
  offsetX: number // current repel displacement
  offsetY: number
}

const MAIN_N = 200
const SEAGULL_N = 60
const SEAGULL_RADIUS = 40
const SEAGULL_COUNT = 12
const REPEL_RANGE = 120
const SLOGAN = 'Dua et • Mutlu et'

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const seagullsRef = useRef<Seagull[]>([])
  const [typed, setTyped] = useState('')
  const [fading, setFading] = useState(false)

  // ---- canvas animation ----
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // init seagulls once with random angles and varying speeds
    if (seagullsRef.current.length === 0) {
      seagullsRef.current = Array.from({ length: SEAGULL_COUNT }, (_, i) => ({
        baseAngle: (i / SEAGULL_COUNT) * Math.PI * 2 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: 0.004 + Math.random() * 0.012,
        offsetX: 0,
        offsetY: 0,
      }))
    }

    let dpr = Math.max(1, window.devicePixelRatio || 1)
    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    let angle = 0
    let raf = 0

    const drawCardioid = (
      cx: number,
      cy: number,
      radius: number,
      n: number,
      rotation: number,
      alpha: number,
    ) => {
      const pts: Array<[number, number]> = []
      for (let i = 0; i < n; i++) {
        const a = rotation + (i / n) * Math.PI * 2
        pts.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius])
      }
      ctx.globalAlpha = alpha
      ctx.lineWidth = 1
      for (let i = 0; i < n; i++) {
        const [x1, y1] = pts[i]
        const [x2, y2] = pts[(2 * i) % n]
        ctx.strokeStyle = cycleColor(i / n)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const frame = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const mainRadius = Math.min(w, h) * 0.35
      const orbitRadius = mainRadius * 0.6
      const mouse = mouseRef.current

      // main cardioid
      drawCardioid(cx, cy, mainRadius, MAIN_N, angle, 1)

      // orbiting seagulls
      for (const s of seagullsRef.current) {
        const baseX = cx + Math.cos(s.baseAngle + angle * 0.5) * orbitRadius
        const baseY = cy + Math.sin(s.baseAngle + angle * 0.5) * orbitRadius

        // mouse repel: move away smoothly, force proportional to 1/distance
        const curX = baseX + s.offsetX
        const curY = baseY + s.offsetY
        const dx = curX - mouse.x
        const dy = curY - mouse.y
        const dist = Math.hypot(dx, dy)

        let targetOX = 0
        let targetOY = 0
        if (dist < REPEL_RANGE && dist > 0.001) {
          const force = (REPEL_RANGE / dist) * 14 // proportional to 1/distance
          targetOX = (dx / dist) * force
          targetOY = (dy / dist) * force
        }
        // lerp toward target (smoothly repel out and ease back)
        s.offsetX += (targetOX - s.offsetX) * 0.12
        s.offsetY += (targetOY - s.offsetY) * 0.12

        s.rotation += s.rotSpeed
        drawCardioid(baseX + s.offsetX, baseY + s.offsetY, SEAGULL_RADIUS, SEAGULL_N, s.rotation, 0.55)
      }

      angle += 0.003
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  // ---- typewriter: start after 3s, one char / 80ms ----
  useEffect(() => {
    const start = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setTyped(SLOGAN.slice(0, i))
        if (i >= SLOGAN.length) clearInterval(interval)
      }, 80)
    }, 3000)
    return () => clearTimeout(start)
  }, [])

  // ---- fade out after 5s total, then complete ----
  useEffect(() => {
    const fade = setTimeout(() => setFading(true), 5000)
    return () => clearTimeout(fade)
  }, [])

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === 'opacity' && fading) onComplete()
  }

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        backgroundColor: fading ? '#0a0a0a' : '#ffffff',
        transition: 'opacity 800ms ease, background-color 800ms ease',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {typed && (
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: "'Noto Sans', sans-serif",
            fontSize: '28px',
            color: '#111',
            letterSpacing: '4px',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {typed}
        </div>
      )}
    </div>
  )
}
