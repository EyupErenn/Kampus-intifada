'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CommentWall from '@/components/CommentWall'
import { TatreezBand } from '@/components/motifs/Tatreez'

interface TentSumudProps {
  tent: Tent
  locale: string
}

// Çeviriye tabi olmayan veri (görsel + yıl) — metin messages'tan gelir.
const MEMORY_META = [
  { year: '2010', img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400' },
  { year: '2011–2018', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400' },
  { year: '2023', img: 'https://images.unsplash.com/photo-1609873814058-a8928924184a?w=400' },
  { year: '2024', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400' },
]

export default function TentSumud({ tent, locale }: TentSumudProps) {
  const t = useTranslations('tent.sumud')
  const memory = t.raw('memory') as Array<{ title: string; desc: string }>
  const quotes = t.raw('quotes') as Array<{ text: string; author: string }>

  const [quoteIndex, setQuoteIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [quotes.length])

  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <header className="mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
          {t('kicker')}
        </span>
        <h1 className="riso-title mt-2 text-4xl font-black tracking-tight text-flag-white md:text-6xl">
          {name}
        </h1>
        <div className="mt-5 flex items-center gap-4">
          <TatreezBand count={6} color="#38bdf8" className="h-3.5 w-40 shrink-0" />
          <p className="max-w-xl text-bone-dim">{desc}</p>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* SOL — Hafıza Duvarı */}
        <div className="dossier-card relative overflow-hidden rounded-3xl p-5 md:col-span-1">
          {/* Deniz dalgası SVG arka plan */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern id="sumud-wave" width="60" height="30" patternUnits="userSpaceOnUse">
                <path
                  d="M0 15 Q 15 2 30 15 T 60 15 M0 27 Q 15 14 30 27 T 60 27"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sumud-wave)" />
          </svg>

          <h2 className="relative mb-5 text-lg font-bold text-flag-white">
            {t('memoryTitle')}
          </h2>
          <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-full before:w-px before:bg-sky-400/30 rtl:before:left-auto rtl:before:right-[7px]">
            {memory.map((m, i) => (
              <li key={i} className="relative ps-6">
                <span className="absolute start-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-sky-400 bg-ink" />
                <div className="overflow-hidden rounded-2xl border border-ink-line bg-bone/[0.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={MEMORY_META[i]?.img}
                    alt={m.title}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-3">
                    <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-sky-300">
                      {MEMORY_META[i]?.year}
                    </span>
                    <h3 className="mt-1.5 font-bold text-flag-white">{m.title}</h3>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-bone-dim">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* SAĞ */}
        <div className="flex flex-col gap-8 md:col-span-2">
          {/* Quote carousel */}
          <div className="dossier-card relative min-h-[200px] overflow-hidden rounded-3xl p-8">
            <Quote className="absolute end-6 top-6 h-16 w-16 text-bone/5" />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quoteIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <p className="text-xl font-medium italic leading-relaxed text-flag-white md:text-2xl">
                  “{quotes[quoteIndex].text}”
                </p>
                <footer className="mt-4 text-sm font-semibold text-sky-300">
                  — {quotes[quoteIndex].author}
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            <div className="mt-6 flex gap-1.5">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuoteIndex(i)}
                  aria-label={`${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === quoteIndex ? 'w-6 bg-sky-400' : 'w-1.5 bg-bone/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sumud Duvarı — canlı dayanışma */}
          <div className="dossier-card rounded-3xl p-6">
            <h2 className="mb-1 text-lg font-bold text-flag-white">{t('wallTitle')}</h2>
            <p className="mb-4 text-sm text-bone-dim">{t('wallDesc')}</p>
            <CommentWall
              tentId={tent.id}
              locale={locale}
              variant="wall"
              maxContent={500}
              placeholder={t('wallPlaceholder')}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
