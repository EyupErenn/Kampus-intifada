'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import EarthMesh from './EarthMesh'

/* ============================================================
   GLOBE BACKGROUND — tam-sayfa sabit (fixed) sinematik 3D dünya.
   • Layout seviyesinde mount edilir, arka planda kalır.
   • Mouse parallaksı & Hero'dan kaydırıldığında Gazze'ye kamera dalışı.
   • Optimizasyon: dpr clamp, tab gizliyken rAF durur, reduced-motion desteği.
   ============================================================ */

export default function GlobeBackground() {
  const reduce = useReducedMotion()
  const scrollRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const pausedRef = useRef(false)
  const [frameloop, setFrameloop] = useState<'always' | 'never'>(
    reduce ? 'never' : 'always'
  )

  // Scroll ilerlemesi: Hero bölümünden sonraki bölüme geçiş oranını (0.0 -> 1.0) hesaplar
  useEffect(() => {
    const onScroll = () => {
      const heroHeight = window.innerHeight * 1.1 || 800
      const currentScroll = window.scrollY || 0
      // 0: Hero tepesi, 1: Hero'dan çıkıp Çadırlar/Program bölümüne giriş
      scrollRef.current = Math.min(1, Math.max(0, currentScroll / heroHeight))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Mouse / Pointer Parallaks Takibi
  useEffect(() => {
    if (reduce) return
    const onMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth * 0.5
      const halfH = window.innerHeight * 0.5
      mouseRef.current = {
        x: (e.clientX - halfW) / halfW,
        y: (e.clientY - halfH) / halfH,
      }
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [reduce])

  // Tab gizliyken rAF döngüsünü durdur
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
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 3.8], fov: 36 }}
      >
        <Suspense fallback={null}>
          <EarthMesh
            scrollRef={scrollRef}
            pausedRef={pausedRef}
            mouseRef={mouseRef}
            reduced={!!reduce}
          />
        </Suspense>
      </Canvas>

      {/* Leyl Lacivert / Koyu Uzay Atmosfer Vignette Halesi */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(15, 25, 35, 0.25) 0%, rgba(15, 25, 35, 0.70) 65%, #0F1923 100%)',
        }}
      />
    </div>
  )
}

