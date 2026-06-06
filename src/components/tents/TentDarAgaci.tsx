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
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CountUp from '@/components/CountUp'

interface TentDarAgaciProps {
  tent: Tent
  locale: string
}

interface Category {
  icon: LucideIcon
  name: string
  count: number
}

const CATEGORIES: Category[] = [
  { icon: GraduationCap, name: 'Öğrenci', count: 3100 },
  { icon: Newspaper, name: 'Gazeteci', count: 320 },
  { icon: Stethoscope, name: 'Doktor & Sağlıkçı', count: 280 },
  { icon: BookOpen, name: 'Öğretmen', count: 540 },
  { icon: Scale, name: 'Avukat', count: 190 },
  { icon: Baby, name: 'Çocuk', count: 250 },
  { icon: Wrench, name: 'Mühendis', count: 410 },
  { icon: Sprout, name: 'Çiftçi', count: 360 },
  { icon: Palette, name: 'Sanatçı', count: 150 },
  { icon: Medal, name: 'Sporcu', count: 130 },
  { icon: Mic, name: 'Akademisyen', count: 220 },
  { icon: Camera, name: 'Belgeselci', count: 90 },
]

export default function TentDarAgaci({ tent, locale }: TentDarAgaciProps) {
  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15">
          <Key className="h-7 w-7 text-violet-400" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
            Dar Ağacı
          </span>
          <h1 className="text-3xl font-black text-white md:text-4xl">{name}</h1>
        </div>
      </header>

      <p className="mb-10 max-w-xl text-slate-400">{desc}</p>

      {/* Anahtar Sende — empati */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
          {/* Öğrenci illüstrasyonu */}
          <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
            <rect width="200" height="200" fill="#0f172a" />
            {/* masa */}
            <rect x="40" y="135" width="120" height="8" rx="2" fill="#475569" />
            <rect x="48" y="143" width="6" height="40" fill="#334155" />
            <rect x="146" y="143" width="6" height="40" fill="#334155" />
            {/* gövde */}
            <path d="M85 135 Q100 100 115 135 Z" fill="#7c3aed" opacity="0.8" />
            {/* baş */}
            <circle cx="100" cy="92" r="14" fill="#a78bfa" />
            {/* kitap */}
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-5">
            <p className="text-lg font-bold text-white">Anahtar Sende</p>
            <p className="text-sm text-slate-300">
              Parmaklıklar bedeni tutsak eder; bilinç ve dayanışma duvarları aşar.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6">
          {/* Victor Hugo alıntısı (kamu malı) */}
          <blockquote className="glass-card rounded-3xl p-6">
            <p className="italic leading-relaxed text-slate-200">
              «Condamné à mort ! Voilà cinq semaines que j’habite avec cette pensée,
              toujours seul avec elle, toujours glacé par sa présence, toujours courbé
              sous son poids !»
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              “Ölüme mahkûm! Beş haftadır bu düşünceyle yaşıyorum; daima onunla yalnız,
              daima varlığıyla donmuş, daima ağırlığı altında iki büklüm.”
            </p>
            <footer className="mt-3 text-sm font-semibold text-violet-300">
              — Victor Hugo, Bir İdam Mahkûmunun Son Günü
            </footer>
          </blockquote>

          {/* Sayaç */}
          <div className="rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6 text-center">
            <p className="text-sm uppercase tracking-wide text-slate-400">Şu an cezaevinde</p>
            <CountUp
              target={12000}
              locale={locale}
              suffix="+"
              className="my-1 block text-5xl font-black text-violet-300 md:text-6xl"
            />
            <p className="text-sm text-slate-400">esir</p>
          </div>
        </div>
      </div>

      {/* 12 kategori — 3x4 grid */}
      <h2 className="mb-5 mt-14 text-2xl font-bold text-white">Kimler Tutsak?</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.name}
              className="glass-card flex flex-col items-center rounded-2xl p-4 text-center"
            >
              <Icon className="mb-2 h-8 w-8 text-violet-400" />
              <span className="text-sm font-medium text-slate-300">{c.name}</span>
              <CountUp
                target={c.count}
                locale={locale}
                suffix="+"
                className="mt-1 text-2xl font-black text-white"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
