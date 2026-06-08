'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { BookOpen, Anchor, Tent, ArrowRight } from 'lucide-react'
import DisplayCards from '@/components/ui/display-cards'
import { staggerContainer, riseSettle } from '@/lib/motion'

const STACK = [
  '[grid-area:stack] hover:-translate-y-10 grayscale-[60%] hover:grayscale-0 transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-full before:rounded-xl before:bg-ink/40 before:content-[""] hover:before:opacity-0 before:transition-opacity before:duration-700',
  '[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 grayscale-[60%] hover:grayscale-0 transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-full before:rounded-xl before:bg-ink/40 before:content-[""] hover:before:opacity-0 before:transition-opacity before:duration-700',
  '[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 transition-all',
]

export default function FeaturedDeck() {
  const t = useTranslations('featured')

  const cards = [
    {
      icon: <BookOpen className="size-4 text-flag-green" />,
      title: t('cards.quiz.title'),
      description: t('cards.quiz.desc'),
      date: t('cards.quiz.tag'),
      titleClassName: 'text-flag-green',
      className: STACK[0],
    },
    {
      icon: <Anchor className="size-4 text-flag-red" />,
      title: t('cards.flotilla.title'),
      description: t('cards.flotilla.desc'),
      date: t('cards.flotilla.tag'),
      titleClassName: 'text-flag-red',
      className: STACK[1],
    },
    {
      icon: <Tent className="size-4 text-flag-green" />,
      title: t('cards.archive.title'),
      description: t('cards.archive.desc'),
      date: t('cards.archive.tag'),
      titleClassName: 'text-flag-green',
      className: STACK[2],
    },
  ]

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="grid items-center gap-12 md:grid-cols-2"
      >
        {/* Metin */}
        <motion.div variants={riseSettle}>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-flag-red">
            {t('kicker')}
          </span>
          <h2 className="riso-title mt-3 text-4xl font-black tracking-tight text-bone md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-bone-dim">
            {t('lead')}
          </p>
          <Link
            href="/etkilesim"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-flag-red px-5 py-3 text-sm font-bold text-flag-white transition-opacity hover:opacity-90"
          >
            {t('cta')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </Link>
        </motion.div>

        {/* Deck */}
        <motion.div
          variants={riseSettle}
          className="flex min-h-[22rem] items-center justify-center"
        >
          <DisplayCards cards={cards} />
        </motion.div>
      </motion.div>
    </section>
  )
}
