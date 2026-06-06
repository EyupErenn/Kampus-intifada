@AGENTS.md

## Obsidian Bağlamı
Proje CONTEXT.md: `/Users/seyit/Desktop/ObsidianTest/ObsidianTest/01_Projects/campus-intifada/CONTEXT.md`

# Campus İntifada — CLAUDE.md

Bu dosya Claude Code'un her oturumda okuduğu proje rehberidir.
Değiştirmeden önce mutlaka oku.

---

## Proje Özeti

**Campus İntifada**, Bursa Teknik Üniversitesi (BTU) kampüsündeki fiziksel farkındalık hareketinin dijital ikizi olan, üretime hazır bir Next.js web uygulamasıdır. Hackathon projesi değil; canlı, sürdürülebilir bir platformdur.

**Amaçlar:**
- Küresel dayanışma ve organizasyon merkezi
- Dijital arşiv ve kaynak havuzu
- Gerçek zamanlı etkileşim (duyurular, mesajlar, oylamalar)

---

## Tech Stack

| Katman | Teknoloji | Versiyon |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | 16 LTS |
| Stil | Tailwind CSS | latest |
| Animasyon | Framer Motion | latest |
| Veritabanı | Supabase (PostgreSQL + Realtime) | latest |
| İkonlar | Lucide React | latest |
| i18n | next-intl | latest |
| Font | Noto Sans (Google Fonts) | — |
| Runtime (Chat) | Next.js Edge Runtime | — |

**Kesinlikle kullanma:**
- `OpenAI`, `Gemini` veya başka harici AI API'leri (chat kural tabanlı çalışır)
- `emoji` (tüm ikonlar Lucide React SVG tabanlı)
- Başka font ailesi (`Inter`, `Roboto`, `Arial` yasak — sadece `Noto Sans`)

---

## Dizin Yapısı

```
campus-intifada/
├── CLAUDE.md                          # Bu dosya
├── .env.local                         # Supabase credentials (commit etme)
├── .env.local.example                 # Örnek env (commit edilebilir)
├── next.config.ts                     # Turbopack + next-intl plugin
├── tailwind.config.ts                 # Koyu tema + özel utilitiler
├── supabase/
│   └── migrations/
│       ├── 001_initial.sql            # Ana şema + RLS + seed
│       └── 002_increment_votes.sql    # increment_votes() fonksiyonu
├── messages/
│   ├── tr.json                        # Türkçe çeviriler
│   ├── en.json                        # İngilizce çeviriler
│   └── ar.json                        # Arapça çeviriler (RTL)
└── src/
    ├── middleware.ts                  # next-intl locale yönlendirme
    ├── i18n/
    │   └── routing.ts                 # Locale konfigürasyonu
    ├── lib/
    │   └── supabase.ts                # Browser + server client exportları
    ├── types/
    │   └── database.ts                # Supabase tablo tipleri (manuel)
    ├── components/
    │   ├── SplashScreen.tsx           # Canvas cardioid + martı + typewriter
    │   ├── Navbar.tsx                 # Sticky nav + dil seçici + sayaç
    │   ├── AnnouncementTicker.tsx     # Kırmızı şerit, sağdan sola kayan
    │   ├── TimelineFeed.tsx           # Dikey zaman çizelgesi (mock fallback)
    │   ├── TentGrid.tsx               # 2x3 Bento grid
    │   ├── ResourcePool.tsx           # Kaynak havuzu + oylama + öneri formu
    │   └── ChatWidget.tsx             # Sağ alt sabit chat paneli
    └── app/
        ├── api/
        │   ├── chat/
        │   │   └── route.ts           # Edge runtime kural tabanlı chatbot
        │   └── resources/
        │       └── vote/
        │           └── route.ts       # Optimistic oy güncelleme
        └── [locale]/
            ├── layout.tsx             # Locale-aware root layout
            ├── template.tsx           # Framer Motion sayfa geçişi
            ├── page.tsx               # Ana sayfa (server component)
            └── cadirlar/
                └── [slug]/
                    └── page.tsx       # Dinamik çadır sayfaları
```

---

## Veritabanı Şeması

### Tablolar

**`announcements`**
```sql
id UUID PK | title_tr/en/ar TEXT | content_tr/en/ar TEXT
image_url TEXT | event_date DATE
category: 'duyuru' | 'ozet' | 'acil' | 'etkinlik'
is_pinned BOOLEAN | created_at TIMESTAMPTZ
```

**`tents`**
```sql
id UUID PK | slug TEXT UNIQUE
name_tr/en/ar TEXT | desc_tr/en/ar TEXT
icon TEXT | color TEXT | order_num INT
```
Sabit sluglar: `sumud`, `boykot`, `dar-agaci`, `sayilarla`, `cocuk`, `kutuphane`

**`resources`**
```sql
id UUID PK | tent_id UUID FK → tents
type: 'video' | 'makale' | 'kitap' | 'infografik'
url TEXT | title TEXT | description TEXT
submitted_by TEXT | is_approved BOOLEAN (default false) | votes INT (default 0)
```

**`comments`**
```sql
id UUID PK | tent_id UUID FK → tents (nullable)
content TEXT (3-500 karakter) | author TEXT
likes INT | created_at TIMESTAMPTZ
```

### RLS Özeti
- **SELECT**: Tüm tablolar herkese açık
- **INSERT announcements/tents**: Sadece `authenticated`
- **INSERT resources**: Herkese açık — ama `is_approved` mutlaka `false` olmalı (policy enforce eder)
- **UPDATE resources.votes**: Herkese açık (sadece +1 artış, `increment_votes()` fonksiyonu üzerinden)
- **INSERT comments**: Herkese açık
- **UPDATE/DELETE comments**: Sadece `authenticated`

