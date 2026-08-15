'use client'

import { useEffect, useRef } from 'react'

/* ============================================================
   DOT MAP BACKGROUND
   Leyl Lacivert (#0F1923) zemin üzerinde nokta-matris dünya haritası.
   Kriz bölgeleri (#D94040) 2 saniyelik pulse animasyonuyla vurgulanır.
   ============================================================ */

// Kara kütlelerini temsil eden yaklaşık bölgeler (normalize 0-1)
const LAND_REGIONS: Array<{ x: number; y: number; w: number; h: number }> = [
  // Kuzey Amerika
  { x: 0.07, y: 0.16, w: 0.18, h: 0.22 },
  { x: 0.10, y: 0.30, w: 0.12, h: 0.14 },
  // Güney Amerika
  { x: 0.19, y: 0.44, w: 0.10, h: 0.30 },
  // Batı / Orta Avrupa
  { x: 0.44, y: 0.13, w: 0.07, h: 0.15 },
  // Kuzey Avrupa / İskandinav
  { x: 0.46, y: 0.07, w: 0.06, h: 0.10 },
  // Doğu Avrupa / Rusya
  { x: 0.50, y: 0.08, w: 0.22, h: 0.18 },
  // Orta Asya
  { x: 0.56, y: 0.18, w: 0.14, h: 0.12 },
  // Afrika
  { x: 0.44, y: 0.28, w: 0.12, h: 0.34 },
  // Orta Doğu / Arap Yarımadası
  { x: 0.52, y: 0.25, w: 0.09, h: 0.12 },
  // Güney Asya
  { x: 0.62, y: 0.25, w: 0.09, h: 0.15 },
  // Güneydoğu Asya
  { x: 0.70, y: 0.30, w: 0.09, h: 0.13 },
  // Çin / Doğu Asya
  { x: 0.67, y: 0.16, w: 0.15, h: 0.17 },
  // Japonya / Kore
  { x: 0.81, y: 0.18, w: 0.04, h: 0.13 },
  // Avustralya
  { x: 0.72, y: 0.54, w: 0.14, h: 0.15 },
  // Grönland
  { x: 0.22, y: 0.05, w: 0.07, h: 0.11 },
  // Madagaskar
  { x: 0.56, y: 0.52, w: 0.02, h: 0.06 },
]

// Kriz bölgesi koordinatları (normalize 0-1, haritada konumlar)
const CRISIS_ZONES = [
  { label: 'Gazze', x: 0.528, y: 0.293 },
  { label: 'D. Türkistan', x: 0.695, y: 0.220 },
  { label: 'Arakan', x: 0.722, y: 0.325 },
]

interface DotMapProps {
  className?: string
}

export default function DotMapBackground({ className = '' }: DotMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    const DOT_RADIUS = 1.3
    const GAP = 7.5

    function isLand(nx: number, ny: number): boolean {
      for (const region of LAND_REGIONS) {
        if (
          nx >= region.x && nx <= region.x + region.w &&
          ny >= region.y && ny <= region.y + region.h
        ) {
          return true
        }
      }
      return false
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)

      // Leyl Lacivert arka plan
      ctx.fillStyle = '#0F1923'
      ctx.fillRect(0, 0, width, height)

      const cols = Math.ceil(width / GAP)
      const rows = Math.ceil(height / GAP)

      // Dünya haritası nokta matrisi
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = col * GAP + GAP / 2
          const py = row * GAP + GAP / 2
          const nx = px / width
          const ny = py / height

          if (!isLand(nx, ny)) continue

          // Kriz bölgesine yakınlık hesapla
          let maxIntensity = 0
          for (const zone of CRISIS_ZONES) {
            const dx = nx - zone.x
            const dy = ny - zone.y
            const dist = Math.sqrt(dx * dx + dy * dy * 2.2)
            if (dist < 0.028) {
              const intensity = 1 - dist / 0.028
              maxIntensity = Math.max(maxIntensity, intensity)
            }
          }

          if (maxIntensity > 0) {
            // 2 saniyelik smooth pulse
            const pulse = 0.5 + 0.5 * Math.sin((time / 1000) * Math.PI)
            const alpha = 0.45 + 0.55 * pulse * maxIntensity
            ctx.fillStyle = `rgba(217, 64, 64, ${alpha.toFixed(2)})`
          } else {
            // Normal kara noktası
            const shimmer = 0.10 + 0.04 * Math.sin(time / 4000 + col * 0.3 + row * 0.2)
            ctx.fillStyle = `rgba(255, 255, 255, ${shimmer.toFixed(3)})`
          }

          ctx.beginPath()
          ctx.arc(px, py, DOT_RADIUS, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Kriz bölgesi pulse halkaları ve merkez noktaları
      for (const zone of CRISIS_ZONES) {
        const cx = zone.x * width
        const cy = zone.y * height

        // 2 saniye döngülü dışa yayılan halka
        const phase = ((time / 2000) % 1)
        const ringR = 6 + phase * 22
        const ringAlpha = (1 - phase) * 0.7

        ctx.beginPath()
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(217, 64, 64, ${ringAlpha.toFixed(2)})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // İkinci, gecikmeli halka
        const phase2 = ((time / 2000 + 0.5) % 1)
        const ringR2 = 6 + phase2 * 22
        const ringAlpha2 = (1 - phase2) * 0.4

        ctx.beginPath()
        ctx.arc(cx, cy, ringR2, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(217, 64, 64, ${ringAlpha2.toFixed(2)})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Sabit merkez — nefes alan parlaklık
        const glow = 0.65 + 0.35 * Math.sin((time / 1000) * Math.PI)
        ctx.beginPath()
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(217, 64, 64, ${glow.toFixed(2)})`
        ctx.fill()

        // Etiket
        ctx.save()
        ctx.font = '600 9px "JetBrains Mono", monospace'
        ctx.fillStyle = 'rgba(217, 64, 64, 0.82)'
        ctx.textAlign = 'left'
        ctx.fillText(zone.label, cx + 8, cy - 4)
        ctx.restore()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)
    resize()
    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ display: 'block' }}
    />
  )
}
