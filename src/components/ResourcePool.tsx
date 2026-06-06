'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronUp, ExternalLink, Plus, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Resource, ResourceType } from '@/types/database'

interface ResourcePoolProps {
  tentId: string
  initialResources: Resource[]
  featured?: Resource[]
  searchable?: boolean
  heading?: string
}

type TabKey = 'all' | ResourceType

const TYPE_STYLES: Record<ResourceType, string> = {
  video: 'bg-flag-red/15 text-flag-red',
  makale: 'bg-sky-500/15 text-sky-300',
  kitap: 'bg-flag-green/15 text-flag-green',
  infografik: 'bg-amber-500/15 text-amber-300',
}

export default function ResourcePool({
  tentId,
  initialResources,
  featured = [],
  searchable = false,
  heading,
}: ResourcePoolProps) {
  const t = useTranslations('pool')
  const [resources, setResources] = useState<Resource[]>([
    ...featured,
    ...initialResources,
  ])
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

  const TABS: Array<{ key: TabKey; label: string }> = [
    { key: 'all', label: t('tabs.all') },
    { key: 'video', label: t('tabs.video') },
    { key: 'makale', label: t('tabs.makale') },
    { key: 'kitap', label: t('tabs.kitap') },
    { key: 'infografik', label: t('tabs.infografik') },
  ]
  const typeLabel = (type: ResourceType) => t(`tabs.${type}`)

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

    setShowForm(false)
    const payload = { ...form }
    setForm({ title: '', url: '', type: 'makale', submitted_by: '' })
    setToast(t('toast'))
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
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-flag-white">
          {heading ?? t('heading')}
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-full bg-flag-green px-4 py-2 text-sm font-bold text-ink transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          {t('suggest')}
        </button>
      </div>

      {/* Arama (opsiyonel) */}
      {searchable && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-ink-line bg-bone/[0.03] px-3">
          <Search className="h-4 w-4 shrink-0 text-bone-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-transparent py-2.5 text-sm text-flag-white placeholder:text-bone-dim focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={t('clear')}>
              <X className="h-4 w-4 text-bone-dim hover:text-flag-white" />
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
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === tabItem.key
                ? 'bg-bone text-ink'
                : 'bg-bone/[0.05] text-bone-dim hover:text-flag-white'
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
          className="dossier-card mb-6 grid gap-3 rounded-2xl p-4 sm:grid-cols-2"
        >
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('formTitle')}
            className="rounded-lg border border-ink-line bg-bone/[0.03] px-3 py-2 text-sm text-flag-white placeholder:text-bone-dim focus:border-flag-green/50 focus:outline-none"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder={t('formUrl')}
            className="rounded-lg border border-ink-line bg-bone/[0.03] px-3 py-2 text-sm text-flag-white placeholder:text-bone-dim focus:border-flag-green/50 focus:outline-none"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
            className="rounded-lg border border-ink-line bg-bone/[0.03] px-3 py-2 text-sm text-flag-white focus:border-flag-green/50 focus:outline-none"
          >
            {(['video', 'makale', 'kitap', 'infografik'] as ResourceType[]).map(
              (typeKey) => (
                <option key={typeKey} value={typeKey} className="bg-ink">
                  {typeLabel(typeKey)}
                </option>
              ),
            )}
          </select>
          <input
            value={form.submitted_by}
            onChange={(e) => setForm({ ...form, submitted_by: e.target.value })}
            placeholder={t('formName')}
            className="rounded-lg border border-ink-line bg-bone/[0.03] px-3 py-2 text-sm text-flag-white placeholder:text-bone-dim focus:border-flag-green/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-flag-green px-4 py-2 text-sm font-bold text-ink transition hover:brightness-110 sm:col-span-2"
          >
            {t('submit')}
          </button>
        </form>
      )}

      {/* Liste / fallback boş durum */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-line p-10 text-center text-bone-dim">
          {t('empty')}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((r) => (
            <article key={r.id} className="dossier-card flex gap-3 rounded-2xl p-4">
              {/* Upvote */}
              <button
                type="button"
                onClick={() => upvote(r.id)}
                disabled={voted.has(r.id)}
                aria-label={t('vote')}
                className={`flex h-fit shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5 text-sm transition ${
                  voted.has(r.id)
                    ? 'bg-flag-green/20 text-flag-green'
                    : 'bg-bone/[0.05] text-bone-dim hover:bg-bone/10 hover:text-flag-white'
                }`}
              >
                {voted.has(r.id) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
                <span className="font-bold tabular-nums">{r.votes}</span>
              </button>

              {/* İçerik */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${TYPE_STYLES[r.type]}`}
                  >
                    {typeLabel(r.type)}
                  </span>
                </div>
                <h3 className="font-bold leading-snug text-flag-white">{r.title}</h3>
                {r.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-bone-dim">
                    {r.description}
                  </p>
                )}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-flag-green hover:brightness-125"
                  >
                    {t('goto')}
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
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-flag-green px-5 py-2.5 text-sm font-bold text-ink shadow-lg">
          {toast}
        </div>
      )}
    </section>
  )
}
