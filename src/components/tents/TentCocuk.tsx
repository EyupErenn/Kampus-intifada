'use client'

import { GraduationCap, HeartPulse, Home, Users, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CountUp from '@/components/CountUp'
import CommentWall from '@/components/CommentWall'
import { TatreezBand } from '@/components/motifs/Tatreez'

interface TentCocukProps {
  tent: Tent
  locale: string
}

const STAT_META: Array<{ icon: LucideIcon; target: number; suffix: string }> = [
  { icon: Users, target: 1100000, suffix: '+' },
  { icon: GraduationCap, target: 625000, suffix: '+' },
  { icon: Home, target: 17000, suffix: '+' },
  { icon: HeartPulse, target: 1000, suffix: '+' },
]

export default function TentCocuk({ tent, locale }: TentCocukProps) {
  const t = useTranslations('tent.cocuk')
  const stats = t.raw('stats') as string[]

  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      {/* Hero — yukarı uzanan çocuk elleri */}
      <div className="relative mb-12 overflow-hidden rounded-3xl border border-flag-green/20 bg-gradient-to-b from-flag-green/10 to-transparent p-8 text-center">
        <svg viewBox="0 0 300 120" className="mx-auto mb-4 h-28 w-full max-w-md" aria-hidden="true">
          {[40, 90, 150, 210, 260].map((x, i) => (
            <g key={x} fill="none" stroke="#306d29" strokeWidth="3" strokeLinecap="round">
              <line x1={x} y1="120" x2={x} y2={70 - (i % 2) * 12} />
              <line x1={x - 8} y1={78 - (i % 2) * 12} x2={x - 8} y2={60 - (i % 2) * 12} />
              <line x1={x + 8} y1={78 - (i % 2) * 12} x2={x + 8} y2={60 - (i % 2) * 12} />
              <line x1={x - 4} y1={74 - (i % 2) * 12} x2={x - 4} y2={54 - (i % 2) * 12} />
              <line x1={x + 4} y1={74 - (i % 2) * 12} x2={x + 4} y2={54 - (i % 2) * 12} />
            </g>
          ))}
        </svg>
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-flag-green">
          {t('kicker')}
        </span>
        <h1 className="riso-title mt-1 text-3xl font-black text-bone md:text-5xl">
          {name}
        </h1>
        <div className="mt-4 flex justify-center">
          <TatreezBand count={5} color="#306d29" className="h-3.5 w-40" />
        </div>
        <p className="mx-auto mt-3 max-w-md text-bone-dim/70">{desc}</p>
      </div>

      {/* İstatistik kartları */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((label, i) => {
          const meta = STAT_META[i]
          const Icon = meta.icon
          return (
            <div
              key={i}
              className="rounded-2xl border border-flag-green/15 bg-flag-green/5 p-5 text-center"
            >
              <Icon className="mx-auto mb-2 h-7 w-7 text-flag-green" />
              <CountUp
                target={meta.target}
                suffix={meta.suffix}
                locale={locale}
                className="block text-3xl font-black tabular-nums text-bone"
              />
              <p className="mt-1 text-xs text-bone-dim/60">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Atölye bölümü */}
      <div className="mb-12 grid gap-6 rounded-3xl border border-flag-green/15 bg-flag-green/5 p-8 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-flag-green/20 text-2xl font-black tabular-nums text-flag-green">
          16:00
        </div>
        <div>
          <h2 className="text-xl font-bold text-bone">{t('workshopTitle')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-bone-dim/70">
            {t('workshopBody')}
          </p>
        </div>
      </div>

      {/* Mesaj duvarı — post-it */}
      <div className="dossier-card rounded-3xl p-6">
        <h2 className="mb-1 text-xl font-bold text-bone">{t('wallTitle')}</h2>
        <p className="mb-5 text-sm text-bone-dim/60">{t('wallDesc')}</p>
        <CommentWall
          tentId={tent.id}
          locale={locale}
          variant="postit"
          maxContent={200}
          placeholder={t('wallPlaceholder')}
          buttonLabel={t('wallButton')}
        />
      </div>
    </section>
  )
}
