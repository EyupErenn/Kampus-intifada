import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Noto_Sans, Noto_Sans_Arabic, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import GlobeMount from '@/components/globe/GlobeMount'
import FlagWatermark from '@/components/globe/FlagWatermark'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kampus-intifada-rosy.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
}

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const fontVars = `${notoSans.variable} ${notoSansArabic.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`
  const fontClass = locale === 'ar' ? notoSansArabic.className : notoSans.className

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={fontVars}
    >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`min-h-screen text-bone ${fontClass}`}>
        <GlobeMount />
        <FlagWatermark />
        <NextIntlClientProvider locale={locale}>
          <div className="relative z-10">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
