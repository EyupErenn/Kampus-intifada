'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'

/* ============================================================
   TATREEZ — Filistin nakışı (cross-stitch) motif sistemi.
   Hücreler küçük dolu karelerden oluşur; "dikilerek" (stitch-in)
   stagger ile belirir. prefers-reduced-motion'da statik render.
   ============================================================ */

type Grid = string[]

// Klasik baklava (dolu) birim — 5x5
const DIAMOND: Grid = ['00100', '01110', '11111', '01110', '00100']

// Sekiz köşeli yıldız (najmeh) — 7x7
const STAR: Grid = [
  '0001000',
  '0101010',
  '0011100',
  '1111111',
  '0011100',
  '0101010',
  '0001000',
]

interface Cell {
  x: number
  y: number
  i: number
}

function cellsFromGrid(grid: Grid, ox = 0, startIndex = 0): Cell[] {
  const out: Cell[] = []
  let i = startIndex
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '1') out.push({ x: ox + x, y, i: i++ })
    }
  })
  return out
}

const container = (stagger: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
})

const cellV: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
}

const CELL_STYLE = {
  transformBox: 'fill-box',
  transformOrigin: 'center',
} as const

interface BandProps {
  count?: number
  color?: string
  className?: string
  stagger?: number
}

/** Yatay cross-stitch şeridi — bölüm ayıracı / dekoratif bant. */
export function TatreezBand({
  count = 12,
  color = 'var(--color-flag-red)',
  className,
  stagger = 0.012,
}: BandProps) {
  const reduce = useReducedMotion()
  const cell = 4
  const pitch = 7 // 5 birim + 2 boşluk
  const cols = count * pitch - 2
  const rows = 5

  const cells: Cell[] = []
  let idx = 0
  for (let d = 0; d < count; d++) {
    cells.push(...cellsFromGrid(DIAMOND, d * pitch, idx))
    idx += 13 // DIAMOND'daki dolu hücre sayısı
  }

  return (
    <svg
      viewBox={`0 0 ${cols * cell} ${rows * cell}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <motion.g
        variants={container(stagger)}
        initial={reduce ? 'show' : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {cells.map((c) => (
          <motion.rect
            key={c.i}
            variants={cellV}
            style={CELL_STYLE}
            x={c.x * cell + 0.4}
            y={c.y * cell + 0.4}
            width={cell - 0.8}
            height={cell - 0.8}
            fill={color}
          />
        ))}
      </motion.g>
    </svg>
  )
}

interface OrnamentProps {
  size?: number
  color?: string
  className?: string
}

/** Tek sekiz köşeli yıldız — kart köşesi / işaret süsü. */
export function TatreezStar({
  size = 28,
  color = 'var(--color-flag-green)',
  className,
}: OrnamentProps) {
  const reduce = useReducedMotion()
  const cell = 4
  const cells = cellsFromGrid(STAR)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${7 * cell} ${7 * cell}`}
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <motion.g
        variants={container(0.02)}
        initial={reduce ? 'show' : 'hidden'}
        whileInView="show"
        viewport={{ once: true }}
      >
        {cells.map((c) => (
          <motion.rect
            key={c.i}
            variants={cellV}
            style={CELL_STYLE}
            x={c.x * cell + 0.4}
            y={c.y * cell + 0.4}
            width={cell - 0.8}
            height={cell - 0.8}
            fill={color}
          />
        ))}
      </motion.g>
    </svg>
  )
}

interface FieldProps {
  className?: string
  color?: string
  opacity?: number
}

/** Büyük soluk nakış zemini — hero arka planı (statik pattern, ucuz). */
export function TatreezField({
  className,
  color = 'var(--color-bone)',
  opacity = 0.05,
}: FieldProps) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      role="presentation"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id="tatreez-field"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          {/* merkez baklava */}
          <rect x="20" y="20" width="8" height="8" fill={color} />
          <rect x="12" y="20" width="6" height="8" fill={color} />
          <rect x="30" y="20" width="6" height="8" fill={color} />
          <rect x="20" y="12" width="8" height="6" fill={color} />
          <rect x="20" y="30" width="8" height="6" fill={color} />
          {/* köşe noktaları */}
          <rect x="2" y="2" width="4" height="4" fill={color} />
          <rect x="42" y="42" width="4" height="4" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tatreez-field)" />
    </svg>
  )
}

interface DividerProps {
  count?: number
  color?: string
  className?: string
}

/** Bölüm ayıracı — iki kemik cetvel arasında tatreez şeridi. */
export function TatreezDivider({ count = 10, color, className }: DividerProps) {
  return (
    <div
      className={`flex items-center gap-4 ${className ?? ''}`}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-ink-line" />
      <TatreezBand count={count} color={color} className="h-4 w-auto shrink-0" />
      <span className="h-px flex-1 bg-ink-line" />
    </div>
  )
}
