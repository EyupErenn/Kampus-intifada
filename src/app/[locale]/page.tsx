import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import AnnouncementTicker from '@/components/AnnouncementTicker'
import Hero from '@/components/Hero'
import TimelineFeed from '@/components/TimelineFeed'
import TentGrid from '@/components/TentGrid'
import ChatWidget from '@/components/ChatWidget'
import { TatreezDivider } from '@/components/motifs/Tatreez'
import { createServerClient } from '@/lib/supabase'
import { FALLBACK_TENTS_LIST } from '@/lib/tents'
import type { Announcement, Tent } from '@/types/database'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('home')

  // Dayanıklı fetch: env/Supabase yoksa bile sayfa fallback'lerle render olur.
  let events: Announcement[] = []
  let acilDuyurular: Announcement[] = []
  let tents: Tent[] = []

  try {
    const supabase = createServerClient()
    const [eventsRes, acilRes, tentsRes] = await Promise.all([
      supabase
        .from('announcements')
        .select('*')
        .eq('category', 'etkinlik')
        .order('title_tr'),
      supabase.from('announcements').select('*').eq('category', 'acil'),
      supabase.from('tents').select('*').order('order_num'),
    ])
    events = (eventsRes.data as Announcement[] | null) ?? []
    acilDuyurular = (acilRes.data as Announcement[] | null) ?? []
    tents = (tentsRes.data as Tent[] | null) ?? []
  } catch {
    // Sessizce fallback'e düş — bileşenler mock/varsayılan içerik gösterir.
  }

  return (
    <>
      <Navbar />
      <AnnouncementTicker announcements={acilDuyurular} locale={locale} />

      <main>
        <Hero />

        {/* Zaman çizelgesi */}
        <div id="program" className="scroll-mt-20">
          <TimelineFeed events={events} locale={locale} />
        </div>

        <TatreezDivider count={14} className="mx-auto max-w-5xl px-6" />

        {/* Çadırlar */}
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <header className="mb-14 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.32em] text-flag-green">
              {t('tentsKicker')}
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-flag-white md:text-5xl">
              {t('tentsTitle')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-bone-dim">
              {t('tentsLead')}
            </p>
          </header>
          <TentGrid
            tents={tents.length > 0 ? tents : FALLBACK_TENTS_LIST}
            locale={locale}
          />
        </section>
      </main>

      <ChatWidget />
    </>
  )
}
