'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Ship, ChevronRight, Home, Compass, BookOpen } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { fadeUp, riseSettle, staggerContainer } from '@/lib/motion'

interface Phase {
  title: string
  desc: string
  fact: string
}

type SimPhase = 'setup' | number | 'epilogue'

const PHASE_ICONS = [Ship, Compass, Compass, Ship, BookOpen]

export default function SumudFilosu() {
  const t = useTranslations('flotilla')
  const phases = t.raw('phases') as Phase[]

  const [simPhase, setSimPhase] = useState<SimPhase>('setup')
  const [shipName, setShipName] = useState('')
  const [cargo, setCargo] = useState('')

  const cargoOptions = [
    { value: 'medicine', label: t('cargo_medicine') },
    { value: 'food', label: t('cargo_food') },
    { value: 'shelter', label: t('cargo_shelter') },
    { value: 'water', label: t('cargo_water') },
  ]

  function handleBegin() {
    if (!shipName.trim() || !cargo) return
    setSimPhase(0)
  }

  function handleNext() {
    if (typeof simPhase === 'number') {
      if (simPhase < phases.length - 1) {
        setSimPhase(simPhase + 1)
      } else {
        setSimPhase('epilogue')
      }
    }
  }

  const currentPhaseData = typeof simPhase === 'number' ? phases[simPhase] : null
  const PhaseIcon = typeof simPhase === 'number' ? PHASE_ICONS[simPhase] : Ship

  /* ─── Setup ─── */
  if (simPhase === 'setup') {
    return (
      <motion.div
        variants={staggerContainer(0.1, 0.05)}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-xl px-4 py-4"
      >
        <motion.div variants={riseSettle} className="dossier-card rounded-2xl p-6">
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-bone-dim">
              {t('ship_name_label')}
            </label>
            <input
              type="text"
              value={shipName}
              onChange={(e) => setShipName(e.target.value.slice(0, 30))}
              placeholder={t('ship_name_placeholder')}
              className="w-full rounded-lg border border-bone/15 bg-ink px-4 py-3 text-sm text-flag-white placeholder-bone/30 outline-none transition-colors focus:border-flag-green/50"
            />
          </div>

          <div className="mb-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-bone-dim">
              {t('cargo_label')}
            </p>
            <div className="flex flex-col gap-2">
              {cargoOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all ${
                    cargo === opt.value
                      ? 'border-flag-green/50 bg-flag-green/10 text-flag-white'
                      : 'border-bone/15 bg-ink-raised/40 text-bone-dim hover:border-bone/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="cargo"
                    value={opt.value}
                    checked={cargo === opt.value}
                    onChange={() => setCargo(opt.value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${cargo === opt.value ? 'border-flag-green bg-flag-green' : 'border-bone/30'}`}
                  >
                    {cargo === opt.value && (
                      <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                    )}
                  </span>
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleBegin}
            disabled={!shipName.trim() || !cargo}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-flag-red px-6 py-4 text-sm font-bold text-flag-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Ship className="h-4 w-4" />
            {t('begin')}
          </button>
        </motion.div>
      </motion.div>
    )
  }

  /* ─── Epilogue ─── */
  if (simPhase === 'epilogue') {
    return (
      <motion.div
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-xl px-4 py-16 text-center"
      >
        <motion.div variants={riseSettle} className="mb-10">
          <BookOpen className="mx-auto mb-4 h-14 w-14 text-flag-green" />
          <h2 className="riso-title mb-4 text-2xl font-black text-flag-white">
            {t('epilogue_title')}
          </h2>
          <p className="leading-relaxed text-bone-dim">{t('epilogue')}</p>
        </motion.div>

        <motion.div
          variants={riseSettle}
          className="mb-8 rounded-xl border border-bone/10 bg-ink-raised/40 px-5 py-4 text-left text-sm text-bone-dim"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-flag-green">
            {t('ship_label')}:
          </span>{' '}
          <span className="text-flag-white">{shipName}</span>
          <span className="mx-2 text-bone/30">·</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-flag-green">
            {t('cargo_label_short')}:
          </span>{' '}
          <span className="text-flag-white">
            {cargoOptions.find((o) => o.value === cargo)?.label}
          </span>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-bone/20 px-6 py-3 text-sm font-semibold text-bone-dim transition-colors hover:border-flag-red/40 hover:text-flag-white"
          >
            <Home className="h-4 w-4" />
            {t('home')}
          </Link>
          <Link
            href="/cadirlar"
            className="inline-flex items-center gap-2 rounded-xl bg-flag-red px-6 py-3 text-sm font-bold text-flag-white transition-opacity hover:opacity-90"
          >
            {t('tents')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  /* ─── Phase ─── */
  if (!currentPhaseData) return null
  const phaseNum = simPhase as number

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {/* Phase progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-bone-dim">
          <span>{t('phase_label', { n: phaseNum + 1 })}</span>
          <span className="text-bone/40">{shipName}</span>
        </div>
        <div className="flex gap-1.5">
          {phases.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= phaseNum ? 'bg-flag-green' : 'bg-bone/10'}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phaseNum}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
        >
          {/* Phase header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-raised border border-bone/10">
              <PhaseIcon className="h-5 w-5 text-flag-green" />
            </div>
            <div>
              <p className="stamp mb-1 inline-block bg-flag-green/10 text-flag-green text-xs">
                {t('phase_label', { n: phaseNum + 1 })}
              </p>
              <h2 className="text-xl font-black text-flag-white">{currentPhaseData.title}</h2>
            </div>
          </div>

          {/* Description */}
          <div className="dossier-card mb-5 rounded-xl p-5">
            <p className="leading-relaxed text-bone-dim">{currentPhaseData.desc}</p>
          </div>

          {/* Fact */}
          <div className="mb-8 rounded-xl border border-flag-green/20 bg-flag-green/5 p-5">
            <p className="stamp mb-2 inline-block bg-flag-green/10 text-flag-green text-xs">
              {t('fact_label')}
            </p>
            <p className="text-sm leading-relaxed text-bone-dim">{currentPhaseData.fact}</p>
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
      </AnimatePresence>
    </div>
  )
}
