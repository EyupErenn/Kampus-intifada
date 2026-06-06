'use client'

import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '@/lib/format'

interface CountUpProps {
  target: number
  duration?: number
  locale?: string
  suffix?: string
  className?: string
}

// Scroll ile görünüme girince requestAnimationFrame ile sayar (bir kez).
export default function CountUp({
  target,
  duration = 2000,
  locale = 'tr',
  suffix = '',
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration)
              const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
              setValue(Math.round(target * eased))
              if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className={className}>
      {formatNumber(value, locale)}
      {suffix}
    </span>
  )
}
