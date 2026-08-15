'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import DotMapBackground from '@/components/DotMapBackground'

/* ============================================================
   HERO — Kampüs İntifada UX/UI Manifestosu
   • Leyl Lacivert (#0F1923) zemin
   • Nokta-matris dünya haritası (canvas)
   • Kriz bölgeleri: Nar Kırmızısı (#D94040) pulse
   • Plus Jakarta Sans başlık, JetBrains Mono sayaçlar
   • Glassmorphism istatistik kartları
   • Çift CTA butonu
   ============================================================ */

type StatKey = 'statShahid' | 'statVolunteer' | 'statProject'

// İstatistik kartları
const STATS: Array<{
  key: string
  tKey: StatKey
  defaultLabel: string
  target: number
  suffix: string
}> = [
  { key: 'shahid',    tKey: 'statShahid',    defaultLabel: 'Şehit',    target: 57000,  suffix: '+' },
  { key: 'volunteer', tKey: 'statVolunteer', defaultLabel: 'Gönüllü',  target: 1240,   suffix: '' },
  { key: 'project',   tKey: 'statProject',   defaultLabel: 'Proje',    target: 38,     suffix: '' },
]

/* Count-up hook — IntersectionObserver ile görünüme girince başlar */
function useCountUp(target: number, duration = 2200, start = false) {
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!start || startedRef.current) return
    startedRef.current = true
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setValue(Math.round(target * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [start, target, duration])

  return value
}

/* Tek istatistik kartı */
function StatCard({
  label,
  target,
  suffix,
  visible,
}: {
  label: string
  target: number
  suffix: string
  visible: boolean
}) {
  const count = useCountUp(target, 2200, visible)

  // Sayıyı Türkçe formatla (binlik nokta ayraç)
  const formatted = count.toLocaleString('tr-TR')

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-1.5 rounded-xl px-6 py-5 sm:px-8"
      style={{
        background: 'rgba(15, 25, 35, 0.65)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <span
        className="text-[clamp(1.6rem,4.5vw,2.4rem)] font-bold leading-none tracking-tight text-white"
        style={{ fontFamily: '"JetBrains Mono", "Courier New", monospace' }}
      >
        {formatted}{suffix}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/50">
        {label}
      </span>
    </motion.div>
  )
}

export default function Hero() {
  const t = useTranslations('hero')
  const reduce = useReducedMotion()

  // Scroll-based metin solma
  const p = useMotionValue(0)
  useEffect(() => {
    if (reduce) return
    const onScroll = () => {
      const v = window.innerHeight || 1
      p.set(Math.min(1, Math.max(0, window.scrollY / (v * 0.7))))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  const textOpacity = useTransform(p, [0, 0.8], [1, 0])
  const textY = useTransform(p, [0, 0.8], [0, -40])

  // Sayaçlar için görünürlük takibi
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0F1923' }}
    >
      {/* ── Nokta-Matris Dünya Haritası ── */}
      <DotMapBackground className="opacity-90" />

      {/* ── Radyal vignette — okunurluk için merkez karartma ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(55% 60% at 50% 50%, rgba(15,25,35,0.72) 0%, rgba(15,25,35,0.45) 55%, transparent 85%)',
        }}
      />

      {/* ── Alt soluk gradient bant ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40"
        style={{
          background: 'linear-gradient(to top, #0F1923 0%, transparent 100%)',
        }}
      />

      {/* ── Merkez içerik ── */}
      <motion.div
        style={reduce ? undefined : { opacity: textOpacity, y: textY }}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-5 text-center"
      >
        {/* Üst etiket */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 flex items-center gap-3"
        >
          {/* Canlı indicator */}
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: '#D94040' }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: '#D94040' }}
            />
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: 'rgba(255,255,255,0.48)' }}
          >
            BTU Kampüsü · Farkındalık Hareketi
          </span>
        </motion.div>

        {/* Ana Başlık — Plus Jakarta Sans, mixed-case */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="font-black leading-[0.92] tracking-tight text-white"
          style={{
            fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
            fontSize: 'clamp(2.8rem, 10vw, 6.5rem)',
            textShadow: '0 2px 48px rgba(0,0,0,0.6)',
          }}
        >
          Kampüs İntifada
        </motion.h1>

        {/* Alt başlık — vicdan · hafıza · aksiyon */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-base font-semibold tracking-[0.22em] sm:text-lg"
          style={{
            fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
            color: 'rgba(255,255,255,0.52)',
          }}
        >
          {t('tagline')}
        </motion.p>

        {/* ── Glassmorphism İstatistik Kartları ── */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {STATS.map((s) => (
            <StatCard
              key={s.key}
              label={t(s.tKey)}
              target={s.target}
              suffix={s.suffix}
              visible={statsVisible}
            />
          ))}
        </motion.div>

        {/* ── Çift CTA Butonu ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          {/* Birincil — Nar Kırmızısı */}
          <a
            href="#program"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-7 py-3.5 text-sm font-bold text-white transition-all duration-300"
            style={{
              background: '#D94040',
              boxShadow: '0 4px 20px rgba(217,64,64,0.35)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 32px rgba(217,64,64,0.55), 0 0 0 1px rgba(217,64,64,0.6)'
              el.style.background = '#e84f4f'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.transform = ''
              el.style.boxShadow = '0 4px 20px rgba(217,64,64,0.35)'
              el.style.background = '#D94040'
            }}
          >
            <span className="relative z-10 tracking-wide">{t('actCta') || 'Harekete Geç'}</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </a>

          {/* İkincil — Nûr Turkuaz outline */}
          <a
            href="#cadirlar"
            className="group inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-bold transition-all duration-300"
            style={{
              border: '1.5px solid #16C79A',
              color: '#16C79A',
              background: 'transparent',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.transform = 'translateY(-2px)'
              el.style.background = 'rgba(22,199,154,0.10)'
              el.style.boxShadow = '0 6px 24px rgba(22,199,154,0.20)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.transform = ''
              el.style.background = 'transparent'
              el.style.boxShadow = ''
            }}
          >
            <span className="tracking-wide">{t('statusCta') || 'Durumu Gör'}</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
          </a>
        </motion.div>

        {/* Scroll ipucu */}
        <motion.a
          href="#program"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-16 inline-flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.28)' }}
        >
          <span>{t('scroll')}</span>
          <motion.span
            aria-hidden="true"
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-base"
          >
            ↓
          </motion.span>
        </motion.a>
      </motion.div>
    </section>
  )
}
