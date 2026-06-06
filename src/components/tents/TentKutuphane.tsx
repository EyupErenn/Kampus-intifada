'use client'

import { BookMarked, ExternalLink, Film, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Resource, Tent } from '@/types/database'
import { localized } from '@/types/database'
import ResourcePool from '@/components/ResourcePool'
import { TatreezBand } from '@/components/motifs/Tatreez'

interface TentKutuphaneProps {
  tent: Tent
  resources: Resource[]
  locale: string
}

const FEATURED_URLS = [
  'https://en.wikipedia.org/wiki/The_Question_of_Palestine',
  'https://en.wikipedia.org/wiki/The_Hundred_Years%27_War_on_Palestine',
  'https://en.wikipedia.org/wiki/Gaza_Strip',
]

export default function TentKutuphane({ tent, resources, locale }: TentKutuphaneProps) {
  const t = useTranslations('tent.kutuphane')
  const tPool = useTranslations('pool')
  const featured = t.raw('featured') as Array<{
    title: string
    author: string
    kind: 'book' | 'doc'
    note: string
  }>
  const steps = t.raw('steps') as string[]

  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15">
          <BookMarked className="h-7 w-7 text-emerald-400" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
            {t('kicker')}
          </span>
          <h1 className="riso-title text-3xl font-black text-flag-white md:text-5xl">
            {name}
          </h1>
        </div>
      </header>

      <div className="mb-10 flex items-center gap-4">
        <TatreezBand count={5} color="#10b981" className="h-3.5 w-32 shrink-0" />
        <p className="max-w-xl text-bone-dim">{desc}</p>
      </div>

      {/* Öne çıkan kaynaklar */}
      <div className="mb-12">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="text-2xl font-bold text-flag-white">{t('featuredTitle')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((f, i) => {
            const isDoc = f.kind === 'doc'
            return (
              <a
                key={i}
                href={FEATURED_URLS[i]}
                target="_blank"
                rel="noreferrer"
                className="dossier-card group flex flex-col rounded-2xl p-5 transition-all hover:border-emerald-400/40 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.6)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                    {isDoc ? <Film className="h-3 w-3" /> : <BookMarked className="h-3 w-3" />}
                    {isDoc ? t('kindDoc') : t('kindBook')}
                  </span>
                  <ExternalLink className="h-4 w-4 text-bone/30 transition-colors group-hover:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold leading-snug text-flag-white">{f.title}</h3>
                <p className="text-sm font-medium text-emerald-300/80">{f.author}</p>
                <p className="mt-2 text-sm leading-relaxed text-bone-dim">{f.note}</p>
              </a>
            )
          })}
        </div>
      </div>

      {/* Topluluk küratörlüğü CTA */}
      <div className="mb-10 rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-8">
        <h2 className="text-xl font-bold text-flag-white">{t('ctaTitle')}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone">{t('ctaBody')}</p>
        <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-emerald-200/80">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      {/* Kaynak havuzu (arama + sekme + oy + öneri) */}
      <ResourcePool
        tentId={tent.id}
        initialResources={resources}
        searchable
        heading={tPool('communityHeading')}
      />
    </section>
  )
}
