import type { ReactNode } from 'react'
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { rankIndex, TOTAL } from '@/lib/quiz'
import tr from '../../../../messages/tr.json'
import en from '../../../../messages/en.json'
import ar from '../../../../messages/ar.json'

export const runtime = 'nodejs'

const MESSAGES = { tr, en, ar } as const
type Loc = keyof typeof MESSAGES

const COLORS = {
  ink: '#0b0c0a',
  inkRaised: '#14150f',
  line: 'rgba(233,225,207,0.14)',
  bone: '#e9e1cf',
  boneDim: '#9c9684',
  red: '#9b0f06',
  green: '#306d29',
  white: '#f6f3ea',
}

const SITE = 'kampus-intifada.vercel.app'

function pickLocale(raw: string | null): Loc {
  return raw === 'en' || raw === 'ar' ? raw : 'tr'
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('m') === 'flotilla' ? 'flotilla' : 'quiz'
    const locale = pickLocale(searchParams.get('l'))
    const isRtl = locale === 'ar'
    const m = MESSAGES[locale]

    const [notoSans, notoArabic, qrBuf] = await Promise.all([
      readFile(join(process.cwd(), 'src/assets/fonts/NotoSans-Bold.ttf')),
      readFile(join(process.cwd(), 'src/assets/fonts/NotoSansArabic-Bold.woff')),
      readFile(join(process.cwd(), 'public/qr.png')),
    ])
    const qrSrc = `data:image/png;base64,${qrBuf.toString('base64')}`
    const fontFamily = isRtl ? 'NotoSansArabic' : 'NotoSans'

    // ── Content per mode ──
    let kicker: string
    let headline: ReactNode
    let sub: string

    if (mode === 'flotilla') {
      const ship = (searchParams.get('ship') || m.flotilla.ship_name_default).slice(0, 40)
      const cargoKey = searchParams.get('cargo') || 'medicine'
      const cargo = m.flotilla as unknown as Record<string, string>
      const cargoLabel = cargo[`cargo_${cargoKey}`] || m.flotilla.cargo_medicine
      kicker = m.flotilla.title
      headline = (
        <div style={{ display: 'flex', fontSize: 88, color: COLORS.white, lineHeight: 1.05 }}>
          {ship}
        </div>
      )
      sub = `${m.flotilla.cargo_label_short}: ${cargoLabel}`
    } else {
      const score = Math.max(0, Math.min(TOTAL, Number(searchParams.get('s')) || 0))
      const idx = rankIndex(score)
      kicker = m.quiz.result_title
      headline = (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 130, color: COLORS.white, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 64, color: COLORS.boneDim }}>/ {TOTAL}</span>
          <span style={{ fontSize: 60, color: COLORS.green, marginLeft: 22 }}>
            {m.quiz.ranks[idx]}
          </span>
        </div>
      )
      sub = m.quiz.rank_descs[idx]
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 72,
            backgroundColor: COLORS.ink,
            fontFamily,
            direction: isRtl ? 'rtl' : 'ltr',
            position: 'relative',
          }}
        >
          {/* top accent stripe */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 44 }}>
            <div style={{ width: 96, height: 8, backgroundColor: COLORS.red, borderRadius: 4 }} />
            <div style={{ width: 48, height: 8, backgroundColor: COLORS.green, borderRadius: 4 }} />
            <div style={{ width: 24, height: 8, backgroundColor: COLORS.white, borderRadius: 4 }} />
          </div>

          {/* brand */}
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              letterSpacing: 6,
              color: COLORS.red,
              textTransform: 'uppercase',
            }}
          >
            Campus İntifada
          </div>

          {/* main */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              gap: 26,
              paddingRight: isRtl ? 0 : 360,
              paddingLeft: isRtl ? 360 : 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                fontSize: 24,
                letterSpacing: 3,
                color: COLORS.green,
                textTransform: 'uppercase',
                padding: '8px 18px',
                border: `1px solid ${COLORS.line}`,
                borderRadius: 999,
                backgroundColor: COLORS.inkRaised,
              }}
            >
              {kicker}
            </div>
            {headline}
            <div style={{ display: 'flex', fontSize: 34, lineHeight: 1.4, color: COLORS.boneDim }}>
              {sub}
            </div>
          </div>

          {/* QR bridge — bottom corner */}
          <div
            style={{
              position: 'absolute',
              bottom: 64,
              ...(isRtl ? { left: 72 } : { right: 72 }),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: 14,
                backgroundColor: COLORS.white,
                borderRadius: 18,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc} width={188} height={188} alt="" />
            </div>
            <div style={{ display: 'flex', fontSize: 22, color: COLORS.white }}>{SITE}</div>
            <div style={{ display: 'flex', fontSize: 20, color: COLORS.boneDim }}>
              {m.sonuc.qr_hint}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'NotoSans', data: notoSans, weight: 700, style: 'normal' },
          { name: 'NotoSansArabic', data: notoArabic, weight: 700, style: 'normal' },
        ],
      },
    )
  } catch (e) {
    console.error('OG image generation failed:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
