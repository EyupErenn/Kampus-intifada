'use client'

import { useState } from 'react'
import { Share2, Download, Check } from 'lucide-react'

interface ShareActionsProps {
  /** Locale-prefixed share path, e.g. "/tr/sonuc?m=quiz&s=8" */
  sharePath: string
  /** OG image endpoint, e.g. "/api/og?m=quiz&s=8&l=tr" */
  downloadUrl: string
  shareTitle: string
  shareText: string
  shareLabel: string
  downloadLabel: string
}

export default function ShareActions({
  sharePath,
  downloadUrl,
  shareTitle,
  shareText,
  shareLabel,
  downloadLabel,
}: ShareActionsProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}${sharePath}`
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url })
        return
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — nothing else to do
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl bg-flag-red px-6 py-3 text-sm font-bold text-flag-white transition-opacity hover:opacity-90"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {shareLabel}
      </button>
      <a
        href={downloadUrl}
        download="campus-intifada.png"
        className="inline-flex items-center gap-2 rounded-xl border border-bone/20 px-6 py-3 text-sm font-semibold text-bone-dim transition-colors hover:border-flag-green/40 hover:text-flag-white"
      >
        <Download className="h-4 w-4" />
        {downloadLabel}
      </a>
    </div>
  )
}
