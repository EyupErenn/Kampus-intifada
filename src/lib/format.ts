// Sayı ve göreli zaman biçimlendirme yardımcıları (locale-aware).

export function formatNumber(n: number, locale: string = 'tr'): string {
  try {
    return new Intl.NumberFormat(locale).format(n)
  } catch {
    return new Intl.NumberFormat('tr').format(n)
  }
}

export function relativeTime(iso: string, locale: string = 'tr'): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffSeconds = Math.round((then - Date.now()) / 1000) // geçmiş için negatif

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const abs = Math.abs(diffSeconds)
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === 'second') {
      return rtf.format(Math.round(diffSeconds / secs), unit)
    }
  }
  return ''
}
