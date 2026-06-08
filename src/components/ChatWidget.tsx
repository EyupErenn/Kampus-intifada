'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, MessageCircle, Send } from 'lucide-react'

type Role = 'user' | 'bot'
interface ChatMessage {
  role: Role
  text: string
}
type ChatLocale = 'tr' | 'en' | 'ar'

const GREETING: Record<ChatLocale, string> = {
  tr: 'Merhaba! Campus İntifada BTU dijital rehberiyim. **Çadırlar**, **program** veya **destek** hakkında sorabilirsin.',
  en: "Hello! I'm the Campus İntifada BTU digital guide. Ask me about **tents**, **schedule**, or **support**.",
  ar: 'مرحباً! أنا الدليل الرقمي لكامبوس إنتفاضة BTU. يمكنك السؤال عن **الخيام** و**البرنامج** و**الدعم**.',
}

const ERROR_REPLY: Record<ChatLocale, string> = {
  tr: 'Bağlantı hatası. Lütfen tekrar dene.',
  en: 'Connection error. Please try again.',
  ar: 'خطأ في الاتصال. حاول مرة أخرى.',
}

// --- Küçük markdown renderer: bold, link, liste ve tablo ---

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-bone">
          {m[1]}
        </strong>,
      )
    } else {
      const href = m[3]
      const external = /^https?:\/\//.test(href)
      nodes.push(
        <a
          key={`${keyPrefix}-a-${i}`}
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="font-medium text-brand-green underline underline-offset-2 hover:text-green-400"
        >
          {m[2]}
        </a>,
      )
    }
    last = regex.lastIndex
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0
  const isRow = (l: string) => /^\s*\|.*\|\s*$/.test(l)
  const isSep = (l: string) => /^\s*\|[\s:|-]+\|\s*$/.test(l)
  const parseRow = (r: string) =>
    r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())

  while (i < lines.length) {
    const line = lines[i]

    // Tablo
    if (isRow(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const header = parseRow(line)
      let j = i + 2
      const rows: string[][] = []
      while (j < lines.length && isRow(lines[j])) {
        rows.push(parseRow(lines[j]))
        j++
      }
      blocks.push(
        <table key={`t-${key++}`} className="my-1 w-full border-collapse text-xs">
          <thead>
            <tr>
              {header.map((h, hi) => (
                <th
                  key={hi}
                  className="border-b border-ink-line px-1.5 py-1 text-start font-semibold text-bone"
                >
                  {renderInline(h, `th-${key}-${hi}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => (
                  <td
                    key={ci}
                    className="border-b border-ink-line px-1.5 py-1 align-top text-bone-dim"
                  >
                    {renderInline(c, `td-${key}-${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      )
      i = j
      continue
    }

    // Boş satır → boşluk
    if (line.trim() === '') {
      blocks.push(<div key={`s-${key++}`} className="h-1.5" />)
      i++
      continue
    }

    // Liste
    if (/^\s*-\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*-\s+/, ''))
        i++
      }
      blocks.push(
        <ul key={`u-${key++}`} className="my-0.5 space-y-1">
          {items.map((it, ii) => (
            <li key={ii} className="flex gap-1.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-green" />
              <span>{renderInline(it, `li-${key}-${ii}`)}</span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Paragraf
    blocks.push(
      <p key={`p-${key++}`} className="leading-relaxed">
        {renderInline(line, `p-${key}`)}
      </p>,
    )
    i++
  }

  return <div className="space-y-0.5">{blocks}</div>
}

export default function ChatWidget() {
  const t = useTranslations('chat')
  const locale = useLocale() as ChatLocale

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streaming, setStreaming] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const busy = isTyping || streaming

  // İlk açılışta selamlama mesajı
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'bot', text: GREETING[locale] ?? GREETING.tr }])
    }
  }, [isOpen, locale, messages.length])

  // Her yeni mesaj/typing'de en alta kaydır
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  // Unmount'ta interval temizle
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const streamReply = (reply: string) => {
    const words = reply.split(' ')
    setMessages((m) => [...m, { role: 'bot', text: '' }])
    setStreaming(true)
    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      const partial = words.slice(0, i).join(' ')
      setMessages((m) => {
        const next = [...m]
        for (let k = next.length - 1; k >= 0; k--) {
          if (next[k].role === 'bot') {
            next[k] = { ...next[k], text: partial }
            break
          }
        }
        return next
      })
      if (i >= words.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        setStreaming(false)
      }
    }, 60)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || busy) return

    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, locale }),
      })
      const data = (await res.json()) as { reply: string }
      setIsTyping(false)
      streamReply(data.reply ?? '')
    } catch {
      setIsTyping(false)
      setMessages((m) => [...m, { role: 'bot', text: ERROR_REPLY[locale] ?? ERROR_REPLY.tr }])
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="dossier-card flex h-96 w-80 flex-col overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* Başlık */}
            <div className="flex items-center justify-between border-b border-ink-line bg-bone/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flag-green opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-flag-green" />
                </span>
                <span className="text-sm font-semibold text-bone">{t('title')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t('minimize')}
                className="text-bone-dim transition-colors hover:text-bone"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {/* Mesajlar */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 text-sm text-bone ${
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-tr-none bg-flag-red/15'
                        : 'rounded-2xl rounded-tl-none bg-bone/[0.05]'
                    }`}
                  >
                    {msg.role === 'bot' ? renderMarkdown(msg.text) : msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-none bg-bone/[0.05] px-3 py-2.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 rounded-full bg-bone/50 [animation:dot-bounce_1.2s_infinite]"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Girdi */}
            <div className="flex items-center gap-2 border-t border-ink-line p-2.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder={t('placeholder')}
                className="min-w-0 flex-1 rounded-full border border-ink-line bg-bone/[0.04] px-3 py-2 text-sm text-bone placeholder:text-bone-dim focus:border-flag-green/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={busy || !input.trim()}
                aria-label={t('send')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green text-white transition hover:brightness-110 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Açma/kapama butonu */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? t('close') : t('open')}
        className="glow-green flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-white shadow-lg transition-transform hover:scale-105"
      >
        {isOpen ? <ChevronDown className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}
