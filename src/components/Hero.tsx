'use client'

import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TatreezField, TatreezBand } from '@/components/motifs/Tatreez'
import { EASE_STITCH } from '@/lib/motion'

const lineMask: Variants = {
  hidden: { y: '115%' },
  show: (i: number) => ({
    y: '0%',
    transition: { duration: 0.8, ease: EASE_STITCH, delay: 0.15 + i * 0.12 },
  }),
}

const softUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_STITCH, delay: 0.5 + i * 0.12 },
  }),
}

export default function Hero() {
  const t = useTranslations('hero')
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  // Fare parallax'ı — arka plan nakış alanı hafifçe yaşar.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 60, damping: 18 })
  const py = useSpring(my, { stiffness: 60, damping: 18 })

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 28)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 28)
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="grain relative flex min-h-[88vh] items-center overflow-hidden px-5 sm:px-8"
    >
      {/* Nakış zemini (parallax) */}
      <motion.div
        style={{ x: px, y: py }}
        className="pointer-events-none absolute -inset-16"
        aria-hidden="true"
      >
        <TatreezField className="h-full w-full" opacity={0.06} />
      </motion.div>

      {/* Atmosfer — kırmızı/yeşil ember glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 18% 8%, rgba(228,49,43,0.16), transparent 70%), radial-gradient(50% 50% at 88% 100%, rgba(31,158,87,0.13), transparent 72%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl py-24">
        {/* Dosya başlığı satırı */}
        <motion.div
          custom={0}
          variants={softUp}
          initial="hidden"
          animate="show"
          className="mb-7 flex flex-wrap items-center gap-4"
        >
          <span className="stamp -rotate-2 text-flag-red text-[11px]">
            № 01 — Dosya
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-bone-dim">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flag-red opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flag-red" />
            </span>
            {t('subtitle')}
          </span>
        </motion.div>

        {/* Kinetik logotype — maske ile satır açılışı */}
        <h1 className="riso-title text-[clamp(3.5rem,13vw,11rem)] font-black leading-[0.86] tracking-tight text-flag-white">
          {['Campus', 'İntifada'].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.05em]">
              <motion.span
                custom={i}
                variants={reduce ? undefined : lineMask}
                initial={reduce ? false : 'hidden'}
                animate={reduce ? false : 'show'}
                className="block"
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Tatreez şeridi + tagline */}
        <motion.div
          custom={1}
          variants={softUp}
          initial="hidden"
          animate="show"
          className="mt-8 flex items-center gap-5"
        >
          <TatreezBand count={6} className="h-4 w-40 shrink-0 sm:w-56" />
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-bone-dim sm:text-base">
            {t('tagline')}
          </span>
        </motion.div>

        {/* Açıklama */}
        <motion.p
          custom={2}
          variants={softUp}
          initial="hidden"
          animate="show"
          className="mt-8 max-w-xl text-lg leading-relaxed text-bone-dim"
        >
          {t('description')}
        </motion.p>

        {/* Dosya alt cetveli + scroll ipucu */}
        <motion.div
          custom={3}
          variants={softUp}
          initial="hidden"
          animate="show"
          className="mt-14 flex items-center gap-4 border-t border-ink-line pt-5 text-xs uppercase tracking-[0.2em] text-bone-dim"
        >
          <span className="font-semibold text-bone">BTU Kampüsü</span>
          <span className="h-1 w-1 rounded-full bg-flag-green" />
          <span className="tabular-nums">2026</span>
          <a
            href="#program"
            className="group ms-auto inline-flex items-center gap-2 text-bone transition-colors hover:text-flag-red"
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
      </div>
    </section>
  )
}
