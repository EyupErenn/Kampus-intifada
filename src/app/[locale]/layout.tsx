import type { ReactNode } from 'react'
import { Noto_Sans, Noto_Sans_Arabic } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

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

  const fontVars = `${notoSans.variable} ${notoSansArabic.variable}`
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
      <body className={`min-h-screen bg-slate-950 text-white ${fontClass}`}>
        <NextIntlClientProvider locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
