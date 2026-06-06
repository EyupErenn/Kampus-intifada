'use client'

import { Zap } from 'lucide-react'

interface TickerAnnouncement {
  title_tr: string
  title_en: string
  title_ar: string
  category: string
}

interface AnnouncementTickerProps {
  announcements: TickerAnnouncement[]
  locale: string
}

const DEFAULT_TEXT =
  "Campus İntifada – BTU Kampüsü'nde Farkındalık Hareketi"

function pickTitle(a: TickerAnnouncement, locale: string): string {
  if (locale === 'en') return a.title_en
  if (locale === 'ar') return a.title_ar
  return a.title_tr
}

export default function AnnouncementTicker({
  announcements,
  locale,
}: AnnouncementTickerProps) {
  const acil = announcements.filter((a) => a.category === 'acil')

  // Acil duyuru yoksa: sakin, statik varsayılan satır (alarm hissi vermeden).
  if (acil.length === 0) {
    return (
      <div className="flex h-10 items-center justify-center overflow-hidden bg-brand-red px-4 text-sm font-medium text-white">
        <span className="truncate">{DEFAULT_TEXT}</span>
      </div>
    )
  }

  const titles = acil.map((a) => pickTitle(a, locale))

  return (
    <div className="relative flex h-10 items-stretch overflow-hidden bg-brand-red text-white">
      {/* Sabit ACİL etiketi */}
      <div className="z-10 flex shrink-0 items-center gap-1.5 bg-black/25 px-3 text-xs font-bold uppercase tracking-widest">
        <Zap className="h-3.5 w-3.5" aria-hidden="true" />
        Acil
      </div>

      {/* Kayan marquee */}
      <div className="flex flex-1 items-center overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-3 whitespace-nowrap text-sm font-medium">
          {titles.map((title, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {title}
              </span>
              {i < titles.length - 1 && (
                <span className="text-white/60">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
