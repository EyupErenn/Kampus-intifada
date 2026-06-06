'use client'

import { BookMarked, ExternalLink, Film, Sparkles } from 'lucide-react'
import type { Resource, Tent } from '@/types/database'
import { localized } from '@/types/database'
import ResourcePool from '@/components/ResourcePool'

interface TentKutuphaneProps {
  tent: Tent
  resources: Resource[]
  locale: string
}

interface Featured {
  title: string
  author: string
  kind: 'Kitap' | 'Belgesel'
  url: string
  note: string
}

const FEATURED: Featured[] = [
  {
    title: 'The Question of Palestine',
    author: 'Edward Said',
    kind: 'Kitap',
    url: 'https://en.wikipedia.org/wiki/The_Question_of_Palestine',
    note: 'Filistin meselesini entelektüel ve tarihsel bağlamıyla ele alan temel başvuru eseri.',
  },
  {
    title: 'The Hundred Years’ War on Palestine',
    author: 'Rashid Khalidi',
    kind: 'Kitap',
    url: 'https://en.wikipedia.org/wiki/The_Hundred_Years%27_War_on_Palestine',
    note: 'Bir asırlık sömürgecilik ve direnişin belgelere dayalı kapsamlı anlatısı.',
  },
  {
    title: 'Gazze: Kıyıdaki Hayatlar',
    author: 'Belgesel',
    kind: 'Belgesel',
    url: 'https://en.wikipedia.org/wiki/Gaza_Strip',
    note: 'Ablukada gündelik hayatın ve direngenliğin (sumud) sinematik tanıklığı.',
  },
]

export default function TentKutuphane({ tent, resources, locale }: TentKutuphaneProps) {
  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15">
          <BookMarked className="h-7 w-7 text-emerald-400" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
            Kütüphane
          </span>
          <h1 className="text-3xl font-black text-white md:text-4xl">{name}</h1>
        </div>
      </header>

      <p className="mb-10 max-w-xl text-slate-400">{desc}</p>

      {/* Öne çıkan kaynaklar */}
      <div className="mb-12">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Öne Çıkanlar</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURED.map((f) => (
            <a
              key={f.title}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex flex-col rounded-2xl p-5 transition-all hover:border-emerald-400/40 hover:shadow-[0_0_30px_-10px_rgba(16,163,74,0.6)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                  {f.kind === 'Belgesel' ? (
                    <Film className="h-3 w-3" />
                  ) : (
                    <BookMarked className="h-3 w-3" />
                  )}
                  {f.kind}
                </span>
                <ExternalLink className="h-4 w-4 text-white/30 transition-colors group-hover:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold leading-snug text-white">{f.title}</h3>
              <p className="text-sm font-medium text-emerald-300/80">{f.author}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.note}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Topluluk küratörlüğü CTA */}
      <div className="mb-10 rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-8">
        <h2 className="text-xl font-bold text-white">Kaynak Havuzunu Birlikte Büyütüyoruz</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
          Kütüphane topluluk küratörlüğüyle gelişir. Önerdiğin her kaynak (video, makale,
          kitap, infografik) önce gönüllü ekip tarafından incelenir, ardından yayına alınır.
          Aşağıdan kaynağını öner, en faydalı bulduklarını oyla.
        </p>
        <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-emerald-200/80">
          <li>1. Öner</li>
          <li>2. İncele &amp; onayla</li>
          <li>3. Yayınla &amp; oyla</li>
        </ol>
      </div>

      {/* Kaynak havuzu (arama + sekme + oy + öneri) */}
      <ResourcePool
        tentId={tent.id}
        initialResources={resources}
        searchable
        heading="Topluluk Kaynakları"
      />
    </section>
  )
}
