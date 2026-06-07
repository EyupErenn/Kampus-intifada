import { getTranslations } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import ChatWidget from '@/components/ChatWidget'
import { TatreezDivider } from '@/components/motifs/Tatreez'
import QuizModule from '@/components/interactive/QuizModule'

export default async function BilgiYarismasiPage() {
  const t = await getTranslations('quiz')

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
        <TatreezDivider count={10} className="mx-auto mb-10 max-w-lg" />

        <header className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.32em] text-flag-green">
            {t('kicker')}
          </span>
          <h1 className="riso-title mt-3 text-3xl font-black tracking-tight text-flag-white md:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-sm text-bone-dim">{t('subtitle')}</p>
        </header>

        <QuizModule />
      </main>

      <ChatWidget />
    </>
  )
}
