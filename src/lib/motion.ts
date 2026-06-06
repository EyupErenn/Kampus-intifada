import type { Variants } from 'framer-motion'

/* ============================================================
   Paylaşılan hareket primitifleri — "Tatreez Arşiv".
   Easing'ler keyframe/CSS ile (globals.css) hizalıdır.
   Bileşenler prefers-reduced-motion'ı useReducedMotion ile yönetir.
   ============================================================ */

export const EASE_STITCH = [0.22, 1, 0.36, 1] as const
export const EASE_INK = [0.65, 0, 0.35, 1] as const

/** Stagger kapsayıcısı — çocukları sırayla tetikler. */
export function staggerContainer(stagger = 0.08, delay = 0): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  }
}

/** Kart/blok — aşağıdan yükselip oturur. */
export const riseSettle: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_STITCH },
  },
}

/** Metin/küçük öğe — yumuşak yukarı belirme. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_STITCH },
  },
}

/** Maske ile satır açılışı (kinetik başlık satırı). */
export const lineReveal: Variants = {
  hidden: { y: '110%' },
  show: {
    y: '0%',
    transition: { duration: 0.7, ease: EASE_STITCH },
  },
}

/** SVG stroke çizimi — nakış ipliği / eksen. */
export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: EASE_INK },
  },
}
