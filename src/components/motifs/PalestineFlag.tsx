import { useId } from 'react'

/* Filistin bayrağı — siyah/beyaz/yeşil bant + kırmızı üçgen.
   Navbar logosu. Yuvarlatılmış köşe + ince kenar. */

interface PalestineFlagProps {
  size?: number
  className?: string
}

export function PalestineFlag({ size = 30, className }: PalestineFlagProps) {
  const id = useId()
  const w = size
  const h = (size * 2) / 3 // 3:2 oran

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 60 40"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <clipPath id={id}>
          <rect width="60" height="40" rx="5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="60" height="13.34" fill="#000000" />
        <rect y="13.33" width="60" height="13.34" fill="#ffffff" />
        <rect y="26.66" width="60" height="13.34" fill="#007A3D" />
        <path d="M0 0 L26 20 L0 40 Z" fill="#CE1126" />
      </g>
      <rect
        x="0.5"
        y="0.5"
        width="59"
        height="39"
        rx="4.6"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
      />
    </svg>
  )
}
