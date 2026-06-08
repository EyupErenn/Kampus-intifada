'use client'

import { useTranslations } from 'next-intl'
import { ArrowRight, Home } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Navbar from '@/components/Navbar'
import { TatreezStar } from '@/components/motifs/Tatreez'

export default function NotFound() {
  const t = useTranslations('notFound')

  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <TatreezStar size={48} color="var(--color-flag-red)" className="mb-8 opacity-80" />

        <span className="font-black tabular-nums text-6xl tracking-tighter text-flag-red md:text-7xl">
          {t('code')}
        </span>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-bone md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-bone-dim">
          {t('message')}
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-flag-red px-5 py-2.5 text-sm font-semibold text-flag-white transition hover:brightness-110"
          >
            <Home className="h-4 w-4" />
            {t('home')}
          </Link>
          <Link
            href="/cadirlar"
            className="inline-flex items-center gap-2 rounded-full border border-ink-line px-5 py-2.5 text-sm font-semibold text-bone-dim transition hover:text-bone"
          >
            {t('tents')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </>
  )
}
