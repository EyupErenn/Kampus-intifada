import type { Tent } from '@/types/database'

// Bilinen 6 çadır slug'ı (sabit).
export const TENT_SLUGS = [
  'sumud',
  'boykot',
  'dar-agaci',
  'sayilarla',
  'cocuk',
  'kutuphane',
] as const

// Supabase erişilemediğinde sayfaların yine de anlamlı render olması için
// 001_initial.sql seed verisiyle eşleşen fallback. id alanı placeholder'dır
// (gerçek env yokken kalıcı yazma zaten gerçekleşmez).
export const FALLBACK_TENTS: Record<string, Tent> = {
  sumud: {
    id: 'sumud',
    slug: 'sumud',
    name_tr: 'Sumud Çadırı',
    name_en: 'Sumud Tent',
    name_ar: 'خيمة الصمود',
    desc_tr: 'Direniş hafızası ve dayanışma duvarı',
    desc_en: 'Resistance memory and solidarity wall',
    desc_ar: 'ذاكرة المقاومة وجدار التضامن',
    icon: 'anchor',
    color: '#306d29',
    order_num: 1,
  },
  boykot: {
    id: 'boykot',
    slug: 'boykot',
    name_tr: 'Boykot Çadırı',
    name_en: 'Boycott Tent',
    name_ar: 'خيمة المقاطعة',
    desc_tr: 'Farkındalık, alternatifler ve bilinç',
    desc_en: 'Awareness, alternatives and consciousness',
    desc_ar: 'التوعية والبدائل والوعي',
    icon: 'shield-off',
    color: '#9b0f06',
    order_num: 2,
  },
  'dar-agaci': {
    id: 'dar-agaci',
    slug: 'dar-agaci',
    name_tr: 'Dar Ağacı Çadırı',
    name_en: 'Gallows Tent',
    name_ar: 'خيمة المشنقة',
    desc_tr: '12 bin esirin hikayesi',
    desc_en: 'The story of 12 thousand prisoners',
    desc_ar: 'قصة اثني عشر ألف أسير',
    icon: 'key',
    color: '#9b0f06',
    order_num: 3,
  },
  sayilarla: {
    id: 'sayilarla',
    slug: 'sayilarla',
    name_tr: 'Sayılarla Gazze',
    name_en: 'Gaza in Numbers',
    name_ar: 'غزة بالأرقام',
    desc_tr: 'Rakamların dili',
    desc_en: 'The language of statistics',
    desc_ar: 'لغة الإحصاءات',
    icon: 'bar-chart-2',
    color: '#9b0f06',
    order_num: 4,
  },
  cocuk: {
    id: 'cocuk',
    slug: 'cocuk',
    name_tr: 'Çocuk Çadırı',
    name_en: "Children's Tent",
    name_ar: 'خيمة الأطفال',
    desc_tr: 'Yarınların sesi',
    desc_en: 'The voice of tomorrow',
    desc_ar: 'صوت الغد',
    icon: 'heart',
    color: '#306d29',
    order_num: 5,
  },
  kutuphane: {
    id: 'kutuphane',
    slug: 'kutuphane',
    name_tr: 'Kütüphane Çadırı',
    name_en: 'Library Tent',
    name_ar: 'خيمة المكتبة',
    desc_tr: 'Eğitim ve kaynaklar',
    desc_en: 'Education and resources',
    desc_ar: 'التعليم والمصادر',
    icon: 'book-open',
    color: '#306d29',
    order_num: 6,
  },
}

// order_num'a göre sıralı fallback listesi. Supabase boş/erişilemez olduğunda
// grid'in (anasayfa + /cadirlar) asla boş render olmaması için kullanılır.
export const FALLBACK_TENTS_LIST: Tent[] = Object.values(FALLBACK_TENTS).sort(
  (a, b) => (a.order_num ?? 0) - (b.order_num ?? 0),
)
