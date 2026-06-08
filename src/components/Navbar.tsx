'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { createBrowserClient } from '@/lib/supabase'
import { PalestineFlag } from '@/components/motifs/PalestineFlag'

const LOCALE_LABELS: Record<string, string> = {
  tr: 'TR',
  en: 'EN',
  ar: 'AR',
}

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const [count, setCount] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // live interaction counter — number of comments
  useEffect(() => {
    let active = true
    const supabase = createBrowserClient()
    supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .then(({ count: c, error }) => {
        if (active && !error) setCount(c ?? 0)
      })
    return () => {
      active = false
    }
  }, [])

  const switchLocale = (next: string) => {
    if (next === locale) return
    router.replace(pathname, { locale: next })
  }

  const links = [
    { href: '/', label: t('home') },
    { href: '/cadirlar', label: t('tents') },
    { href: '/etkilesim', label: t('interactionsPage') },
  ] as const

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <PalestineFlag
            size={30}
            className="shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
          />
          <span className="text-lg font-bold tracking-tight text-bone">
            Campus İntifada
          </span>
        </Link>

        {/* Center nav links (desktop) */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-bone-dim transition-colors hover:text-bone"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Language switcher */}
          <div className="flex items-center gap-1 rounded-full border border-ink-line p-1">
            {routing.locales.map((loc) => {
              const isActive = loc === locale
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => switchLocale(loc)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-flag-red text-flag-white'
                      : 'text-bone-dim hover:text-bone'
                  }`}
                >
                  {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
                </button>
              )
            })}
          </div>

          {/* Live interaction counter */}
          {count !== null && (
            <div className="hidden items-center gap-2 text-sm text-bone-dim sm:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flag-green opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-flag-green" />
              </span>
              <span className="tabular-nums">
                {count} {t('interactions')}
              </span>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="text-bone md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-ink-line bg-ink/95 md:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-bone-dim transition-colors hover:bg-bone/5 hover:text-bone"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {count !== null && (
                <li className="flex items-center gap-2 px-3 py-2 text-sm text-bone-dim">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flag-green opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-flag-green" />
                  </span>
                  <span className="tabular-nums">
                    {count} {t('interactions')}
                  </span>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
