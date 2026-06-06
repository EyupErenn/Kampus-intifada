'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronUp, ExternalLink, Plus, Search, X } from 'lucide-react'
import type { Resource, ResourceType } from '@/types/database'

interface ResourcePoolProps {
  tentId: string
  initialResources: Resource[]
  featured?: Resource[]
  searchable?: boolean
  heading?: string
}

type TabKey = 'all' | ResourceType

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'Tümü' },
  { key: 'video', label: 'Video' },
  { key: 'makale', label: 'Makale' },
  { key: 'kitap', label: 'Kitap' },
  { key: 'infografik', label: 'İnfografik' },
]

const TYPE_LABELS: Record<ResourceType, string> = {
  video: 'Video',
  makale: 'Makale',
  kitap: 'Kitap',
  infografik: 'İnfografik',
}

const TYPE_STYLES: Record<ResourceType, string> = {
  video: 'bg-red-500/15 text-red-300',
  makale: 'bg-sky-500/15 text-sky-300',
  kitap: 'bg-emerald-500/15 text-emerald-300',
  infografik: 'bg-amber-500/15 text-amber-300',
}

export default function ResourcePool({
  tentId,
  initialResources,
  featured = [],
  searchable = false,
  heading = 'Kaynak Havuzu',
}: ResourcePoolProps) {
  const [resources, setResources] = useState<Resource[]>([...featured, ...initialResources])
  const [tab, setTab] = useState<TabKey>('all')
  const [query, setQuery] = useState('')
  const [voted, setVoted] = useState<Set<string>>(new Set())

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    url: '',
    type: 'makale' as ResourceType,
    submitted_by: '',
  })
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return resources.filter((r) => {
      if (tab !== 'all' && r.type !== tab) return false
      if (q) {
        const hay = `${r.title ?? ''} ${r.description ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [resources, tab, query])

  const upvote = async (id: string) => {
    if (voted.has(id)) return
    setVoted((prev) => new Set(prev).add(id))
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r)),
    )
    try {
      await fetch('/api/resources/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch {
      // optimistic UI kalır; sunucu hatası sessiz
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    // Onaysız kaynaklar listede gösterilmez (RLS gereği gizli); sadece toast.
    setShowForm(false)
    const payload = { ...form }
    setForm({ title: '', url: '', type: 'makale', submitted_by: '' })
    setToast('Öneriniz alındı. Onaylandıktan sonra yayınlanacak.')
    window.setTimeout(() => setToast(null), 4000)

    try {
      await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tent_id: tentId, ...payload, is_approved: false }),
      })
    } catch {
      // sessiz
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">{heading}</h2>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Kaynak Öner
        </button>
      </div>

      {/* Arama (opsiyonel) */}
      {searchable && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Başlık veya açıklamada ara..."
            className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Temizle">
              <X className="h-4 w-4 text-white/40 hover:text-white" />
            </button>
          )}
        </div>
      )}

      {/* Tür sekmeleri */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setTab(tabItem.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === tabItem.key
                ? 'bg-white text-slate-900'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Öneri formu */}
      {showForm && (
        <form
          onSubmit={submit}
          className="glass-card mb-6 grid gap-3 rounded-2xl p-4 sm:grid-cols-2"
        >
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Başlık *"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-green/50 focus:outline-none"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="Bağlantı (URL)"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-green/50 focus:outline-none"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-green/50 focus:outline-none"
          >
            {(Object.keys(TYPE_LABELS) as ResourceType[]).map((typeKey) => (
              <option key={typeKey} value={typeKey} className="bg-slate-900">
                {TYPE_LABELS[typeKey]}
              </option>
            ))}
          </select>
          <input
            value={form.submitted_by}
            onChange={(e) => setForm({ ...form, submitted_by: e.target.value })}
            placeholder="Adın (opsiyonel)"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-green/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:col-span-2"
          >
            Gönder
          </button>
        </form>
      )}

      {/* Liste / fallback boş durum */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">
          Bu kategoride henüz kaynak yok. İlk öneren sen ol.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="glass-card flex gap-3 rounded-2xl p-4"
            >
              {/* Upvote */}
              <button
                type="button"
                onClick={() => upvote(r.id)}
                disabled={voted.has(r.id)}
                aria-label="Oyla"
                className={`flex h-fit shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5 text-sm transition ${
                  voted.has(r.id)
                    ? 'bg-brand-green/20 text-brand-green'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {voted.has(r.id) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
                <span className="font-semibold tabular-nums">{r.votes}</span>
              </button>

              {/* İçerik */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[r.type]}`}
                  >
                    {TYPE_LABELS[r.type]}
                  </span>
                </div>
                <h3 className="font-semibold leading-snug text-white">{r.title}</h3>
                {r.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {r.description}
                  </p>
                )}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-green hover:text-green-400"
                  >
                    Kaynağa git
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand-green px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </section>
  )
}
