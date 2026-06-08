// server component — Filistin/dayanışma bağlamlı düz (flat) SVG semboller.
// Hepsi currentColor kullanır; renk MotifPanel'den text-* ile gelir.
import { cn } from '@/lib/utils'

type SVGProps = { className?: string }

const base = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/* Kubbet-üs Sahra / Mescid-i Aksa — sekizgen kaide + kubbe + hilal */
export function Dome({ className }: SVGProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M32 6v4" />
      <path d="M32 10c5 0 9 5 9 11 0 4-4 7-9 7s-9-3-9-7c0-6 4-11 9-11Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M20 30h24v6H20z" />
      <path d="M22 36v18M42 36v18M28 36v18M36 36v18" />
      <path d="M16 54h32" />
      <path d="M24 44c0-3 2-5 4-5M40 44c0-3-2-5-4-5" />
    </svg>
  )
}

/* Zeytin dalı — sumud/sebat sembolü */
export function Olive({ className }: SVGProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M14 52C24 44 34 30 50 14" />
      <path d="M40 20c4-3 9-3 9-3s-1 5-5 7-9 1-9 1 1-3 5-5Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M30 30c4-3 9-2 9-2s-2 5-6 6-9 0-9 0 2-2 6-4Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M22 40c4-3 9-2 9-2s-2 5-6 6-9 0-9 0 2-2 6-4Z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="46" cy="30" r="3" fill="currentColor" fillOpacity="0.25" />
      <circle cx="34" cy="42" r="3" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

/* Keffiyeh — geometrik ağ + çengel deseni */
export function Keffiyeh({ className }: SVGProps) {
  return (
    <svg {...base} className={className} strokeWidth={1.6} aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="2" />
      <path d="M10 24h44M10 40h44" strokeOpacity="0.5" />
      <path d="M16 16l6 6-6 6M28 16l6 6-6 6M40 16l6 6-6 6" />
      <path d="M16 44l4-4 4 4M28 44l4-4 4 4M40 44l4-4 4 4" strokeOpacity="0.7" />
      <path d="M14 34h6M26 34h6M38 34h6M50 34h0" strokeOpacity="0.6" />
    </svg>
  )
}

/* Filistin bayrağı — direkte dalgalanan */
export function Flag({ className }: SVGProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M16 8v48" />
      <path d="M16 12c8-4 16 4 24 0s16-4 16-4v22s-8 0-16 4-16-4-24 0V12Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M16 23c8-4 16 4 24 0s16-4 16-4" strokeOpacity="0.6" />
      <path d="M16 17l14 6" strokeOpacity="0.5" />
    </svg>
  )
}

/* Barış güvercini + zeytin */
export function Dove({ className }: SVGProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 40c8 2 14-2 18-8 3-4 8-6 14-6-2 6-2 10-6 14-6 6-16 8-26 6Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M30 26c4-6 10-8 18-8" />
      <path d="M44 18l3-4M50 18l1-5" />
      <circle cx="40" cy="24" r="1.4" fill="currentColor" />
      <path d="M22 38c0 6 4 10 4 10M16 44c4 2 8 2 8 2" strokeOpacity="0.6" />
    </svg>
  )
}

/* Megafon — miting / basın açıklaması */
export function Megaphone({ className }: SVGProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 28v8l6 1v6l5 1v-6l22 8V20L23 28h-5l-6 0Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M50 22v20" />
      <path d="M54 26c3 2 3 10 0 12" strokeOpacity="0.6" />
    </svg>
  )
}

/* Açık kitap — akademik / panel */
export function Book({ className }: SVGProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M32 20c-5-4-12-4-18-2v30c6-2 13-2 18 2 5-4 12-4 18-2V18c-6-2-13-2-18 2Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M32 20v30" />
      <path d="M20 26c4-1 8-1 8-1M20 33c4-1 8-1 8-1M44 26c-4-1-8-1-8-1M44 33c-4-1-8-1-8-1" strokeOpacity="0.55" />
    </svg>
  )
}

/* Uçurtma — çocuk atölyesi (Gazze çocukları sembolü) */
export function Kite({ className }: SVGProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M32 8 48 28 32 40 16 28 32 8Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 8v32M16 28h32" strokeOpacity="0.5" />
      <path d="M32 40c-1 5 2 8 0 12s-3 4-3 4" />
      <path d="M30 48l4 2M28 54l4 2" strokeOpacity="0.7" />
    </svg>
  )
}

export const SYMBOLS = {
  dome: Dome,
  olive: Olive,
  keffiyeh: Keffiyeh,
  flag: Flag,
  dove: Dove,
  megaphone: Megaphone,
  book: Book,
  kite: Kite,
} as const

export type MotifSymbol = keyof typeof SYMBOLS

/* İçeriğe uygun, on-brand görsel panel — stok fotoğrafların yerini alır. */
export function MotifPanel({
  symbol,
  tone = 'green',
  className,
}: {
  symbol: MotifSymbol
  tone?: 'green' | 'red'
  className?: string
}) {
  const Sym = SYMBOLS[symbol]
  const toneText = tone === 'red' ? 'text-flag-red' : 'text-flag-green'
  const toneBg =
    tone === 'red'
      ? 'from-flag-red/12 to-flag-red/[0.02]'
      : 'from-flag-green/12 to-flag-green/[0.02]'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-gradient-to-br',
        toneBg,
        className
      )}
      aria-hidden="true"
    >
      <div className="halftone absolute inset-0 opacity-40" />
      <Sym className={cn('relative h-20 w-20 max-h-[55%] max-w-[55%]', toneText)} />
    </div>
  )
}
