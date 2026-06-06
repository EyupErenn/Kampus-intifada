'use client'

import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import {
  Anchor,
  BarChart2,
  BookOpen,
  Heart,
  Key,
  ShieldOff,
  Tent as TentIcon,
  type LucideIcon,
} from 'lucide-react'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'

interface TentGridProps {
  tents: Tent[]
  locale: string
}

const ICON_MAP: Record<string, LucideIcon> = {
  anchor: Anchor,
  'shield-off': ShieldOff,
  key: Key,
  'bar-chart-2': BarChart2,
  heart: Heart,
  'book-open': BookOpen,
}

// Her çadıra özgü geometrik SVG arka plan deseni (40x40 tile).
function TentPattern({ slug, color }: { slug: string; color: string }) {
  const id = `pat-${slug}`
  let tile: React.ReactNode

  switch (slug) {
    case 'sumud': // dalga çizgileri
      tile = (
        <path
          d="M0 20 Q 10 8 20 20 T 40 20 M0 36 Q 10 24 20 36 T 40 36"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      )
      break
    case 'boykot': // çapraz tarama
      tile = (
        <path
          d="M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30 M0 0 L40 40 M-10 30 L10 50 M30 -10 L50 10"
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
      )
      break
    case 'dar-agaci': // dikey çubuklar
      tile = (
        <path
          d="M8 0 V40 M20 0 V40 M32 0 V40"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      )
      break
    case 'sayilarla': // nokta ızgarası
      tile = (
        <g fill={color}>
          <circle cx="10" cy="10" r="1.6" />
          <circle cx="30" cy="10" r="1.6" />
          <circle cx="10" cy="30" r="1.6" />
          <circle cx="30" cy="30" r="1.6" />
          <circle cx="20" cy="20" r="1.6" />
        </g>
      )
      break
    case 'cocuk': // kalp dış hatları
      tile = (
        <path
          d="M20 28 C 12 20 12 12 18 12 C 20 12 20 14 20 15 C 20 14 20 12 22 12 C 28 12 28 20 20 28 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
      )
      break
    case 'kutuphane': // kitap istifi dış hatları
      tile = (
        <g fill="none" stroke={color} strokeWidth="1.2">
          <rect x="8" y="6" width="24" height="7" rx="1" />
          <rect x="10" y="16" width="24" height="7" rx="1" />
          <rect x="6" y="26" width="24" height="7" rx="1" />
        </g>
      )
      break
    default:
      tile = <circle cx="20" cy="20" r="2" fill={color} />
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          {tile}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function TentGrid({ tents, locale }: TentGridProps) {
  const router = useRouter()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
    >
      {tents.map((tent) => {
        const color = tent.color ?? '#dc2626'
        const slug = tent.slug
        const Icon = (tent.icon && ICON_MAP[tent.icon]) || TentIcon
        const name = localized(tent, 'name', locale)
        const desc = localized(tent, 'desc', locale)

        return (
          <motion.button
            key={tent.id}
            variants={item}
            type="button"
            onClick={() => router.push(`/${locale}/cadirlar/${slug}`)}
            style={{ '--tent': color } as React.CSSProperties}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-6 text-left transition-all duration-300 hover:border-[var(--tent)] hover:shadow-[0_0_40px_-12px_var(--tent)]"
          >
            <TentPattern slug={slug} color={color} />

            <div className="relative flex h-full flex-col">
              <Icon
                size={48}
                color={color}
                strokeWidth={1.5}
                className="mb-4 transition-transform duration-300 group-hover:-translate-y-2"
                aria-hidden="true"
              />
              <h3 className="text-lg font-bold leading-tight text-white">
                {name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {desc}
              </p>
            </div>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
