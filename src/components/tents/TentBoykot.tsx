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
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'

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

interface BoycottProduct {
  category: string
  icon: LucideIcon
  alternative: string
}

const PRODUCTS: BoycottProduct[] = [
  { category: 'Gazlı İçecekler', icon: CupSoda, alternative: 'Çamlıca, yerli gazozlar, ayran' },
  { category: 'Kahve Zincirleri', icon: Coffee, alternative: 'Yerel kahveciler, Türk kahvesi' },
  { category: 'Teknoloji & Telefon', icon: Smartphone, alternative: 'Cihazını yenile, ömrünü uzat' },
  { category: 'Fast Food', icon: Sandwich, alternative: 'Mahalle esnafı, ev yemeği' },
  { category: 'Kart & Ödeme', icon: CreditCard, alternative: 'Katılım / yerli bankalar' },
]

const CALORIES = [
  { label: 'Gazze (günlük ort.)', value: 1000, color: '#dc2626' },
  { label: 'DSÖ asgari', value: 1500, color: '#f59e0b' },
  { label: 'Normal ihtiyaç', value: 2000, color: '#16a34a' },
]
const CAL_MAX = 2000

const CYBER = [
  { icon: Fingerprint, title: 'Dijital Ayak İzi', body: 'Her tıklama veri bırakır. Hangi platformların kimi finanse ettiğini bil.' },
  { icon: ShieldCheck, title: 'VPN & Güvenlik', body: 'Güvenli bağlantı, sansürü aşmanın ve gizliliği korumanın ilk adımıdır.' },
  { icon: Lock, title: 'Veri Gizliliği', body: 'İzinleri kıs, takipçileri engelle; verin senin elinde kalsın.' },
  { icon: Wifi, title: 'Bilinçli Tüketim', body: 'Uygulama yüklerken sahibini ve fonlayıcısını araştır.' },
]

export default function TentBoykot({ tent, locale }: TentBoykotProps) {
  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      {/* Askıdan sarkan ürünler */}
      <div className="relative -mx-4 mb-10 h-44 overflow-hidden border-b border-white/10 bg-gradient-to-b from-slate-900/60 to-transparent sm:-mx-6">
        {HANGING.map((h, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{ left: h.left }}
          >
            <motion.div
              className="origin-top"
              style={{ transformOrigin: 'top center' }}
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: h.delay }}
            >
              <div className="mx-auto w-px bg-white/30" style={{ height: h.len }} />
              <svg width="34" height="40" viewBox="0 0 34 40" className="mx-auto text-amber-500/70">
                {SILHOUETTES[h.kind]}
              </svg>
            </motion.div>
          </div>
        ))}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Boykot</span>
          <h1 className="mt-1 text-3xl font-black text-white md:text-4xl">{name}</h1>
        </div>
      </div>

      <p className="mb-10 max-w-xl text-slate-400">{desc}</p>

      {/* Bölüm 1 — Ürünler ve yerli alternatifler */}
      <h2 className="mb-5 text-2xl font-bold text-white">Boykot & Yerli Alternatif</h2>
      <div className="mb-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.category} className="glass-card flex items-stretch gap-3 rounded-2xl p-4">
              <div className="flex flex-col items-center justify-center gap-2 border-r border-white/10 pr-3">
                <Icon className="h-8 w-8 text-amber-400" />
                <span className="rounded bg-brand-red/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-red">
                  Boykot
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white">{p.category}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
                  Yerli Alternatif
                </p>
                <p className="mt-0.5 text-sm text-slate-300">{p.alternative}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bölüm 2 — İki panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kalori karşılaştırması */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="mb-1 text-lg font-bold text-white">Kalori Karşılaştırması</h3>
          <p className="mb-6 text-sm text-slate-400">
            Ablukada bir insanın günlük aldığı ortalama kalori, asgari ve normal ihtiyaçla karşılaştırıldığında.
          </p>
          <div className="flex h-56 items-end justify-around gap-4">
            {CALORIES.map((c) => (
              <div key={c.label} className="flex h-full flex-1 flex-col items-center justify-end">
                <span className="mb-2 text-sm font-bold text-white">{c.value} kcal</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{ height: `${(c.value / CAL_MAX) * 100}%`, backgroundColor: c.color }}
                />
                <span className="mt-2 text-center text-xs text-slate-400">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teknoloji ve siber farkındalık */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="mb-1 text-lg font-bold text-white">Teknoloji ve Siber Farkındalık</h3>
          <p className="mb-5 text-sm text-slate-400">
            Dijital alanda da bilinçli ol; verin ve tercihlerin birer tutum.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CYBER.map((c) => {
              const Icon = c.icon
              return (
                <div key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Icon className="mb-2 h-6 w-6 text-amber-400" />
                  <h4 className="font-semibold text-white">{c.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{c.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
