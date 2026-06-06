export const runtime = 'edge'

type ChatLocale = 'tr' | 'en' | 'ar'

interface ChatRequest {
  message?: string
  locale?: string
}

// --- Anahtar kelimeler (sıralı eşleşme: ilk eşleşen kazanır) ---

const KEYWORDS: Record<'schedule' | 'tents' | 'support', Record<ChatLocale, string[]>> = {
  schedule: {
    tr: ['saat', 'program', 'ne zaman', 'takvim', 'etkinlik'],
    en: ['schedule', 'when', 'program', 'event', 'time'],
    ar: ['وقت', 'برنامج', 'متى', 'جدول'],
  },
  tents: {
    tr: ['çadır', 'sumud', 'boykot', 'kütüphane', 'dar ağacı', 'sayılarla', 'çocuk'],
    en: ['tent', 'sumud', 'boycott', 'library', 'prisoner', 'numbers', 'child'],
    ar: ['خيمة', 'صمود', 'مقاطعة', 'مكتبة', 'أسير', 'أرقام', 'طفل'],
  },
  support: {
    tr: ['yardım', 'bağış', 'destek', 'katıl', 'nasıl'],
    en: ['help', 'donate', 'support', 'join', 'how'],
    ar: ['مساعدة', 'تبرع', 'دعم', 'انضم', 'كيف'],
  },
}

// --- Yanıtlar (markdown, locale'e göre) ---

const SCHEDULE: Record<ChatLocale, string> = {
  tr: `**Etkinlik Programı**

| Saat | Etkinlik |
| --- | --- |
| 10:00 | Açılış Töreni |
| 12:30 | Kampüs Meydanı Toplanma ve Basın Açıklaması |
| 14:00 | Panel: Akademik Boykot |
| 16:00 | Çocuk Atölyesi |
| 18:00 | Kapanış ve Ortak Dua |`,
  en: `**Event Schedule**

| Time | Event |
| --- | --- |
| 10:00 | Opening Ceremony |
| 12:30 | Campus Square Rally & Press Statement |
| 14:00 | Panel: Academic Boycott |
| 16:00 | Children's Workshop |
| 18:00 | Closing & Collective Prayer |`,
  ar: `**برنامج الفعاليات**

| الوقت | الفعالية |
| --- | --- |
| 10:00 | حفل الافتتاح |
| 12:30 | تجمع الساحة وبيان صحفي |
| 14:00 | ندوة: المقاطعة الأكاديمية |
| 16:00 | ورشة عمل الأطفال |
| 18:00 | الختام والصلاة الجماعية |`,
}

function tentsReply(loc: ChatLocale): string {
  const p = `/${loc}/cadirlar`
  if (loc === 'en') {
    return `**The Tents**

The event is made up of six thematic tents:

- [Sumud Tent](${p}/sumud) — Resistance memory and solidarity wall
- [Boycott Tent](${p}/boykot) — Awareness, alternatives and consciousness
- [Gallows Tent](${p}/dar-agaci) — The story of 12 thousand prisoners
- [Gaza in Numbers](${p}/sayilarla) — The language of statistics
- [Children's Tent](${p}/cocuk) — The voice of tomorrow
- [Library Tent](${p}/kutuphane) — Education and resources`
  }
  if (loc === 'ar') {
    return `**الخيام**

تتكوّن الفعالية من ست خيام موضوعية:

- [خيمة الصمود](${p}/sumud) — ذاكرة المقاومة وجدار التضامن
- [خيمة المقاطعة](${p}/boykot) — التوعية والبدائل والوعي
- [خيمة المشنقة](${p}/dar-agaci) — قصة اثني عشر ألف أسير
- [غزة بالأرقام](${p}/sayilarla) — لغة الإحصاءات
- [خيمة الأطفال](${p}/cocuk) — صوت الغد
- [خيمة المكتبة](${p}/kutuphane) — التعليم والمصادر`
  }
  return `**Çadırlar**

Etkinlik altı tematik çadırdan oluşuyor:

- [Sumud Çadırı](${p}/sumud) — Direniş hafızası ve dayanışma duvarı
- [Boykot Çadırı](${p}/boykot) — Farkındalık, alternatifler ve bilinç
- [Dar Ağacı Çadırı](${p}/dar-agaci) — 12 bin esirin hikayesi
- [Sayılarla Gazze](${p}/sayilarla) — Rakamların dili
- [Çocuk Çadırı](${p}/cocuk) — Yarınların sesi
- [Kütüphane Çadırı](${p}/kutuphane) — Eğitim ve kaynaklar`
}

const SUPPORT: Record<ChatLocale, string> = {
  tr: `**Nasıl Katılabilirsin?**

Campus İntifada gönüllü dayanışmasıyla ayakta. Katkı sağlamanın yolları:

- Çadırları ziyaret et, kaynak öner, mesaj bırak
- Boykot listesini paylaş, farkındalığı büyüt
- Güvenilir insani yardım kuruluşlarına bağış yap

- [İHH İnsani Yardım](https://ihh.org.tr)
- [Mazlum-Der](https://mazlumder.org)`,
  en: `**How Can You Join?**

Campus İntifada runs on volunteer solidarity. Ways to contribute:

- Visit the tents, suggest resources, leave a message
- Share the boycott list, grow awareness
- Donate to trusted humanitarian organizations

- [İHH Humanitarian Relief](https://ihh.org.tr)
- [Mazlum-Der](https://mazlumder.org)`,
  ar: `**كيف يمكنك المشاركة؟**

تقوم كامبوس إنتفاضة على التضامن التطوعي. طرق المساهمة:

- زر الخيام، اقترح مصادر، اترك رسالة
- شارك قائمة المقاطعة وانشر الوعي
- تبرّع لمنظمات إنسانية موثوقة

- [الإغاثة الإنسانية İHH](https://ihh.org.tr)
- [Mazlum-Der](https://mazlumder.org)`,
}

const DEFAULT_REPLY: Record<ChatLocale, string> = {
  tr: 'Merhaba! Campus İntifada BTU dijital rehberiyim. Çadırlar, program veya destek hakkında sorabilirsin.',
  en: "Hello! I'm the Campus İntifada BTU digital guide. Ask me about tents, schedule, or support.",
  ar: 'مرحباً! أنا الدليل الرقمي لكامبوس إنتفاضة BTU. يمكنك السؤال عن الخيام والبرنامج والدعم.',
}

function normalizeLocale(value: string | undefined): ChatLocale {
  return value === 'en' || value === 'ar' ? value : 'tr'
}

function hasKeyword(message: string, list: string[]): boolean {
  return list.some((keyword) => message.includes(keyword))
}

export async function POST(req: Request) {
  let body: ChatRequest
  try {
    body = (await req.json()) as ChatRequest
  } catch {
    body = {}
  }

  const locale = normalizeLocale(body.locale)
  const message = String(body.message ?? '').toLowerCase()

  let reply: string

  if (hasKeyword(message, KEYWORDS.schedule[locale])) {
    reply = SCHEDULE[locale]
  } else if (hasKeyword(message, KEYWORDS.tents[locale])) {
    reply = tentsReply(locale)
  } else if (hasKeyword(message, KEYWORDS.support[locale])) {
    reply = SUPPORT[locale]
  } else {
    reply = DEFAULT_REPLY[locale]
  }

  return Response.json({ reply })
}
