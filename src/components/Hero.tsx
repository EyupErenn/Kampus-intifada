'use client'

import { useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { useTranslations } from 'next-intl'
import { GooeyText } from '@/components/ui/gooey-text-morphing'

export default function Hero() {
  const t = useTranslations('hero')
  const reduce = useReducedMotion()

  const words = (t.raw('words') as string[]) ?? []

  // Metin scroll ile yumuşakça silinir; dünya (global arka plan) sahnede kalır
  const p = useMotionValue(0)
  useEffect(() => {
    if (reduce) return
    const onScroll = () => {
      const v = window.innerHeight || 1
      p.set(Math.min(1, Math.max(0, window.scrollY / (v * 0.7))))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  const textOpacity = useTransform(p, [0, 0.8], [1, 0])
  const textY = useTransform(p, [0, 0.8], [0, -48])

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5">
      {/* Okunurluk vignette — metin dönen dünya üzerinde durur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(62% 56% at 50% 46%, rgba(3,5,12,0.66), rgba(3,5,12,0.28) 56%, transparent 80%)',
        }}
      />

      {/* Başlık katmanı */}
      <motion.div
        style={reduce ? undefined : { opacity: textOpacity, y: textY }}
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center"
      >
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <span className="stamp -rotate-2 text-[11px] text-flag-red">
            № 01 — Dosya
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-bone-dim">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flag-red opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flag-red" />
            </span>
            {t('subtitle')}
          </span>
        </div>

        {/* Sabit marka adı */}
        <h1
          className="riso-title text-[clamp(2.5rem,9vw,6rem)] font-black leading-[0.9] tracking-tight text-bone"
          style={{ textShadow: '0 2px 36px rgba(0,0,0,0.55)' }}
        >
          Campus İntifada
        </h1>

        {/* Morphing kavramlar — dayanışma · hafıza · direniş · vicdan */}
        {words.length > 0 &&
          (reduce ? (
            <p className="mt-6 text-3xl font-black uppercase tracking-tight text-flag-green md:text-5xl">
              {words.join(' · ')}
            </p>
          ) : (
            <div className="mt-4 h-[4.5rem] w-full md:h-[6rem]">
              <GooeyText
                texts={words}
                morphTime={1}
                cooldownTime={1.1}
                className="h-full"
                textClassName="uppercase tracking-tight text-flag-green"
              />
            </div>
          ))}

        {/* Tagline — ortalı, belirgin */}
        <div className="mt-8 flex justify-center">
          <span className="text-base font-bold uppercase tracking-[0.4em] text-bone sm:text-lg">
            {t('tagline')}
          </span>
        </div>

        {/* Scroll ipucu */}
        <a
          href="#program"
          className="group mt-12 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-bone-dim transition-colors hover:text-flag-red"
        >
          {t('scroll')}
          <motion.span
            aria-hidden="true"
            animate={reduce ? undefined : { y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </a>
      </motion.div>
    </section>
  )
}
