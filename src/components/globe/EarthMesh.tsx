'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ================================================================
   EARTH MESH — Photorealistic 3D Globe (v3)
   ────────────────────────────────────────────────────────────────
   ✔ NASA Blue Marble satellite texture (CDN fallback chain)
   ✔ MeshStandardMaterial — physically correct day/night shading
   ✔ DirectionalLight "sun" → visible terminator line
   ✔ AmbientLight dim fill → night side not pitch-black
   ✔ Cloud layer sphere (radius 1.01, independent faster rotation)
   ✔ Thin Fresnel atmosphere (radius 1.015, BackSide, pow=6.0)
     → 2-4px effective glow at silhouette edge ONLY — NO thick ring
   ✔ 4 crisis hotspot fire markers at exact lat/lng coordinates
     → surface-normal aligned, 2-3s pulsing glow
   ✔ Mouse parallax tilt (5-8°)
   ✔ Scroll-linked camera dive toward Gaza
   ✔ prefers-reduced-motion support
   ================================================================ */

/* ── Texture Paths — local first (no CORS), CDN fallback ────────── */
const EARTH_TEXTURE_URLS = [
  '/textures/earth-blue-marble.jpg',                                        // local (public/)
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',        // CDN fallback 1
  'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg', // CDN fallback 2
  '/textures/earth-2k.jpg',                                                 // local low-res fallback
]
// Cloud texture is optional — no local copy needed
const CLOUDS_TEXTURE_URL =
  'https://unpkg.com/three-globe@2.31.0/example/img/earth-clouds.png'

/* ── Rotation speeds ────────────────────────────────────────────── */
const EARTH_SPIN  = 0.028      // rad/s — slow cinematic auto-rotate
const CLOUD_SPIN  = 0.015      // slightly faster than globe

/* ── Gaza facing angle (for scroll-lock) ────────────────────────── */
const GAZA_LAT = 31.5
const GAZA_LNG = 34.45
const GAZA_FACE_Y =
  -(GAZA_LNG + 180) * (Math.PI / 180) + Math.PI // ≈ −1.19 rad

/* ── Lat/Lng → 3D cartesian on unit sphere ──────────────────────── */
function latLngToVec3(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
  )
}

/* ── Crisis Hotspot Data ────────────────────────────────────────── */
const CRISIS_ZONES = [
  { id: 'gaza',      lat: 31.5,  lng: 34.45, primary: true,  label: 'Gaza'          },
  { id: 'xinjiang',   lat: 41.0,  lng: 85.0,  primary: false, label: 'East Turkistan' },
  { id: 'sudan',      lat: 15.5,  lng: 32.5,  primary: false, label: 'Sudan'          },
  { id: 'myanmar',    lat: 20.8,  lng: 93.0,  primary: false, label: 'Rakhine'        },
] as const

/* ── Procedural fire glow texture ───────────────────────────────── */
function createFireTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2

  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  grad.addColorStop(0.0,  'rgba(255, 255, 220, 1.0)')  // white-hot core
  grad.addColorStop(0.12, 'rgba(255, 140,  20, 0.95)') // bright orange
  grad.addColorStop(0.35, 'rgba(255,  69,   0, 0.75)') // #ff4500
  grad.addColorStop(0.60, 'rgba(220,  30,  10, 0.40)') // deep red
  grad.addColorStop(0.85, 'rgba(160,  10,   0, 0.15)')
  grad.addColorStop(1.0,  'rgba(0,     0,   0, 0.0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/* ── Procedural pulse-ring texture ──────────────────────────────── */
function createRingTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2

  ctx.clearRect(0, 0, size, size)
  // 2 concentric pulse rings
  for (let i = 0; i < 2; i++) {
    const r = half * (0.55 + i * 0.16)
    ctx.beginPath()
    ctx.arc(half, half, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 80, 20, ${0.8 - i * 0.25})`
    ctx.lineWidth = size * 0.025
    ctx.shadowColor = 'rgba(255, 60, 0, 0.9)'
    ctx.shadowBlur = 10
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/* ── Thin Fresnel Atmosphere Shader ─────────────────────────────── */
// Rendered on BackSide of sphere scaled 1.015.
// pow(fresnel, 6.0) makes it visible ONLY at the absolute silhouette edge.
// Max alpha 0.20 — razor-thin, 2-4px effective, soft blue, NO thick ring.
const ATM_VERT = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldNormal  = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vViewDir      = normalize(cameraPosition - worldPos.xyz);
    gl_Position   = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ATM_FRAG = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  void main() {
    float rim   = 1.0 - max(dot(vWorldNormal, vViewDir), 0.0);
    float alpha = pow(rim, 6.0) * 0.20;
    vec3  col   = mix(vec3(0.29, 0.56, 0.85), vec3(0.50, 0.80, 1.0), rim);
    gl_FragColor = vec4(col, alpha);
  }
`

/* ── Texture loader with CDN fallback chain ─────────────────────── */
function loadTextureChain(
  urls: string[],
  onSuccess: (tex: THREE.Texture) => void,
  onAllFail?: () => void,
) {
  let idx = 0
  const loader = new THREE.TextureLoader()

  function tryNext() {
    if (idx >= urls.length) {
      onAllFail?.()
      return
    }
    const url = urls[idx++]
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        onSuccess(tex)
      },
      undefined,
      () => tryNext(), // this URL failed → try next
    )
  }
  tryNext()
}

