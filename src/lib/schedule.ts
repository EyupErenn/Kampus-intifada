/* ============================================================
   HAFTALIK PROGRAM — Campus İntifada (8–12 Haziran 2026)
   Sabit etkinlik verisi (tents.ts deseni: inline i18n).
   Gün/ay/haftagünü adları bileşende Intl ile yerelleşir;
   burada yalnız tarih + etkinlik içerikleri tutulur.
   ============================================================ */

export interface ScheduleEvent {
  start: string
  end?: string
  title_tr: string
  title_en: string
  title_ar: string
  detail_tr?: string
  detail_en?: string
  detail_ar?: string
  image?: string
  featured?: boolean
}

export interface ScheduleDay {
  date: string // ISO "YYYY-MM-DD"
  events: ScheduleEvent[]
}

export const SCHEDULE: ScheduleDay[] = [
  {
    date: '2026-06-08',
    events: [
      {
        start: '15:00',
        end: '17:00',
        title_tr: 'Diplomasi Masası Atölyesi',
        title_en: 'Diplomacy Table Workshop',
        title_ar: 'ورشة طاولة الدبلوماسية',
        detail_tr: 'Melike Alkan · BTÜ Mimar Sinan Yerleşkesi, Çadır Alanı',
        detail_en: 'Melike Alkan · BTU Mimar Sinan Campus, Tent Area',
        detail_ar: 'ميليكه ألكان · حرم BTU ميمار سنان، منطقة الخيام',
        image: '/program/diplomasi-masasi.jpg',
        featured: true,
      },
      {
        start: '18:00',
        end: '20:00',
        title_tr: 'Çadır Sohbetleri',
        title_en: 'Tent Talks',
        title_ar: 'أحاديث الخيمة',
        detail_tr: 'Rıdvan Şimşek',
        detail_en: 'Rıdvan Şimşek',
        detail_ar: 'رضوان شيمشك',
      },
    ],
  },
  {
    date: '2026-06-09',
    events: [
      {
        start: '09:00',
        end: '18:00',
        title_tr: 'Kermes',
        title_en: 'Charity Bazaar',
        title_ar: 'سوق خيري',
      },
      {
        start: '15:00',
        end: '17:00',
        title_tr: '7–10 Yaş TDV Çocuk Atölyesi',
        title_en: "TDV Children's Workshop (Ages 7–10)",
        title_ar: 'ورشة الأطفال TDV (7–10 سنوات)',
      },
    ],
  },
  {
    date: '2026-06-10',
    events: [
      {
        start: '09:00',
        end: '15:00',
        title_tr: 'Kermes',
        title_en: 'Charity Bazaar',
        title_ar: 'سوق خيري',
      },
      {
        start: '15:00',
        end: '17:00',
        title_tr: 'Vefa Topluluğu Amigurumi Atölyesi',
        title_en: 'Vefa Community Amigurumi Workshop',
        title_ar: 'ورشة أميغورومي لمجتمع وفا',
      },
    ],
  },
  {
    date: '2026-06-11',
    events: [
      {
        start: '13:00',
        end: '15:00',
        title_tr: 'Geçerken Topluluğu Tezhip Atölyesi',
        title_en: 'Geçerken Community Illumination (Tezhip) Workshop',
        title_ar: 'ورشة التذهيب لمجتمع غيتشركن',
      },
      {
        start: '16:00',
        end: '18:00',
        title_tr: 'Sumud Hakkında',
        title_en: 'On Sumud',
        title_ar: 'عن الصمود',
        detail_tr: 'Enver Öztürk · İHH Bursa Yönetim Kurulu Üyesi',
        detail_en: 'Enver Öztürk · IHH Bursa Board Member',
        detail_ar: 'أنور أوزتورك · عضو مجلس إدارة IHH بورصة',
      },
    ],
  },
  {
    date: '2026-06-12',
    events: [
      {
        start: '10:00',
        end: '12:00',
        title_tr: 'Mirasımız Kudüs Derneği Tatreez Atölyesi',
        title_en: 'Our Heritage Jerusalem Association Tatreez Workshop',
        title_ar: 'ورشة التطريز لجمعية القدس تراثنا',
      },
      {
        start: '13:00',
        end: '15:00',
        title_tr: '"Fahri Ebi Diyab" Kudüs\'te Hak İhlalleri Söyleşisi',
        title_en: '"Fahri Ebi Diyab" Talk on Rights Violations in Jerusalem',
        title_ar: 'ندوة "فخري أبي دياب" حول انتهاكات الحقوق في القدس',
      },
    ],
  },
]

type Field = 'title' | 'detail'

/** Etkinliğin verili dildeki alanını döndürür (yoksa TR'ye düşer). */
export function eventField(
  event: ScheduleEvent,
  field: Field,
  locale: string
): string {
  const key = `${field}_${locale}` as keyof ScheduleEvent
  return (event[key] as string | undefined) ?? (event[`${field}_tr`] as string) ?? ''
}
