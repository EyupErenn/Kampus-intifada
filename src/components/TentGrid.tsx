'use client'

import { useRouter } from 'next/navigation'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import {
  Anchor,
  ArrowUpRight,
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
import { TatreezStar } from '@/components/motifs/Tatreez'

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
    case 'sumud':
      tile = (
        <path
          d="M0 20 Q 10 8 20 20 T 40 20 M0 36 Q 10 24 20 36 T 40 36"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      )
      break
    case 'boykot':
      tile = (
        <path
          d="M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30 M0 0 L40 40 M-10 30 L10 50 M30 -10 L50 10"
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
      )
      break
    case 'dar-agaci':
      tile = (
        <path
          d="M8 0 V40 M20 0 V40 M32 0 V40"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      )
      break
    case 'sayilarla':
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
    case 'cocuk':
      tile = (
        <path
          d="M20 28 C 12 20 12 12 18 12 C 20 12 20 14 20 15 C 20 14 20 12 22 12 C 28 12 28 20 20 28 Z"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
      )
      break
    case 'kutuphane':
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
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.16]"
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
  show: { transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function TentCard({
  tent,
  locale,
  index,
}: {
  tent: Tent
  locale: string
  index: number
}) {
  const router = useRouter()
  const reduce = useReducedMotion()
  const color = tent.color ?? '#e4312b'
  const slug = tent.slug
  const Icon = (tent.icon && ICON_MAP[tent.icon]) || TentIcon
  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  // Manyetik eğim
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 150, damping: 15 })
  const sry = useSpring(ry, { stiffness: 150, damping: 15 })

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 9)
    rx.set(-py * 9)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.button
      variants={item}
      type="button"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => router.push(`/${locale}/cadirlar/${slug}`)}
      style={
        {
          rotateX: srx,
          rotateY: sry,
          transformPerspective: 900,
          '--tent': color,
        } as React.CSSProperties
      }
      className="dossier-card group relative cursor-pointer overflow-hidden rounded-3xl p-6 text-start transition-shadow duration-300 hover:shadow-[0_0_50px_-14px_var(--tent)]"
    >
      <TentPattern slug={slug} color={color} />

      {/* Köşe yıldızı */}
      <TatreezStar
        size={22}
        color={color}
        className="absolute end-4 top-4 opacity-40 transition-opacity duration-300 group-hover:opacity-90"
      />

      <div className="relative flex h-full flex-col">
        {/* İndeks */}
        <span className="mb-4 font-black tabular-nums text-xs uppercase tracking-[0.2em] text-bone-dim">
          № {String(index + 1).padStart(2, '0')}
        </span>

        <Icon
          size={44}
          color={color}
          strokeWidth={1.5}
          className="mb-4 transition-transform duration-300 group-hover:-translate-y-1"
          aria-hidden="true"
        />
        <h3 className="text-lg font-bold leading-tight text-flag-white">
          {name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-bone-dim">
          {desc}
        </p>

        {/* Git ipucu */}
        <span
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-0 transition-all duration-300 group-hover:opacity-100"
          style={{ color }}
        >
          <span className="h-px w-5" style={{ backgroundColor: color }} />
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  )
}

export default function TentGrid({ tents, locale }: TentGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {tents.map((tent, i) => (
        <TentCard key={tent.id} tent={tent} locale={locale} index={i} />
      ))}
    </motion.div>
  )
}
