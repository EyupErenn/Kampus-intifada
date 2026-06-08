'use client'

import { motion } from 'framer-motion'
import {
  Coffee,
  CreditCard,
  CupSoda,
  Fingerprint,
  Lock,
  type LucideIcon,
  Sandwich,
  ShieldCheck,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import { TatreezBand } from '@/components/motifs/Tatreez'

interface TentBoykotProps {
  tent: Tent
  locale: string
}

// Askıdan sarkan ürün siluetleri (basit SVG path'leri)
const SILHOUETTES: Record<'bottle' | 'phone' | 'card', React.ReactNode> = {
  bottle: (
    <path
      d="M14 2h6v5l3 5v21a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V12l3-5z"
      fill="currentColor"
    />
  ),
  phone: <rect x="9" y="2" width="16" height="34" rx="3" fill="currentColor" />,
  card: <rect x="4" y="8" width="26" height="18" rx="2.5" fill="currentColor" />,
}

const HANGING: Array<{ kind: 'bottle' | 'phone' | 'card'; left: string; len: number; delay: number }> = [
  { kind: 'bottle', left: '12%', len: 70, delay: 0 },
  { kind: 'phone', left: '34%', len: 110, delay: 0.4 },
  { kind: 'card', left: '56%', len: 60, delay: 0.8 },
  { kind: 'bottle', left: '78%', len: 95, delay: 0.2 },
]

const PRODUCT_ICONS: LucideIcon[] = [CupSoda, Coffee, Smartphone, Sandwich, CreditCard]
const CYBER_ICONS: LucideIcon[] = [Fingerprint, ShieldCheck, Lock, Wifi]
const CALORIE_META = [
  { value: 1000, color: '#9b0f06' },
  { value: 1500, color: '#9b0f06' },
  { value: 2000, color: '#306d29' },
]
const CAL_MAX = 2000

export default function TentBoykot({ tent, locale }: TentBoykotProps) {
  const t = useTranslations('tent.boykot')
  const products = t.raw('products') as Array<{ category: string; alternative: string }>
  const calories = t.raw('calories') as string[]
  const cyber = t.raw('cyber') as Array<{ title: string; body: string }>

  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
      {/* Askıdan sarkan ürünler */}
      <div className="relative -mx-5 mb-10 h-44 overflow-hidden border-b border-ink-line bg-gradient-to-b from-flag-red/[0.06] to-transparent sm:-mx-8">
        {HANGING.map((h, i) => (
          <div key={i} className="absolute top-0" style={{ left: h.left }}>
            <motion.div
              className="origin-top"
              style={{ transformOrigin: 'top center' }}
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: h.delay }}
            >
              <div className="mx-auto w-px bg-bone/30" style={{ height: h.len }} />
              <svg width="34" height="40" viewBox="0 0 34 40" className="mx-auto text-flag-red/70">
                {SILHOUETTES[h.kind]}
              </svg>
            </motion.div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-flag-red">
            {t('kicker')}
          </span>
          <h1 className="riso-title mt-1 text-3xl font-black text-bone md:text-5xl">
            {name}
          </h1>
        </div>
      </div>

      <div className="mb-10 flex items-center gap-4">
        <TatreezBand count={5} color="#9b0f06" className="h-3.5 w-32 shrink-0" />
        <p className="max-w-xl text-bone-dim">{desc}</p>
      </div>

      {/* Bölüm 1 — Ürünler ve yerli alternatifler */}
      <h2 className="mb-5 text-2xl font-bold text-bone">{t('productsTitle')}</h2>
      <div className="mb-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => {
          const Icon = PRODUCT_ICONS[i] ?? CupSoda
          return (
            <div key={i} className="dossier-card flex items-stretch gap-3 rounded-2xl p-4">
              <div className="flex flex-col items-center justify-center gap-2 border-e border-ink-line pe-3">
                <Icon className="h-8 w-8 text-flag-red" />
                <span className="rounded bg-flag-red/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-flag-red">
                  {t('boycottLabel')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-bone">{p.category}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-flag-green">
                  {t('altLabel')}
                </p>
                <p className="mt-0.5 text-sm text-bone">{p.alternative}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bölüm 2 — İki panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kalori karşılaştırması */}
        <div className="dossier-card rounded-3xl p-6">
          <h3 className="mb-1 text-lg font-bold text-bone">{t('caloriesTitle')}</h3>
          <p className="mb-6 text-sm text-bone-dim">{t('caloriesDesc')}</p>
          <div className="flex h-56 items-end justify-around gap-4">
            {calories.map((label, i) => {
              const c = CALORIE_META[i]
              return (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
                  <span className="mb-2 text-sm font-bold tabular-nums text-bone">
                    {c.value} {t('kcal')}
                  </span>
                  <motion.div
                    className="w-full rounded-t-lg"
                    style={{ backgroundColor: c.color }}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${(c.value / CAL_MAX) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                  />
                  <span className="mt-2 text-center text-xs text-bone-dim">{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Teknoloji ve siber farkındalık */}
        <div className="dossier-card rounded-3xl p-6">
          <h3 className="mb-1 text-lg font-bold text-bone">{t('cyberTitle')}</h3>
          <p className="mb-5 text-sm text-bone-dim">{t('cyberDesc')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cyber.map((c, i) => {
              const Icon = CYBER_ICONS[i] ?? Fingerprint
              return (
                <div key={i} className="rounded-2xl border border-ink-line bg-bone/[0.03] p-4">
                  <Icon className="mb-2 h-6 w-6 text-flag-red" />
                  <h4 className="font-semibold text-bone">{c.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-bone-dim">{c.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
