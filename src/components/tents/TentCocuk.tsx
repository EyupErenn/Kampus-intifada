'use client'

import { GraduationCap, HeartPulse, Home, Users } from 'lucide-react'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CountUp from '@/components/CountUp'
import CommentWall from '@/components/CommentWall'

interface TentCocukProps {
  tent: Tent
  locale: string
}

const STATS = [
  { icon: Users, target: 1100000, suffix: '+', label: 'Yardıma muhtaç çocuk' },
  { icon: GraduationCap, target: 625000, suffix: '+', label: 'Eğitimi kesintiye uğrayan' },
  { icon: Home, target: 17000, suffix: '+', label: 'Refakatsiz / yetim kalan' },
  { icon: HeartPulse, target: 1000, suffix: '+', label: 'Günlük travma vakası' },
]

export default function TentCocuk({ tent, locale }: TentCocukProps) {
  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Hero — yukarı uzanan çocuk elleri */}
      <div className="relative mb-12 overflow-hidden rounded-3xl border border-rose-300/20 bg-gradient-to-b from-rose-500/10 to-transparent p-8 text-center">
        <svg viewBox="0 0 300 120" className="mx-auto mb-4 h-28 w-full max-w-md" aria-hidden="true">
          {[40, 90, 150, 210, 260].map((x, i) => (
            <g key={x} fill="none" stroke="#fb7185" strokeWidth="3" strokeLinecap="round">
              <line x1={x} y1="120" x2={x} y2={70 - (i % 2) * 12} />
              <line x1={x - 8} y1={78 - (i % 2) * 12} x2={x - 8} y2={60 - (i % 2) * 12} />
              <line x1={x + 8} y1={78 - (i % 2) * 12} x2={x + 8} y2={60 - (i % 2) * 12} />
              <line x1={x - 4} y1={74 - (i % 2) * 12} x2={x - 4} y2={54 - (i % 2) * 12} />
              <line x1={x + 4} y1={74 - (i % 2) * 12} x2={x + 4} y2={54 - (i % 2) * 12} />
            </g>
          ))}
        </svg>
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-rose-400">Çocuk</span>
        <h1 className="mt-1 text-3xl font-black text-white md:text-4xl">{name}</h1>
        <p className="mx-auto mt-2 max-w-md text-rose-100/70">{desc}</p>
      </div>

      {/* İstatistik kartları */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-rose-300/15 bg-rose-500/5 p-5 text-center"
            >
              <Icon className="mx-auto mb-2 h-7 w-7 text-rose-400" />
              <CountUp
                target={s.target}
                suffix={s.suffix}
                locale={locale}
                className="block text-3xl font-black text-white"
              />
              <p className="mt-1 text-xs text-rose-100/60">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Atölye bölümü */}
      <div className="mb-12 grid gap-6 rounded-3xl border border-rose-300/15 bg-rose-500/5 p-8 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-2xl font-black text-rose-300">
          16:00
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Çocuk Atölyesi</h2>
          <p className="mt-2 text-sm leading-relaxed text-rose-100/70">
            Çocuk Çadırı’nda düzenlenecek bu atölyede çocuklar resim, şiir ve hikâye
            anlatımı yoluyla duygularını özgürce ifade edebilecek. Gönüllü pedagog ve
            eğitmenler eşliğinde barış ve dayanışma temalı yaratıcı etkinlikler yer alacak.
            Küçük eller, en büyük umudu çiziyor.
          </p>
        </div>
      </div>

      {/* Mesaj duvarı — post-it */}
      <div className="rounded-3xl border border-rose-300/15 bg-slate-900/40 p-6">
        <h2 className="mb-1 text-xl font-bold text-white">Çocuklara Mesajın</h2>
        <p className="mb-5 text-sm text-rose-100/60">
          Kısa bir mesaj bırak; renkli not kâğıtları duvarında yerini alsın.
        </p>
        <CommentWall
          tentId={tent.id}
          locale={locale}
          variant="postit"
          maxContent={200}
          placeholder="Çocuklara mesajın... (max 200)"
          buttonLabel="Astır"
        />
      </div>
    </section>
  )
}
