import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import AnnouncementTicker from '@/components/AnnouncementTicker'
import TimelineFeed from '@/components/TimelineFeed'
import TentGrid from '@/components/TentGrid'
import ChatWidget from '@/components/ChatWidget'
import { createServerClient } from '@/lib/supabase'
import type { Announcement, Tent } from '@/types/database'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('hero')

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
        {/* Hero */}
        <section className="grain relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
          {/* Atmosfer: kırmızı-yeşil radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 0%, rgba(220,38,38,0.18), transparent 70%), radial-gradient(50% 50% at 50% 100%, rgba(22,163,74,0.12), transparent 70%)',
            }}
          />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-4 py-1 text-sm text-brand-red">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-red" />
              {t('subtitle')}
            </div>
            <h1 className="mb-4 text-6xl font-black tracking-tight text-white md:text-8xl">
              {t('title')}
            </h1>
            <p className="mx-auto max-w-lg text-xl text-slate-400">
              {t('description')}
            </p>
          </div>
        </section>

        {/* Zaman çizelgesi */}
        <TimelineFeed events={events} locale={locale} />

        {/* Çadırlar */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            Çadırlar
          </h2>
          <TentGrid tents={tents} locale={locale} />
        </section>
      </main>

      <ChatWidget />
    </>
  )
}
