import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, RotateCcw } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ChatWidget from '@/components/ChatWidget'
import { TatreezDivider } from '@/components/motifs/Tatreez'
import { Link } from '@/i18n/navigation'
import ShareActions from '@/components/interactive/ShareActions'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '')
}

function buildOgUrl(sp: Record<string, string | string[] | undefined>, locale: string): string {
  const mode = str(sp.m) === 'flotilla' ? 'flotilla' : 'quiz'
  const params = new URLSearchParams({ m: mode, l: locale })
  if (mode === 'flotilla') {
    params.set('ship', str(sp.ship) || '')
    params.set('cargo', str(sp.cargo) || 'medicine')
  } else {
    params.set('s', str(sp.s) || '0')
  }
  return `/api/og?${params.toString()}`
}

function buildSharePath(sp: Record<string, string | string[] | undefined>, locale: string): string {
  const mode = str(sp.m) === 'flotilla' ? 'flotilla' : 'quiz'
  const params = new URLSearchParams({ m: mode })
  if (mode === 'flotilla') {
    params.set('ship', str(sp.ship) || '')
    params.set('cargo', str(sp.cargo) || 'medicine')
  } else {
    params.set('s', str(sp.s) || '0')
  }
  return `/${locale}/sonuc?${params.toString()}`
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}): Promise<Metadata> {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'sonuc' })
  const ogUrl = buildOgUrl(sp, locale)

  return {
    title: t('title'),
    description: t('lead'),
    openGraph: {
      title: t('title'),
      description: t('lead'),
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('lead'),
      images: [ogUrl],
    },
  }
}

export default async function SonucPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('sonuc')

  const mode = str(sp.m) === 'flotilla' ? 'flotilla' : 'quiz'
  const ogUrl = buildOgUrl(sp, locale)
  const sharePath = buildSharePath(sp, locale)
  const retryHref = mode === 'flotilla' ? '/sumud-filosu' : '/bilgi-yarismasi'

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <TatreezDivider count={10} className="mx-auto mb-10 max-w-lg" />

        <header className="mb-10">
          <h1 className="riso-title text-3xl font-black tracking-tight text-flag-white md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-bone-dim">{t('lead')}</p>
        </header>

        {/* Card preview */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-bone/15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ogUrl} alt={t('title')} width={1200} height={630} className="h-auto w-full" />
        </div>

        <div className="mb-10">
          <ShareActions
            sharePath={sharePath}
            downloadUrl={`${ogUrl}`}
            shareTitle={t('title')}
            shareText={t('lead')}
            shareLabel={t('share')}
            downloadLabel={t('download')}
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-flag-green px-6 py-3 text-sm font-bold text-ink transition-opacity hover:opacity-90"
          >
            {t('explore_cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={retryHref}
            className="inline-flex items-center gap-2 rounded-full border border-bone/20 px-6 py-3 text-sm font-semibold text-bone-dim transition-colors hover:border-flag-red/50 hover:text-flag-white"
          >
            <RotateCcw className="h-4 w-4" />
            {t('retry')}
          </Link>
        </div>
      </main>

      <ChatWidget />
    </>
  )
}
