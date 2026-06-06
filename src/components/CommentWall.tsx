'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import type { Comment } from '@/types/database'
import { relativeTime } from '@/lib/format'

interface CommentWallProps {
  tentId: string
  locale: string
  variant?: 'wall' | 'postit'
  maxContent?: number
  placeholder?: string
  buttonLabel?: string
}

const POSTIT_STYLES = [
  'bg-rose-200 text-rose-950 rotate-[-1.5deg]',
  'bg-amber-200 text-amber-950 rotate-[1.5deg]',
  'bg-sky-200 text-sky-950 rotate-[-1deg]',
  'bg-emerald-200 text-emerald-950 rotate-[1deg]',
  'bg-violet-200 text-violet-950 rotate-[-2deg]',
]

export default function CommentWall({
  tentId,
  locale,
  variant = 'wall',
  maxContent = 500,
  placeholder = 'Mesajın...',
  buttonLabel = 'Gönder',
}: CommentWallProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // İlk yükleme + Realtime INSERT aboneliği
  useEffect(() => {
    let active = true
    let supabase: ReturnType<typeof createBrowserClient> | null = null
    try {
      supabase = createBrowserClient()
    } catch {
      return
    }

    supabase
      .from('comments')
      .select('*')
      .eq('tent_id', tentId)
      .order('created_at', { ascending: true })
      .limit(20)
      .then(({ data }) => {
        if (active && data) setComments(data as Comment[])
      })

    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null
    try {
      channel = supabase
        .channel(`comments-${tentId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `tent_id=eq.${tentId}`,
          },
          (payload) => {
            const row = payload.new as Comment
            setComments((prev) =>
              prev.some((c) => c.id === row.id) ? prev : [...prev, row],
            )
          },
        )
        .subscribe()
    } catch {
      // realtime yoksa sessiz
    }

    return () => {
      active = false
      try {
        if (channel && supabase) supabase.removeChannel(channel)
      } catch {
        // sessiz
      }
    }
  }, [tentId])

  // Wall varyantında en alta kaydır
  useEffect(() => {
    if (variant === 'wall' && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [comments, variant])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = content.trim()
    const who = author.trim() || 'Anonim'
    if (text.length < 3 || text.length > maxContent || sending) return

    setSending(true)
    const optimistic: Comment = {
      id: `tmp-${Date.now()}`,
      tent_id: tentId,
      content: text,
      author: who,
      likes: 0,
      created_at: new Date().toISOString(),
    }
    setComments((prev) => [...prev, optimistic])
    setContent('')
    setAuthor('')

    try {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('comments')
        .insert({ tent_id: tentId, content: text, author: who })
        .select()
        .single()
      if (data) {
        const saved = data as Comment
        setComments((prev) => {
          const replaced = prev.map((c) => (c.id === optimistic.id ? saved : c))
          // olası realtime kopyasını ayıkla
          return replaced.filter(
            (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i,
          )
        })
      }
    } catch {
      // env yoksa optimistic kayıt UI'da kalır
    }
    setSending(false)
  }

  const remaining = maxContent - content.length

  return (
    <div className="flex flex-col gap-4">
      {/* Mesaj listesi */}
      {variant === 'wall' ? (
        <div
          ref={listRef}
          className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1"
        >
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">
              İlk mesajı sen bırak.
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="glass-card rounded-xl rounded-tl-none px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{c.author}</span>
                  <span className="shrink-0 text-[11px] text-white/40">
                    {relativeTime(c.created_at, locale)}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-sm text-slate-200">{c.content}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {comments.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-white/40">
              İlk mesajı sen bırak.
            </p>
          ) : (
            comments.map((c, i) => (
              <div
                key={c.id}
                className={`rounded-lg p-3 shadow-md transition-transform hover:rotate-0 ${POSTIT_STYLES[i % POSTIT_STYLES.length]}`}
              >
                <p className="break-words text-sm font-medium leading-snug">{c.content}</p>
                <p className="mt-2 text-xs font-semibold opacity-70">— {c.author}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mesaj formu */}
      <form onSubmit={submit} className="flex flex-col gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value.slice(0, 30))}
          placeholder="Adın (max 30)"
          maxLength={30}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-brand-green/50 focus:outline-none"
        />
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxContent))}
            placeholder={placeholder}
            rows={2}
            maxLength={maxContent}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pb-6 text-sm text-white placeholder:text-white/40 focus:border-brand-green/50 focus:outline-none"
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-white/40">
            {remaining}
          </span>
        </div>
        <button
          type="submit"
          disabled={content.trim().length < 3 || sending}
          className="inline-flex items-center justify-center gap-1.5 self-end rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          {buttonLabel}
        </button>
      </form>
    </div>
  )
}