/* ── Component Props ────────────────────────────────────────────── */
interface EarthMeshProps {
  scrollRef: RefObject<number>
  pausedRef: RefObject<boolean>
  mouseRef:  RefObject<{ x: number; y: number }>
  reduced:   boolean
}

/* ================================================================
   EARTH MESH COMPONENT
   ================================================================ */
export default function EarthMesh({
  scrollRef,
  pausedRef,
  mouseRef,
  reduced,
}: EarthMeshProps) {
  /* ── Refs ── */
  const groupRef  = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const autoRotY  = useRef(GAZA_FACE_Y)
  const tiltX     = useRef(0.1)
  const tiltY     = useRef(0)

  /* ── Texture State ── */
  const [earthTex,  setEarthTex]  = useState<THREE.Texture | null>(null)
  const [cloudsTex, setCloudsTex] = useState<THREE.Texture | null>(null)

  const { camera, invalidate } = useThree()

  /* ── Procedural Textures (fire + ring) ── */
  const fireTex = useMemo(
    () => (typeof window !== 'undefined' ? createFireTexture() : null),
    [],
  )
  const ringTex = useMemo(
    () => (typeof window !== 'undefined' ? createRingTexture() : null),
    [],
  )

  /* ── Hotspot 3D Positions ── */
  const hotspots = useMemo(
    () =>
      CRISIS_ZONES.map((zone) => ({
        ...zone,
        pos:    latLngToVec3(zone.lat, zone.lng, 1.005),
        normal: latLngToVec3(zone.lat, zone.lng, 1.0).normalize(),
      })),
    [],
  )

  /* ── Ring mesh refs for pulse animation ── */
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])

  /* ── Sprite refs for pulse opacity ── */
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([])

  /* ── Load Earth Texture (CDN Fallback) ── */
  useEffect(() => {
    let disposed = false

    loadTextureChain(
      EARTH_TEXTURE_URLS,
      (tex) => { if (!disposed) setEarthTex(tex) },
      () => {
        // All CDNs failed → dark navy fallback so globe never renders broken
        if (!disposed) {
          const fb = new THREE.DataTexture(
            new Uint8Array([14, 22, 48, 255]),
            1, 1,
            THREE.RGBAFormat,
          )
          fb.needsUpdate = true
          setEarthTex(fb)
        }
      },
    )

    return () => { disposed = true }
  }, [])

  /* ── Load Cloud Texture (optional) ── */
  useEffect(() => {
    let disposed = false
    const loader = new THREE.TextureLoader()
    loader.load(
      CLOUDS_TEXTURE_URL,
      (tex) => {
        if (disposed) { tex.dispose(); return }
        tex.colorSpace = THREE.SRGBColorSpace
        setCloudsTex(tex)
      },
      undefined,
      () => { /* clouds are optional — ignore failure */ },
    )
    return () => { disposed = true }
  }, [])

  /* ── Reduced-motion: static frame, Gaza facing ── */
  useEffect(() => {
    if (reduced && groupRef.current) {
      groupRef.current.rotation.set(0.1, GAZA_FACE_Y, 0)
      camera.position.set(0, 0, 3.8)
      camera.lookAt(0, 0, 0)
      invalidate()
    }
  }, [reduced, camera, invalidate])

  /* ── Per-Frame Animation Loop ── */
  useFrame((_, delta) => {
    if (reduced || pausedRef.current) return
    const group = groupRef.current
    if (!group) return

    const scroll = Math.min(1, Math.max(0, scrollRef.current ?? 0))

    /* 1 — Slow auto-spin */
    autoRotY.current += delta * EARTH_SPIN

    /* 2 — Scroll locks rotation toward Gaza */
    const lockW = Math.min(1, scroll * 2.5)
    group.rotation.y = THREE.MathUtils.lerp(
      autoRotY.current,
      GAZA_FACE_Y,
      lockW,
    )

    /* 3 — Mouse parallax (5-8° max, fades on scroll) */
    const mx = (mouseRef.current?.x ?? 0) * (1 - scroll)
    const my = (mouseRef.current?.y ?? 0) * (1 - scroll)
    tiltX.current = THREE.MathUtils.lerp(tiltX.current, my * 0.10 + 0.10, 0.04)
    tiltY.current = THREE.MathUtils.lerp(tiltY.current, mx * 0.12,         0.04)
    group.rotation.x =  tiltX.current
    group.rotation.z = -tiltY.current * 0.3

    /* 4 — Scroll-linked camera dive toward Gaza */
    const ease = Math.pow(scroll, 1.6)
    camera.position.set(
      0,
      THREE.MathUtils.lerp(0, 0.28, ease),
      THREE.MathUtils.lerp(3.8, 1.5, ease),
    )
    camera.lookAt(0, THREE.MathUtils.lerp(0, 0.14, ease), 0)

    /* 5 — Cloud spin (independent, slightly faster) */
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * CLOUD_SPIN
    }

    /* 6 — Hotspot pulse animation (2-3s cycle) */
    const t = performance.now() * 0.001
    spriteRefs.current.forEach((sprite, i) => {
      if (!sprite) return
      // 2.5s sinusoidal pulse
      const pulse = 0.60 + 0.40 * Math.sin(t * 2.5 + i * 1.5)
      ;(sprite.material as THREE.SpriteMaterial).opacity = pulse
    })

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      // Expanding ring: 0→1 over ~2.2s, repeating
      const phase = ((t * 0.45 + i * 0.3) % 1)
      const s = 0.02 + phase * 0.08
      ring.scale.setScalar(s)
      const mat = ring.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.85 * (1 - scroll * 0.5)
    })
  })

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <>
      {/* ━━ LIGHTING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Sun — directional from top-right to carve a clear terminator */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={2.8}
        color="#fffbe6"
      />
      {/* Dim ambient — night side shows faint surface, not pitch black */}
      <ambientLight intensity={0.07} color="#1a2a4a" />

      {/* ━━ EARTH GROUP (rotates as unit) ━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <group ref={groupRef}>

        {/* ── Earth Sphere ── */}
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          {earthTex ? (
            <meshStandardMaterial
              map={earthTex}
              roughness={0.82}
              metalness={0.02}
            />
          ) : (
            // Loading placeholder: dark navy (not black, not broken)
            <meshStandardMaterial
              color="#0e1a30"
              roughness={1}
              metalness={0}
            />
          )}
        </mesh>

        {/* ── Cloud Layer (radius * 1.01, independent spin) ── */}
        {cloudsTex && (
          <mesh ref={cloudsRef} scale={1.01}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
              map={cloudsTex}
              alphaMap={cloudsTex}
              transparent
              opacity={0.35}
              depthWrite={false}
              roughness={1}
              metalness={0}
            />
          </mesh>
        )}

        {/* ── Crisis Hotspot Markers ── */}
        {fireTex &&
          hotspots.map((h, i) => {
            const spriteScale = h.primary ? 0.20 : 0.14
            return (
              <group key={h.id} position={h.pos}>
                {/* Fire glow sprite (billboard, Additive) */}
                <sprite
                  ref={(el) => {
                    spriteRefs.current[i] = el
                  }}
                  scale={[spriteScale, spriteScale, spriteScale]}
                >
                  <spriteMaterial
                    map={fireTex}
                    blending={THREE.AdditiveBlending}
                    transparent
                    depthWrite={false}
                    opacity={0.9}
                  />
                </sprite>

                {/* Expanding thermal ring — surface-normal aligned */}
                {ringTex && (
                  <mesh
                    ref={(el) => {
                      ringRefs.current[i] = el
                    }}
                    quaternion={new THREE.Quaternion().setFromUnitVectors(
                      new THREE.Vector3(0, 0, 1),
                      h.normal,
                    )}
                  >
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                      map={ringTex}
                      transparent
                      blending={THREE.AdditiveBlending}
                      depthWrite={false}
                      side={THREE.DoubleSide}
                      opacity={0.85}
                    />
                  </mesh>
                )}
              </group>
            )
          })}
      </group>

      {/* ━━ THIN FRESNEL ATMOSPHERE (radius * 1.015, BackSide) ━━━ */}
      {/* pow(fresnel, 6.0) → visible ONLY at silhouette edge      */}
      {/* max alpha 0.20 → razor-thin soft blue glow, NOT a ring   */}
      <mesh scale={1.015}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={ATM_VERT}
          fragmentShader={ATM_FRAG}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
