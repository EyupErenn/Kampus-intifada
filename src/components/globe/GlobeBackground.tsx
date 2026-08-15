'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import EarthMesh from './EarthMesh'

/* ================================================================
   GLOBE BACKGROUND — Full-viewport fixed WebGL Canvas.
   ────────────────────────────────────────────────────────────────
   Mount once in layout.tsx, renders behind ALL page content.
   • 100vw × 100vh fixed Canvas — the entire hero background
   • Mouse tracking → parallax tilt passed to EarthMesh
   • Scroll tracking → camera dive toward Gaza
   • Tab-hidden → pauses rAF loop for performance
   • prefers-reduced-motion → static single frame
   ================================================================ */

export default function GlobeBackground() {
  const reduce     = useReducedMotion()
  const scrollRef  = useRef(0)
  const mouseRef   = useRef({ x: 0, y: 0 })
  const pausedRef  = useRef(false)
  const [frameloop, setFrameloop] = useState<'always' | 'never'>(
    reduce ? 'never' : 'always',
  )

  /* ── Scroll → Hero exit progress (0.0 → 1.0) ── */
  useEffect(() => {
    const onScroll = () => {
      const heroH = window.innerHeight * 1.1 || 800
      scrollRef.current = Math.min(1, Math.max(0, (window.scrollY || 0) / heroH))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  /* ── Mouse → normalized −1..+1 for parallax ── */
  useEffect(() => {
    if (reduce) return
    const onMove = (e: MouseEvent) => {
      const hw = window.innerWidth  * 0.5
      const hh = window.innerHeight * 0.5
      mouseRef.current = {
        x: (e.clientX - hw) / hw,
        y: (e.clientY - hh) / hh,
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduce])

  /* ── Tab visibility → pause rAF ── */
  useEffect(() => {
    if (reduce) {
      pausedRef.current = true
      setFrameloop('never')
      return
    }
    const onVis = () => {
      const hidden = document.hidden
      pausedRef.current = hidden
      setFrameloop(hidden ? 'never' : 'always')
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [reduce])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: '#0F1923' }}
    >
      {/* ━━ FULL-VIEWPORT WEBGL CANVAS ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{
          antialias: true,
          alpha: false,          // opaque — we own the entire background
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 3.8], fov: 36 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#0F1923']} />
        <Suspense fallback={null}>
          <EarthMesh
            scrollRef={scrollRef}
            pausedRef={pausedRef}
            mouseRef={mouseRef}
            reduced={!!reduce}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
