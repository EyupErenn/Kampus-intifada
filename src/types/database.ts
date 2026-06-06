// Supabase tablo tipleri (001_initial.sql şemasıyla birebir).

export type Locale = 'tr' | 'en' | 'ar'

export type AnnouncementCategory = 'duyuru' | 'ozet' | 'acil' | 'etkinlik'

export interface Announcement {
  id: string
  title_tr: string
  title_en: string
  title_ar: string
  content_tr: string | null
  content_en: string | null
  content_ar: string | null
  image_url: string | null
  event_date: string | null
  category: AnnouncementCategory
  is_pinned: boolean
  created_at: string
}

export interface Tent {
  id: string
  slug: string
  name_tr: string | null
  name_en: string | null
  name_ar: string | null
  desc_tr: string | null
  desc_en: string | null
  desc_ar: string | null
  icon: string | null
  color: string | null
  order_num: number | null
}

export type ResourceType = 'video' | 'makale' | 'kitap' | 'infografik'

export interface Resource {
  id: string
  tent_id: string | null
  type: ResourceType
  url: string | null
  title: string | null
  description: string | null
  submitted_by: string | null
  is_approved: boolean
  votes: number
  created_at: string
}

export interface Comment {
  id: string
  tent_id: string | null
  content: string
  author: string
  likes: number
  created_at: string
}

// Locale'e göre çok dilli alan seçici.
export function localized<T extends object>(
  row: T,
  base: string,
  locale: string,
): string {
  const rec = row as Record<string, unknown>
  return (rec[`${base}_${locale}`] ?? rec[`${base}_tr`] ?? '') as string
}
