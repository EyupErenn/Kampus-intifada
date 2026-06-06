'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import type { Tent } from '@/types/database'
import { localized } from '@/types/database'
import CommentWall from '@/components/CommentWall'

interface TentSumudProps {
  tent: Tent
  locale: string
}

const MEMORY = [
  {
    year: '2010',
    title: 'Mavi Marmara',
    img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400',
    desc: 'Gazze ablukasını delmek için yola çıkan Özgürlük Filosu’na yapılan saldırı dünya vicdanında derin iz bıraktı. Dayanışmanın bedeli ağırdı ama hafıza kalıcı oldu.',
  },
  {
    year: '2011–2018',
    title: 'Özgürlük Filosu',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    desc: 'Yıllar boyunca farklı ülkelerden gemiler ablukaya karşı denize açıldı. Her sefer, unutmamanın ve vazgeçmemenin sessiz bir ilanıydı.',
  },
  {
    year: '2023',
    title: 'Küresel İntifada',
    img: 'https://images.unsplash.com/photo-1609873814058-a8928924184a?w=400',
    desc: 'Dünya kentlerinde milyonlar sokağa indi. Üniversiteler, meydanlar ve kampüsler dayanışmanın yeni merkezleri hâline geldi.',
  },
  {
    year: '2024',
    title: 'Uluslararası Sumud Filosu',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    desc: 'Sumud (direngenlik) ruhuyla yeniden denize açılan filo, ablukaya karşı sivil iradenin kararlılıkla sürdüğünü gösterdi.',
  },
]

const QUOTES = [
  {
    text: 'İklim adaleti; sömürgeciliğe, işgale ve adaletsizliğe karşı mücadeleden ayrı düşünülemez. Filistin halkıyla dayanışma içindeyiz.',
    author: 'Greta Thunberg',
  },
  {
    text: 'Savaşın bedelini her zaman siviller öder. Barış ve adalet için susmak değil, sesimizi yükseltmek zorundayız.',
    author: 'Nina Potarska',
  },
  {
    text: 'Mavi Marmara’da öğrendik: vicdan denizlerin ötesine geçer. Dayanışma bir seçim değil, bir borçtur.',
    author: 'Erdinç Tekir',
  },
  {
    text: 'Filistin meselesi her şeyden önce bir insan hakları meselesidir. Hukuk, ezilenin yanında durmadıkça anlamını yitirir.',
    author: 'Noura Erakat',
  },
]

export default function TentSumud({ tent, locale }: TentSumudProps) {
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const name = localized(tent, 'name', locale)
  const desc = localized(tent, 'desc', locale)

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
          Sumud
        </span>
        <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">{name}</h1>
        <p className="mt-2 max-w-xl text-slate-400">{desc}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* SOL — Hafıza Duvarı */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-5 md:col-span-1">
          {/* Deniz dalgası SVG arka plan */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-15"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern id="sumud-wave" width="60" height="30" patternUnits="userSpaceOnUse">
                <path
                  d="M0 15 Q 15 2 30 15 T 60 15 M0 27 Q 15 14 30 27 T 60 27"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sumud-wave)" />
          </svg>

          <h2 className="relative mb-5 text-lg font-bold text-white">Hafıza Duvarı</h2>
          <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-full before:w-px before:bg-blue-400/30">
            {MEMORY.map((m) => (
              <li key={m.title} className="relative pl-6">
                <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-blue-400 bg-slate-950" />
                <div className="glass-card overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.img} alt={m.title} className="h-24 w-full object-cover" />
                  <div className="p-3">
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-blue-300">
                      {m.year}
                    </span>
                    <h3 className="mt-1.5 font-bold text-white">{m.title}</h3>
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-400">
                      {m.desc}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* SAĞ */}
        <div className="flex flex-col gap-8 md:col-span-2">
          {/* Quote carousel */}
          <div className="relative min-h-[200px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/40 to-slate-900/40 p-8">
            <Quote className="absolute right-6 top-6 h-16 w-16 text-white/5" />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quoteIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <p className="text-xl font-medium italic leading-relaxed text-white md:text-2xl">
                  “{QUOTES[quoteIndex].text}”
                </p>
                <footer className="mt-4 text-sm font-semibold text-blue-300">
                  — {QUOTES[quoteIndex].author}
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            <div className="mt-6 flex gap-1.5">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuoteIndex(i)}
                  aria-label={`Alıntı ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === quoteIndex ? 'w-6 bg-blue-400' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sumud Duvarı — canlı dayanışma */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
            <h2 className="mb-1 text-lg font-bold text-white">Sumud Duvarı</h2>
            <p className="mb-4 text-sm text-slate-400">
              Dayanışma mesajını bırak; duvar canlı olarak güncellenir.
            </p>
            <CommentWall
              tentId={tent.id}
              locale={locale}
              variant="wall"
              maxContent={500}
              placeholder="Dayanışma mesajın..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
