'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react'
import { fadeUp, riseSettle, staggerContainer } from '@/lib/motion'
import { rankIndex } from '@/lib/quiz'
import ShareActions from './ShareActions'

// Correct answer index (0-based) for each question — matches the order in messages quiz.questions
const CORRECT = [2, 1, 1, 1, 1, 2, 2, 1, 2, 2] as const

interface QuizQuestion {
  q: string
  opts: string[]
  note: string
}

type Phase = 'question' | 'explanation' | 'result'

export default function QuizModule() {
  const t = useTranslations('quiz')
  const locale = useLocale()
  const questions = t.raw('questions') as QuizQuestion[]
  const ranks = t.raw('ranks') as string[]
  const rankDescs = t.raw('rank_descs') as string[]

  const [qIndex, setQIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('question')
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const total = questions.length
  const current = questions[qIndex]
  const correct = CORRECT[qIndex]

  function handleSelect(idx: number) {
    if (phase !== 'question') return
    setSelected(idx)
    if (idx === correct) setScore((s) => s + 1)
    setPhase('explanation')
  }

  function handleNext() {
    if (qIndex < total - 1) {
      setQIndex((i) => i + 1)
      setSelected(null)
      setPhase('question')
    } else {
      setPhase('result')
    }
  }

  function handleRetry() {
    setQIndex(0)
    setSelected(null)
    setScore(0)
    setPhase('question')
  }

  const rank = rankIndex(score)

  if (phase === 'result') {
    return (
      <motion.div
        variants={staggerContainer(0.1, 0.1)}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-2xl px-4 py-16 text-center"
      >
        <motion.div variants={riseSettle} className="mb-8">
          <Award className="mx-auto mb-4 h-16 w-16 text-flag-green" />
          <p className="stamp mb-3 inline-block bg-flag-green/10 text-flag-green">
            {t('result_title')}
          </p>
          <p className="mt-2 text-5xl font-black text-flag-white">
            {score} <span className="text-bone-dim text-3xl">/ {total}</span>
          </p>
        </motion.div>

        <motion.div variants={riseSettle} className="dossier-card mb-8 rounded-2xl p-8">
          <h2 className="riso-title mb-2 text-2xl font-black text-flag-white">{ranks[rank]}</h2>
          <p className="text-bone-dim leading-relaxed">{rankDescs[rank]}</p>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-6">
          <ShareActions
            sharePath={`/${locale}/sonuc?m=quiz&s=${score}`}
            downloadUrl={`/api/og?m=quiz&s=${score}&l=${locale}`}
            shareTitle={t('title')}
            shareText={`${score}/${total} — ${ranks[rank]}`}
            shareLabel={t('share')}
            downloadLabel={t('download')}
          />
        </motion.div>

        <motion.button
          variants={fadeUp}
          onClick={handleRetry}
          className="inline-flex items-center gap-2 rounded-full border border-bone/20 px-6 py-3 text-sm font-semibold text-bone-dim transition-colors hover:border-flag-red/50 hover:text-flag-white"
        >
          <RotateCcw className="h-4 w-4" />
          {t('retry')}
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-bone-dim">
          <span>{t('question_of', { current: qIndex + 1, total })}</span>
          <span className="tabular-nums">{score} ✓</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-bone/10">
          <motion.div
            className="h-full rounded-full bg-flag-green"
            animate={{ width: `${((qIndex + (phase === 'explanation' ? 1 : 0)) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
        >
          <h2 className="mb-8 text-xl font-bold leading-snug text-flag-white md:text-2xl">
            {current.q}
          </h2>

          {/* Options */}
          <ul className="mb-6 flex flex-col gap-3">
            {current.opts.map((opt, idx) => {
              const isSelected = selected === idx
              const isCorrect = idx === correct
              const revealed = phase === 'explanation'

              let borderClass = 'border-bone/15 hover:border-bone/40'
              let bgClass = 'bg-ink-raised/60'
              let textClass = 'text-bone-dim'

              if (revealed) {
                if (isCorrect) {
                  borderClass = 'border-flag-green/60'
                  bgClass = 'bg-flag-green/10'
                  textClass = 'text-flag-white'
                } else if (isSelected && !isCorrect) {
                  borderClass = 'border-flag-red/60'
                  bgClass = 'bg-flag-red/10'
                  textClass = 'text-bone-dim'
                }
              }

              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => handleSelect(idx)}
                    disabled={revealed}
                    className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200 ${borderClass} ${bgClass} ${textClass} ${!revealed ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isCorrect && (
                      <CheckCircle className="h-5 w-5 shrink-0 text-flag-green" />
                    )}
                    {revealed && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 shrink-0 text-flag-red" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Explanation */}
          <AnimatePresence>
            {phase === 'explanation' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="dossier-card mb-6 rounded-xl p-5">
                  <p className="stamp mb-3 inline-block bg-flag-green/10 text-xs text-flag-green">
                    {t('explanation_label')}
                  </p>
                  <p className="text-sm leading-relaxed text-bone-dim">{current.note}</p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-flag-red px-6 py-4 text-sm font-bold text-flag-white transition-opacity hover:opacity-90"
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
