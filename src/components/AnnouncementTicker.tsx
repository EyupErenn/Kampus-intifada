'use client'

import { Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

function pickTitle(a: TickerAnnouncement, locale: string): string {
  if (locale === 'en') return a.title_en
  if (locale === 'ar') return a.title_ar
  return a.title_tr
}

export default function AnnouncementTicker({
  announcements,
  locale,
}: AnnouncementTickerProps) {
  const t = useTranslations('ticker')
  const acil = announcements.filter((a) => a.category === 'acil')

  // Acil duyuru yoksa: sakin, statik dosya satırı (alarm hissi vermeden).
  if (acil.length === 0) {
    return (
      <div className="flex h-9 items-center justify-center gap-3 overflow-hidden border-b border-ink-line bg-ink px-4">
        <span className="h-1 w-1 shrink-0 rounded-full bg-flag-green" />
        <span className="truncate text-xs font-medium uppercase tracking-[0.18em] text-bone-dim">
          {t('default')}
        </span>
        <span className="h-1 w-1 shrink-0 rounded-full bg-flag-red" />
      </div>
    )
  }

  const titles = acil.map((a) => pickTitle(a, locale))
  // Kesintisiz döngü için içerik iki kez render edilir (keyframe: 0 → -50%).
  const loop = [...titles, ...titles]

  return (
    <div className="relative flex h-9 items-stretch overflow-hidden bg-flag-red text-flag-white">
      {/* Sabit ACİL damgası */}
      <div className="z-10 flex shrink-0 items-center gap-1.5 bg-ink/90 px-3 text-[11px] font-black uppercase tracking-[0.22em] text-flag-red">
        <Zap className="h-3.5 w-3.5" aria-hidden="true" />
        {t('label')}
      </div>

      {/* Kayan haber şeridi */}
      <div className="flex flex-1 items-center overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-8 whitespace-nowrap pe-8 ps-8 text-sm font-semibold">
          {loop.map((title, i) => (
            <span key={i} className="flex items-center gap-2.5">
              <Zap className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
              {title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
