'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import EarthMesh from './EarthMesh'

/* ============================================================
   GLOBE BACKGROUND — tam-sayfa sabit (fixed) dönen dünya.
   Layout'ta tek sefer mount edilir; tüm sayfa boyunca arkada kalır.
   Scroll küreyi ekseni etrafında döndürür (ZOOM YOK).
   Optimizasyon: dpr clamp, tab gizliyken loop durur, reduced-motion
   tek statik kare.
   ============================================================ */

export default function GlobeBackground() {
  const reduce = useReducedMotion()
  const scrollRef = useRef(0)
  const pausedRef = useRef(false)
  const [frameloop, setFrameloop] = useState<'always' | 'never'>(
    reduce ? 'never' : 'always'
  )

  // Tüm doküman scroll ilerlemesi → ref (React state yok, re-render yok)
  useEffect(() => {
    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = max > 0 ? window.scrollY / max : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // Tab gizliyken rAF loop'u durdur; reduced-motion'da hiç sürme
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
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 4.0], fov: 35 }}
      >
        <Suspense fallback={null}>
          <EarthMesh
            scrollRef={scrollRef}
            pausedRef={pausedRef}
            reduced={!!reduce}
          />
        </Suspense>
      </Canvas>

      {/* Atmosfer halesi — ikinci mesh yerine bedava CSS radial */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(closest-side at 50% 50%, rgba(46,92,150,0.16), transparent 72%)',
        }}
      />
    </div>
  )
}
