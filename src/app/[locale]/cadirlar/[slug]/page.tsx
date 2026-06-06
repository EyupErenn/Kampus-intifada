import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ResourcePool from '@/components/ResourcePool'
import TentSumud from '@/components/tents/TentSumud'
import TentBoykot from '@/components/tents/TentBoykot'
import TentDarAgaci from '@/components/tents/TentDarAgaci'
import TentSayilarla from '@/components/tents/TentSayilarla'
import TentCocuk from '@/components/tents/TentCocuk'
import TentKutuphane from '@/components/tents/TentKutuphane'
import { createServerClient } from '@/lib/supabase'
import { FALLBACK_TENTS, TENT_SLUGS } from '@/lib/tents'
import { routing } from '@/i18n/routing'
import type { Resource, Tent } from '@/types/database'

export async function generateStaticParams() {
  let slugs: string[] = [...TENT_SLUGS]
  try {
    const supabase = createServerClient()
    const { data } = await supabase.from('tents').select('slug')
    if (data && data.length > 0) {
      slugs = (data as Array<{ slug: string }>).map((t) => t.slug)
    }
  } catch {
    // fallback sabit slug listesi
  }
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  )
}

export default async function TentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  let tent: Tent | null = null
  let resources: Resource[] = []

  try {
    const supabase = createServerClient()
    const { data: tentData } = await supabase
      .from('tents')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    tent = (tentData as Tent | null) ?? null

    if (tent) {
      const { data: resData } = await supabase
        .from('resources')
        .select('*')
        .eq('tent_id', tent.id)
        .eq('is_approved', true)
        .order('votes', { ascending: false })
      resources = (resData as Resource[] | null) ?? []
    }
  } catch {
    // env/Supabase yoksa fallback'e düş
  }

  if (!tent) tent = FALLBACK_TENTS[slug] ?? null
  if (!tent) notFound()

  let content: React.ReactNode
  switch (slug) {
    case 'sumud':
      content = <TentSumud tent={tent} locale={locale} />
      break
    case 'boykot':
      content = <TentBoykot tent={tent} locale={locale} />
      break
    case 'dar-agaci':
      content = <TentDarAgaci tent={tent} locale={locale} />
      break
    case 'sayilarla':
      content = <TentSayilarla tent={tent} locale={locale} />
      break
    case 'cocuk':
      content = <TentCocuk tent={tent} locale={locale} />
      break
    case 'kutuphane':
      content = <TentKutuphane tent={tent} resources={resources} locale={locale} />
      break
    default:
      notFound()
  }

  return (
    <>
      <Navbar />
      {content}
      {/* kutuphane ResourcePool'u kendi içinde render eder */}
      {slug !== 'kutuphane' && (
        <ResourcePool tentId={tent.id} initialResources={resources} />
      )}
    </>
  )
}
