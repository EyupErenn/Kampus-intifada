'use client'

import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CountUp from '@/components/CountUp'

interface TentSayilarlaProps {
  tent: Tent
  locale: string
}

interface Stat {
  target: number
  suffix: string
  label: string
}

const STATS: Stat[] = [
  { target: 45000, suffix: '+', label: 'Şehit' },
  { target: 100000, suffix: '+', label: 'Yaralı' },
  { target: 170000, suffix: '+', label: 'Yıkılan Bina' },
  { target: 70000, suffix: ' ton', label: 'Bomba Tonajı' },
]

export default function TentSayilarla({ tent, locale }: TentSayilarlaProps) {
  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="grain relative w-full overflow-hidden">
      {/* kırmızı grain atmosfer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 0%, rgba(220,38,38,0.16), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="mb-14 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-red">
            Sayılarla Gazze
          </span>
          <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">{name}</h1>
          <p className="mx-auto mt-3 max-w-md text-slate-400">{desc}</p>
        </header>

        {/* 4 dramatik sayaç */}
        <div className="grid gap-12 sm:grid-cols-2">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <CountUp
                target={s.target}
                suffix={s.suffix}
                locale={locale}
                className="block break-words text-6xl font-black tabular-nums text-brand-red sm:text-8xl md:text-9xl"
              />
              <p className="mt-2 text-lg uppercase tracking-wide text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mescid-i Aksa paneli */}
        <div className="glass-card mt-20 grid overflow-hidden rounded-3xl md:grid-cols-2">
          <div className="relative min-h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=1200"
              alt="Mescid-i Aksa"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/60" />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white">Mescid-i Aksa</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              İslam’ın ilk kıblesi ve üç semavi din için kutsal sayılan Kudüs’ün kalbi.
              Tarih boyunca pek çok medeniyete tanıklık eden Mescid-i Aksa, bugün de
              özgürlük ve onur mücadelesinin sembolü olmayı sürdürüyor.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Erişim kısıtlamaları, baskınlar ve statükoyu değiştirme girişimleri
              karşısında; mabedin korunması, dünya çapındaki dayanışmanın ortak
              çağrılarından biri hâline gelmiştir.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
