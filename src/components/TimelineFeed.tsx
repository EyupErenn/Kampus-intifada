'use client'

import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import type { Announcement } from '@/types/database'
import { localized } from '@/types/database'
import { TatreezBand } from '@/components/motifs/Tatreez'
import { riseSettle, staggerContainer } from '@/lib/motion'

interface TimelineFeedProps {
  events: Announcement[]
  locale: string
}

// CRITICAL FALLBACK — Supabase boş dönerse bunlar render edilir. Asla boş kalmaz.
// 001_initial.sql seed verisiyle birebir eşleşir.
const MOCK_EVENTS: Announcement[] = [
  {
    id: 'mock-1',
    title_tr: 'Açılış Töreni',
    title_en: 'Opening Ceremony',
    title_ar: 'حفل الافتتاح',
    content_tr:
      'Saat 10:00 – BTU Kampüsü ana girişinde gerçekleşecek açılış törenine tüm öğrenciler, akademisyenler ve misafirler davetlidir.',
    content_en:
      '10:00 – All students, academics and guests are invited to the opening ceremony at the main entrance of BTU Campus.',
    content_ar:
      'الساعة 10:00 – يُدعى جميع الطلاب والأكاديميين والضيوف لحضور حفل الافتتاح عند المدخل الرئيسي لحرم BTU.',
    image_url:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    event_date: null,
    category: 'etkinlik',
    is_pinned: true,
    created_at: '',
  },
  {
    id: 'mock-2',
    title_tr: 'Kampüs Meydanı Toplanma ve Basın Açıklaması',
    title_en: 'Campus Square Rally & Press Statement',
    title_ar: 'تجمع الساحة وبيان صحفي',
    content_tr:
      'Saat 12:30 – Kampüs meydanındaki kitlesel toplanmada öğrenci temsilcileri ve akademisyenler ortak bir basın açıklaması okuyacak.',
    content_en:
      '12:30 – At the mass gathering in the campus square, student representatives and academics will read a joint press statement.',
    content_ar:
      'الساعة 12:30 – في التجمع الحاشد بساحة الحرم الجامعي، سيقرأ ممثلو الطلاب والأكاديميون بياناً صحفياً مشتركاً.',
    image_url:
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800',
    event_date: null,
    category: 'etkinlik',
    is_pinned: false,
    created_at: '',
  },
  {
    id: 'mock-3',
    title_tr: 'Panel: Akademik Boykot',
    title_en: 'Panel: Academic Boycott',
    title_ar: 'ندوة: المقاطعة الأكاديمية',
    content_tr:
      'Saat 14:00 – Farklı disiplinlerden akademisyenler ve öğrencilerin katılacağı bu panelde akademik boykotun önemi ve pratik uygulamaları tartışılacak.',
    content_en:
      '14:00 – In this panel with academics and students from different disciplines, the importance and practical applications of academic boycott will be discussed.',
    content_ar:
      'الساعة 14:00 – ستناقش هذه الندوة بمشاركة أكاديميين وطلاب من تخصصات مختلفة أهمية المقاطعة الأكاديمية وتطبيقاتها العملية.',
    image_url:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    event_date: null,
    category: 'etkinlik',
    is_pinned: false,
    created_at: '',
  },
  {
    id: 'mock-4',
    title_tr: 'Çocuk Atölyesi',
    title_en: "Children's Workshop",
    title_ar: 'ورشة عمل الأطفال',
    content_tr:
      'Saat 16:00 – Çocuk Çadırı’nda düzenlenecek bu atölyede çocuklar resim, şiir ve hikaye anlatımı yoluyla duygularını ifade edebilecek.',
    content_en:
      "16:00 – In this workshop at the Children's Tent, children will express their feelings through drawing, poetry and storytelling.",
    content_ar:
      'الساعة 16:00 – في هذه الورشة بخيمة الأطفال، سيعبّر الأطفال عن مشاعرهم من خلال الرسم والشعر ورواية القصص.',
    image_url:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    event_date: null,
    category: 'etkinlik',
    is_pinned: false,
    created_at: '',
  },
  {
    id: 'mock-5',
    title_tr: 'Kapanış ve Ortak Dua',
    title_en: 'Closing & Collective Prayer',
    title_ar: 'الختام والصلاة الجماعية',
    content_tr:
      'Saat 18:00 – Etkinliğin kapanış oturumunda tüm katılımcılar bir araya gelerek Gazzeli kardeşlerimiz için ortak bir dua gerçekleştirecek.',
    content_en:
      '18:00 – In the closing session, all participants will come together for a collective prayer for our brothers and sisters in Gaza.',
    content_ar:
      'الساعة 18:00 – في الجلسة الختامية، سيجتمع جميع المشاركين لأداء صلاة جماعية من أجل إخوتنا في غزة.',
    image_url:
      'https://images.unsplash.com/photo-1609873814058-a8928924184a?w=800',
    event_date: null,
    category: 'etkinlik',
    is_pinned: false,
    created_at: '',
  },
]

