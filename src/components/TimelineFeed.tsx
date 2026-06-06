'use client'

import { motion } from 'framer-motion'
import type { Announcement } from '@/types/database'
import { localized } from '@/types/database'

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
  const displayEvents = events && events.length > 0 ? events : MOCK_EVENTS

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <div className="mb-16 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-green">
          Program
        </span>
        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
          Gün Boyunca
        </h2>
      </div>

      <div className="relative">
        {/* Dikey eksen — kırmızıdan yeşile gradient */}
        <div
          className="absolute left-4 top-0 h-full w-[3px] -translate-x-1/2 rounded-full md:left-1/2"
          style={{
            background:
              'linear-gradient(to bottom, #dc2626, #16a34a)',
          }}
        />

        <div className="space-y-12 md:space-y-0">
          {displayEvents.map((event, index) => {
            const isLeft = index % 2 === 0
            const time = extractTime(event, locale)
            const title = localized(event, 'title', locale)
            const body = cleanContent(event, locale)
            const image = event.image_url ?? ''

            return (
              <div
                key={event.id}
                className={`relative flex w-full md:min-h-[300px] ${
                  isLeft ? 'md:justify-start' : 'md:justify-end'
                }`}
              >
                {/* Eksen düğümü — parlayan pulsing daire */}
                <span className="timeline-node absolute left-4 top-6 z-10 h-4 w-4 -translate-x-1/2 rounded-full bg-brand-red md:left-1/2" />

                {/* Kart */}
                <motion.article
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="glass-card group ml-12 w-[calc(100%-3rem)] overflow-hidden rounded-2xl md:ml-0 md:w-[45%]"
                >
                  {/* Üst %55 — görsel */}
                  <div className="relative h-44 overflow-hidden sm:h-52">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  </div>

                  {/* Alt %45 — metin */}
                  <div className="p-5">
                    {time && (
                      <span className="mb-2 inline-block rounded-md bg-brand-red/15 px-2.5 py-1 font-mono text-sm font-semibold text-brand-red">
                        {time}
                      </span>
                    )}
                    <h3 className="text-lg font-bold leading-snug text-white">
                      {title}
                    </h3>
                    {body && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">
                        {body}
                      </p>
                    )}
                  </div>
                </motion.article>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
