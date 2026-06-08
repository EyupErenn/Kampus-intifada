'use client'

import {
  Baby,
  BookOpen,
  Camera,
  GraduationCap,
  Key,
  type LucideIcon,
  Medal,
  Mic,
  Newspaper,
  Palette,
  Scale,
  Sprout,
  Stethoscope,
  Wrench,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CountUp from '@/components/CountUp'
import { TatreezBand } from '@/components/motifs/Tatreez'

interface TentDarAgaciProps {
  tent: Tent
  locale: string
}

const CATEGORY_META: Array<{ icon: LucideIcon; count: number }> = [
  { icon: GraduationCap, count: 3100 },
  { icon: Newspaper, count: 320 },
  { icon: Stethoscope, count: 280 },
  { icon: BookOpen, count: 540 },
  { icon: Scale, count: 190 },
  { icon: Baby, count: 250 },
  { icon: Wrench, count: 410 },
  { icon: Sprout, count: 360 },
  { icon: Palette, count: 150 },
  { icon: Medal, count: 130 },
  { icon: Mic, count: 220 },
  { icon: Camera, count: 90 },
]

export default function TentDarAgaci({ tent, locale }: TentDarAgaciProps) {
  const t = useTranslations('tent.dar-agaci')
  const categories = t.raw('categories') as string[]

  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-flag-red/15">
          <Key className="h-7 w-7 text-flag-red" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-flag-red">
            {t('kicker')}
          </span>
          <h1 className="riso-title text-3xl font-black text-bone md:text-5xl">
            {name}
          </h1>
        </div>
      </header>

      <div className="mb-10 flex items-center gap-4">
        <TatreezBand count={5} color="#9b0f06" className="h-3.5 w-32 shrink-0" />
        <p className="max-w-xl text-bone-dim">{desc}</p>
      </div>

      {/* Anahtar Sende — empati */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-ink-line bg-ink-raised">
          {/* Öğrenci illüstrasyonu */}
          <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
            <rect width="200" height="200" fill="#0b0c0a" />
            <rect x="40" y="135" width="120" height="8" rx="2" fill="#475569" />
            <rect x="48" y="143" width="6" height="40" fill="#334155" />
            <rect x="146" y="143" width="6" height="40" fill="#334155" />
            <path d="M85 135 Q100 100 115 135 Z" fill="#9b0f06" opacity="0.8" />
            <circle cx="100" cy="92" r="14" fill="#9b0f06" />
            <path d="M78 130 L100 124 L122 130 L122 134 L100 128 L78 134 Z" fill="#e2e8f0" />
          </svg>

          {/* CSS parmaklıklar */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(0,0,0,0.78) 0px, rgba(0,0,0,0.78) 7px, transparent 7px, transparent 34px)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink to-transparent p-5">
            <p className="text-lg font-bold text-bone">{t('keyTitle')}</p>
            <p className="text-sm text-bone">{t('keyDesc')}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6">
          {/* Victor Hugo alıntısı (kamu malı) */}
          <blockquote className="dossier-card rounded-3xl p-6">
            <p className="italic leading-relaxed text-bone">{t('quoteFr')}</p>
            <p className="mt-3 text-sm leading-relaxed text-bone-dim">{t('quoteLocal')}</p>
            <footer className="mt-3 text-sm font-semibold text-flag-red">
              — {t('quoteAuthor')}
            </footer>
          </blockquote>

          {/* Sayaç */}
          <div className="rounded-3xl border border-flag-red/20 bg-flag-red/5 p-6 text-center">
            <p className="text-sm uppercase tracking-wide text-bone-dim">
              {t('counterLabel')}
            </p>
            <CountUp
              target={12000}
              locale={locale}
              suffix="+"
              className="my-1 block text-5xl font-black tabular-nums text-flag-red md:text-6xl"
            />
            <p className="text-sm text-bone-dim">{t('counterUnit')}</p>
          </div>
        </div>
      </div>

      {/* 12 kategori — 3x4 grid */}
      <h2 className="mb-5 mt-14 text-2xl font-bold text-bone">
        {t('prisonersTitle')}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((catName, i) => {
          const meta = CATEGORY_META[i]
          const Icon = meta?.icon ?? GraduationCap
          return (
            <div
              key={i}
              className="dossier-card flex flex-col items-center rounded-2xl p-4 text-center"
            >
              <Icon className="mb-2 h-8 w-8 text-flag-red" />
              <span className="text-sm font-medium text-bone">{catName}</span>
              <CountUp
                target={meta?.count ?? 0}
                locale={locale}
                suffix="+"
                className="mt-1 text-2xl font-black tabular-nums text-bone"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
