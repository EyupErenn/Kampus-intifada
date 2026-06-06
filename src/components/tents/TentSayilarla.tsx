'use client'

import { useTranslations } from 'next-intl'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CountUp from '@/components/CountUp'
import { TatreezBand } from '@/components/motifs/Tatreez'

interface TentSayilarlaProps {
  tent: Tent
  locale: string
}

const STAT_META = [
  { target: 45000, kind: 'plus' as const },
  { target: 100000, kind: 'plus' as const },
  { target: 170000, kind: 'plus' as const },
  { target: 70000, kind: 'ton' as const },
]

export default function TentSayilarla({ tent, locale }: TentSayilarlaProps) {
  const t = useTranslations('tent.sayilarla')
  const stats = t.raw('stats') as string[]

  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="grain relative w-full overflow-hidden">
      {/* kırmızı grain atmosfer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 0%, rgba(228,49,43,0.16), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <header className="mb-14 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-flag-red">
            {t('kicker')}
          </span>
          <h1 className="riso-title mt-2 text-4xl font-black tracking-tight text-flag-white md:text-6xl">
            {name}
          </h1>
          <div className="mt-5 flex items-center justify-center gap-4">
            <TatreezBand count={5} color="#e4312b" className="h-3.5 w-40 shrink-0" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-bone-dim">{desc}</p>
        </header>

        {/* 4 dramatik sayaç */}
        <div className="grid gap-12 sm:grid-cols-2">
          {stats.map((label, i) => {
            const meta = STAT_META[i]
            const suffix = meta.kind === 'ton' ? t('ton') : '+'
            return (
              <div key={i} className="text-center">
                <CountUp
                  target={meta.target}
                  suffix={suffix}
                  locale={locale}
                  className="block break-words text-6xl font-black tabular-nums text-flag-red sm:text-8xl md:text-9xl"
                />
                <p className="mt-2 text-lg uppercase tracking-wide text-bone-dim">
                  {label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Mescid-i Aksa paneli */}
        <div className="dossier-card mt-20 grid overflow-hidden rounded-3xl md:grid-cols-2">
          <div className="relative min-h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=1200"
              alt={t('aksaTitle')}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/60" />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-flag-white">{t('aksaTitle')}</h2>
            <p className="mt-4 text-sm leading-relaxed text-bone">{t('aksaP1')}</p>
            <p className="mt-3 text-sm leading-relaxed text-bone-dim">{t('aksaP2')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
