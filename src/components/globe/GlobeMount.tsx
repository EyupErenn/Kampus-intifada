'use client'

import dynamic from 'next/dynamic'

/* ssr:false yalnızca Client Component içinde geçerli (Next 16).
   Server layout bu wrapper'ı import eder. */
const GlobeBackground = dynamic(() => import('./GlobeBackground'), {
  ssr: false,
  loading: () => null,
})

export default function GlobeMount() {
  return <GlobeBackground />
}