function extractTime(event: Announcement, locale: string): string | null {
  const content = localized(event, 'content', locale)
  const match = content.match(/(\d{1,2}:\d{2})/)
  return match ? match[1] : null
}

function cleanContent(event: Announcement, locale: string): string {
  // "Saat 10:00 – …" gibi baştaki saat ön ekini kaldır, gövde metnini bırak.
  const content = localized(event, 'content', locale)
  return content.replace(/^[^–\-]*[–-]\s*/, '').trim()
}

export default function TimelineFeed({ events, locale }: TimelineFeedProps) {
  const t = useTranslations('timeline')
  const reduce = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const displayEvents = events && events.length > 0 ? events : MOCK_EVENTS

  // Eksen dolgusu — scroll ilerlemesine bağlı (kırmızı→yeşil).
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.35', 'end 0.65'],
  })
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 22 })

  return (
    <section className="relative mx-auto max-w-4xl px-5 py-24 sm:px-8">
      {/* Başlık */}
      <header className="mb-16">
        <span className="text-xs font-bold uppercase tracking-[0.32em] text-flag-red">
          {t('kicker')}
        </span>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-flag-white md:text-5xl">
          {t('title')}
        </h2>
        <div className="mt-5 flex items-center gap-4">
          <TatreezBand count={5} className="h-3.5 w-36 shrink-0" />
          <p className="text-sm text-bone-dim">{t('lead')}</p>
        </div>
      </header>

      <div ref={containerRef} className="relative">
        {/* Eksen — sönük taban çizgisi */}
        <div className="absolute bottom-2 start-[11px] top-2 w-px bg-ink-line" />
        {/* Eksen — ilerleme dolgusu */}
        <motion.div
          style={{ scaleY: fill }}
          className="absolute bottom-2 start-[11px] top-2 w-px origin-top"
          aria-hidden="true"
        >
          <div
            className="h-full w-full"
            style={{
              background: 'linear-gradient(to bottom, #e4312b, #1f9e57)',
            }}
          />
        </motion.div>

        <motion.ol
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="space-y-3"
        >
          {displayEvents.map((event, index) => {
            const time = extractTime(event, locale)
            const title = localized(event, 'title', locale)
            const body = cleanContent(event, locale)
            const image = event.image_url ?? ''
            const isOpen = openId === event.id

            return (
              <motion.li
                key={event.id}
                variants={riseSettle}
                className="relative ps-12"
              >
                {/* Eksen düğümü */}
                <span
                  aria-hidden="true"
                  className={`absolute start-[4px] top-5 z-10 h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${
                    isOpen
                      ? 'timeline-node border-flag-red bg-flag-red'
                      : 'border-bone-dim bg-ink'
                  }`}
                />

                {/* Kart — tıklanabilir dosya girişi */}
                <div className="dossier-card overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : event.id)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-bone/[0.03]"
                  >
                    {/* İndeks numarası */}
                    <span className="hidden shrink-0 font-black tabular-nums text-2xl leading-none text-ink-line sm:block">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Saat damgası */}
                    {time && (
                      <span className="stamp shrink-0 text-flag-red text-xs tabular-nums">
                        {time}
                      </span>
                    )}

                    {/* Başlık */}
                    <h3 className="flex-1 text-base font-bold leading-snug text-flag-white sm:text-lg">
                      {title}
                    </h3>

                    {/* Aç/kapa */}
                    <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-bone-dim">
                      <span className="hidden sm:inline">
                        {isOpen ? t('collapse') : t('expand')}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-flag-red' : ''
                        }`}
                      />
                    </span>
                  </button>

                  {/* Genişleyen içerik */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-5 border-t border-ink-line p-4 sm:grid-cols-[1.1fr_1fr] sm:p-5">
                          {image && (
                            <div className="relative overflow-hidden rounded-xl">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={image}
                                alt={title}
                                className="h-48 w-full object-cover sm:h-full"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                            </div>
                          )}
                          <div className="flex flex-col justify-center">
                            <p className="text-[15px] leading-relaxed text-bone-dim">
                              {body}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            )
          })}
        </motion.ol>
      </div>
    </section>
  )
}
