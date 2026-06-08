'use client'

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { SCHEDULE, eventField, type ScheduleEvent } from '@/lib/schedule'
import { riseSettle, staggerContainer } from '@/lib/motion'

interface WeekProgramProps {
  locale: string
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function timeRange(e: ScheduleEvent): string {
  return e.end ? `${e.start}–${e.end}` : e.start
}

export default function WeekProgram({ locale }: WeekProgramProps) {
  const t = useTranslations('timeline')
  const reduce = useReducedMotion()

  // Tarihleri çöz; bugün/yarın'ı gerçek tarihe göre işaretle
  const { days, defaultIndex, today, tomorrow } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const days = SCHEDULE.map((day) => {
      const [y, m, d] = day.date.split('-').map(Number)
      return { ...day, dateObj: new Date(y, m - 1, d), dayNum: d }
    })

    const todayIdx = days.findIndex((d) => sameDay(d.dateObj, today))
    const upcomingIdx = days.findIndex((d) => d.dateObj >= today)
    const defaultIndex = todayIdx >= 0 ? todayIdx : upcomingIdx >= 0 ? upcomingIdx : 0

    return { days, defaultIndex, today, tomorrow }
  }, [])

  const [selected, setSelected] = useState(defaultIndex)

  const tabLabel = (dateObj: Date): string => {
    if (sameDay(dateObj, today)) return t('today')
    if (sameDay(dateObj, tomorrow)) return t('tomorrow')
    return dateObj.toLocaleDateString(locale, { weekday: 'short' })
  }

  const day = days[selected]
  const featured = day.events.find((e) => e.featured && e.image)
  const rest = day.events.filter((e) => e !== featured)

  return (
    <section className="relative mx-auto max-w-4xl px-5 py-24 sm:px-8">
      {/* Başlık */}
      <header className="mb-12">
        <span className="text-xs font-bold uppercase tracking-[0.32em] text-flag-red">
          {t('kicker')}
        </span>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-bone md:text-5xl">
          {t('title')}
        </h2>
        <p className="mt-4 text-sm text-bone-dim">{t('lead')}</p>
      </header>

      {/* Gün seçici tuş takımı */}
      <div
        role="tablist"
        aria-label={t('title')}
        className="mb-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((d, i) => {
          const active = i === selected
          return (
            <button
              key={d.date}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(i)}
              className={`flex shrink-0 cursor-pointer flex-col items-center rounded-2xl border px-4 py-2.5 transition-colors duration-200 ${
                active
                  ? 'border-flag-green bg-flag-green/15 text-bone'
                  : 'border-ink-line text-bone-dim hover:border-bone-dim hover:text-bone'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {tabLabel(d.dateObj)}
              </span>
              <span className="text-lg font-black leading-tight tabular-nums">
                {String(d.dayNum).padStart(2, '0')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Seçili günün akışı — gün değişince crossfade + stagger yeniden oynar */}
      <motion.div
        key={selected}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Öne çıkan banner (posterli etkinlik) */}
        {featured && (
          <div className="dossier-card mb-8 overflow-hidden rounded-3xl sm:grid sm:min-h-[20rem] sm:grid-cols-[0.82fr_1fr]">
            <div className="relative aspect-[4/5] sm:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.image}
                alt={eventField(featured, 'title', locale)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent sm:bg-gradient-to-r" />
            </div>
            <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-flag-green">
                {day.dateObj.toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  weekday: 'long',
                })}
              </span>
              <span
                dir="ltr"
                className="stamp w-fit text-xs tabular-nums text-flag-red"
              >
                {timeRange(featured)}
              </span>
              <h3 className="text-2xl font-black leading-tight text-bone sm:text-3xl">
                {eventField(featured, 'title', locale)}
              </h3>
              {eventField(featured, 'detail', locale) && (
                <p className="text-sm leading-relaxed text-bone-dim">
                  {eventField(featured, 'detail', locale)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Günün diğer etkinlikleri — kompakt zaman çizelgesi */}
        {rest.length > 0 ? (
          <div className="relative">
            <div className="absolute bottom-3 start-[11px] top-3 w-px bg-ink-line" />
            <motion.ol
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {rest.map((e, i) => (
                <motion.li
                  key={`${e.start}-${i}`}
                  variants={riseSettle}
                  className="relative ps-12"
                >
                  <span
                    aria-hidden="true"
                    className="absolute start-[4px] top-[1.15rem] z-10 h-3.5 w-3.5 rounded-full border-2 border-bone-dim bg-ink"
                  />
                  <div className="dossier-card flex items-center gap-4 rounded-2xl p-4">
                    <span
                      dir="ltr"
                      className="stamp shrink-0 text-xs tabular-nums text-flag-red"
                    >
                      {timeRange(e)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold leading-snug text-bone sm:text-lg">
                        {eventField(e, 'title', locale)}
                      </h3>
                      {eventField(e, 'detail', locale) && (
                        <p className="mt-0.5 text-sm text-bone-dim">
                          {eventField(e, 'detail', locale)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        ) : (
          !featured && (
            <p className="py-8 text-center text-sm text-bone-dim">{t('empty')}</p>
          )
        )}
      </motion.div>
    </section>
  )
}
