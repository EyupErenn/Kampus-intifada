import { getTranslations } from 'next-intl/server'
import { Brain, Ship } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ChatWidget from '@/components/ChatWidget'
import { TatreezDivider } from '@/components/motifs/Tatreez'
import { Link } from '@/i18n/navigation'

export default async function EtkilesimPage() {
  const t = await getTranslations('etkilesim')

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-24">
        <TatreezDivider count={14} className="mx-auto mb-14 max-w-5xl" />

        <header className="mb-16 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.32em] text-flag-green">
            {t('kicker')}
          </span>
          <h1 className="riso-title mt-3 text-4xl font-black tracking-tight text-flag-white md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-bone-dim">{t('lead')}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Quiz card */}
          <div className="dossier-card group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:border-flag-green/30">
            <div className="halftone pointer-events-none absolute inset-0 opacity-20" />
            <Brain className="mb-5 h-10 w-10 text-flag-green" />
            <span className="stamp mb-4 inline-block bg-flag-green/10 text-flag-green">
              {t('kicker')}
            </span>
            <h2 className="mb-3 text-xl font-black text-flag-white">{t('quiz_title')}</h2>
            <p className="mb-8 text-sm leading-relaxed text-bone-dim">{t('quiz_desc')}</p>
            <Link
              href="/bilgi-yarismasi"
              className="inline-flex items-center gap-2 rounded-xl bg-flag-green px-5 py-3 text-sm font-bold text-ink transition-opacity hover:opacity-90"
            >
              {t('quiz_cta')}
            </Link>
          </div>

          {/* Flotilla card */}
          <div className="dossier-card group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:border-flag-red/30">
            <div className="halftone pointer-events-none absolute inset-0 opacity-20" />
            <Ship className="mb-5 h-10 w-10 text-flag-red" />
            <span className="stamp mb-4 inline-block bg-flag-red/10 text-flag-red">
              {t('kicker')}
            </span>
            <h2 className="mb-3 text-xl font-black text-flag-white">{t('flotilla_title')}</h2>
            <p className="mb-8 text-sm leading-relaxed text-bone-dim">{t('flotilla_desc')}</p>
            <Link
              href="/sumud-filosu"
              className="inline-flex items-center gap-2 rounded-xl bg-flag-red px-5 py-3 text-sm font-bold text-flag-white transition-opacity hover:opacity-90"
            >
              {t('flotilla_cta')}
            </Link>
          </div>
        </div>
      </main>

      <ChatWidget />
    </>
  )
}