---

## i18n Kuralları

**Desteklenen diller:** `tr` (varsayılan), `en`, `ar`

**Arapça için zorunlu:**
- `src/app/[locale]/layout.tsx` içinde `dir="rtl"` set edilmeli (`locale === 'ar'` kontrolüyle)
- Flex layout otomatik ayna görünümüne geçer — ekstra CSS yazma
- `lang="ar"` attribute HTML elementine eklenmeli

**Server component'larda:**
```ts
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('nav')
```

**Client component'larda:**
```ts
import { useTranslations } from 'next-intl'
const t = useTranslations('nav')
```

**Dil anahtarı alımı (layout/params):**
```ts
// App Router'da locale her server component'a params olarak gelir
const { locale } = await params
```

---

## Tailwind Özel Sınıflar

`tailwind.config.ts` içinde tanımlı:

```
.glass-card       → backdrop-blur-12 + bg-white/5 + border-white/10
.glow-red         → box-shadow: 0 0 20px rgba(220,38,38,0.4)
.glow-green       → box-shadow: 0 0 20px rgba(22,163,74,0.4)
```

Özel renkler:
```
brand-red:   #dc2626
brand-green: #16a34a
brand-black: #0a0a0a
```

---

## Bileşen Yazım Kuralları

### Genel
- Her bileşen dosyasının başında `"use client"` veya `// server component` belirt
- `any` tipi kullanma — her zaman Supabase tablo tiplerinden türet
- Props interface'i her zaman dosyanın üstünde tanımla

### Veri Fetching
- **Server components**: `createServerClient` kullan, `await` ile direkt fetch
- **Client components**: Props olarak veri al (lifting state up), yoksa `useEffect` + browser client
- Supabase hataları her zaman handle et: `const { data, error } = await supabase...`

### Fallback Garantisi
`TimelineFeed` ve diğer kritik bileşenler boş **asla** render etmez.
Supabase'den veri gelmezse hardcoded mock data göster.
```ts
const displayEvents = (events && events.length > 0) ? events : MOCK_EVENTS
```

### Animasyon
- Framer Motion: `whileInView` kullan (scroll tetiklemeli), `viewport={{ once: true }}`
- Stagger için `variants` + `staggerChildren: 0.1` pattern'i kullan
- CSS animasyonları: saf Tailwind ile çözülemeyen döngüsel animasyonlarda `@keyframes` ekle

---

## Çadır Sayfaları Özeti

| Slug | Ana Özellik | Özel Bileşen |
|---|---|---|
| `sumud` | Hafıza duvarı + canlı mesaj | Supabase Realtime subscription |
| `boykot` | Sallanan ürün silüetleri + alternatifler | SVG Framer Motion loop |
| `dar-agaci` | Kafes illüstrasyonu + sayaç | Intersection Observer count-up |
| `sayilarla` | Animasyonlu büyük sayaçlar | requestAnimationFrame count-up |
| `cocuk` | Post-it mesaj duvarı | comments tablosu (tent_id ile) |
| `kutuphane` | Arama + kaynak havuzu | ResourcePool (tam ekran) |

Tüm çadır sayfaları `<ResourcePool />` bileşenini içerir.

---

## Chat API Kuralları (`/api/chat`)

**Runtime:** `export const runtime = 'edge'`
**Harici API yok.** Sadece keyword matching.

Kural sırası (ilk eşleşme kazanır):
1. Takvim kelimeleri → etkinlik programı (markdown tablo)
2. Çadır kelimeleri → çadır haritası + linkler
3. Yardım kelimeleri → İHH + Mazlum-Der linkleri
4. Eşleşme yok → varsayılan karşılama (locale'e göre TR/EN/AR)

---

## Geliştirme Komutları

```bash
npm run dev          # Turbopack ile geliştirme sunucusu (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint kontrolü
npm run type-check   # tsc --noEmit

# Supabase migration uygula (Supabase CLI kuruluysa)
supabase db push
```

---

## Ortam Değişkenleri

```env
NEXT_PUBLIC_SUPABASE_URL=      # Supabase proje URL'i
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon (public) key
```

`.env.local` dosyasını asla commit etme. `.env.local.example` commit edilebilir.

---

## Yapılmaması Gerekenler

- `placeholder` veya `// TODO: ekle` yorum satırı bırakma
- Eksik logic ile component teslim etme — her şey çalışır halde olmalı
- Emoji kullanma (Lucide ikonları kullan)
- `Inter`, `Roboto`, `Arial` font kullanma
- OpenAI/Gemini/harici AI API çağrısı yapma
- Supabase'e `is_approved: true` ile resource INSERT etme (anon kullanıcılar için)
- `console.log` bırakma (sadece `console.error` hata durumlarında)

---

## Önemli Notlar

- **Arapça RTL**: Layout seviyesinde `dir="rtl"` set edilince Flex otomatik ayna yapar. Ekstra CSS yazma.
- **Türkçe karakterler**: `charset="utf-8"` layout'ta zorunlu. Noto Sans latin-ext subset yüklenmiş olmalı.
- **Realtime (Sumud)**: Supabase channel sadece `sumud` çadırı sayfasında aktif. Diğer sayfalarda subscription kurma.
- **Seed data**: `supabase/migrations/001_initial.sql` içinde. Yerel dev'de `supabase db reset` ile yeniden uygulanır.
- **generateStaticParams**: `cadirlar/[slug]` için tüm locale + slug kombinasyonlarını döndür. Böylece build time'da statik render edilir.
