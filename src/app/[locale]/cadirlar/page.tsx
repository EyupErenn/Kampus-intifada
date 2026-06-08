import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import TentGrid from '@/components/TentGrid'
import ChatWidget from '@/components/ChatWidget'
import { TatreezDivider } from '@/components/motifs/Tatreez'
import { createServerClient } from '@/lib/supabase'
import { FALLBACK_TENTS_LIST } from '@/lib/tents'
import type { Tent } from '@/types/database'

export default async function TentsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('home')

  // Dayanıklı fetch: env/Supabase yoksa bile fallback ile dolu render olur.
  let tents: Tent[] = []
  try {
    const supabase = createServerClient()
    const { data } = await supabase.from('tents').select('*').order('order_num')
    tents = (data as Tent[] | null) ?? []
  } catch {
    // sessizce fallback'e düş
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <TatreezDivider count={14} className="mx-auto mb-14 max-w-5xl" />

        <header className="mb-14 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.32em] text-flag-green">
            {t('tentsKicker')}
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-bone md:text-5xl">
            {t('tentsTitle')}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-bone-dim">
            {t('tentsLead')}
          </p>
        </header>

        <TentGrid
          tents={tents.length > 0 ? tents : FALLBACK_TENTS_LIST}
          locale={locale}
        />
      </main>

      <ChatWidget />
    </>
  )
}
