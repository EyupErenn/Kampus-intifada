'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ============================================================
   CINEMATIC EARTH MESH — v2 (Photorealistic)
   • Real satellite imagery via CDN fallback chain
   • MeshStandardMaterial for physical day/night shading
   • Thin Fresnel atmosphere rim glow (scale 1.015, NOT 1.12)
   • Slow cloud layer sphere (slightly larger, independent rotation)
   • Directional "sun" light + dim ambient for night side
   • 4 Crisis hotspot fire patches — surface-aligned, pulsing
   • Mouse parallax tilt (5-8°) + scroll-linked camera dive to Gaza
   ============================================================ */

/* ── Constants ─────────────────────────────────────────────── */
const TEXTURE_URLS = [
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg',
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
]
const CLOUDS_URL = 'https://unpkg.com/three-globe/example/img/earth-clouds.png'

const BASE_ROTATION_SPEED = 0.032   // rad/s auto-spin
const CLOUDS_EXTRA_SPEED  = 0.012   // clouds spin slightly faster
// Gaza: the longitude offset that brings it front-center when group.rotation.y = GAZA_Y
const GAZA_Y = -(34.45 + 180) * (Math.PI / 180) + Math.PI  // ≈ −1.19 rad

/* ── Coordinate conversion ──────────────────────────────────── */
function latLng(lat: number, lng: number, r = 1): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  )
}

/* ── Crisis hotspots ─────────────────────────────────────────── */
const HOTSPOTS = [
  { id: 'gaza',    lat: 31.5, lng: 34.45, primary: true  },
  { id: 'xinjiang',lat: 41.0, lng: 85.0,  primary: false },
  { id: 'sudan',   lat: 15.5, lng: 32.5,  primary: false },
  { id: 'myanmar', lat: 20.8, lng: 93.0,  primary: false },
]

/* ── Fire glow texture (radial orange-red) ───────────────────── */
function makeFireTexture(size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  g.addColorStop(0.00, 'rgba(255,255,220,1.00)')   // hot white core
  g.addColorStop(0.15, 'rgba(255,140,20,0.95)')    // bright orange
  g.addColorStop(0.40, 'rgba(220,50,20,0.70)')     // deep red
  g.addColorStop(0.70, 'rgba(180,20,10,0.30)')
  g.addColorStop(1.00, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(c)
}

/* ── Ring pulse texture ──────────────────────────────────────── */
function makeRingTexture(size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  for (let i = 0; i < 3; i++) {
    const r = size * (0.28 + i * 0.06)
    ctx.beginPath()
    ctx.arc(size/2, size/2, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255,80,20,${0.7 - i * 0.18})`
    ctx.lineWidth = size * 0.022
    ctx.shadowColor = 'rgba(255,60,0,0.8)'
    ctx.shadowBlur = 8
    ctx.stroke()
  }
  return new THREE.CanvasTexture(c)
}

/* ── Thin Fresnel Atmosphere Shader ─────────────────────────── */
// Rendered on BackSide of a sphere scaled 1.015 — creates a
// razor-thin rim glow ONLY at the silhouette edge, not a thick halo.
const atmVert = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 vp  = modelViewMatrix * vec4(position, 1.0);
    vViewPos = vp.xyz;
    gl_Position = projectionMatrix * vp;
  }
`
const atmFrag = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewPos;
  uniform float uScroll;
  void main() {
    vec3  viewDir = normalize(-vViewPos);
    float rim     = 1.0 - max(dot(vNormal, viewDir), 0.0);
    // pow(rim, 5.5) → extremely edge-hugging, almost invisible in the center
    float alpha   = pow(rim, 5.5) * 0.22 * (1.0 - uScroll * 0.85);
    vec3  color   = mix(vec3(0.20, 0.52, 0.92), vec3(0.45, 0.78, 1.0), rim);
    gl_FragColor  = vec4(color, alpha);
  }
`

/* ── Component ───────────────────────────────────────────────── */
interface Props {
  scrollRef: RefObject<number>
  pausedRef: RefObject<boolean>
  mouseRef:  RefObject<{ x: number; y: number }>
  reduced:   boolean
}

export default function EarthMesh({ scrollRef, pausedRef, mouseRef, reduced }: Props) {
  const groupRef    = useRef<THREE.Group>(null)
  const cloudsRef   = useRef<THREE.Mesh>(null)
  const atmMatRef   = useRef<THREE.ShaderMaterial>(null)
  const ringsRef    = useRef<(THREE.Mesh | null)[]>([])
  const autoRotY    = useRef(GAZA_Y)
  const tilt        = useRef({ x: 0, y: 0 })

  /* texture loading state */
  const [earthTex,  setEarthTex]  = useState<THREE.Texture | null>(null)
  const [cloudsTex, setCloudsTex] = useState<THREE.Texture | null>(null)

  const { camera, invalidate } = useThree()

  /* procedural textures */
  const fireTex = useMemo(() => typeof window !== 'undefined' ? makeFireTexture() : null, [])
  const ringTex = useMemo(() => typeof window !== 'undefined' ? makeRingTexture() : null, [])

  /* hotspot 3D positions */
  const hotspots = useMemo(() => HOTSPOTS.map(h => ({
    ...h,
    pos:    latLng(h.lat, h.lng, 1.008),
    normal: latLng(h.lat, h.lng, 1.0).normalize(),
  })), [])

  /* atmo uniforms */
  const atmUniforms = useMemo(() => ({ uScroll: { value: 0 } }), [])

  /* ── Load earth texture: try each CDN in order ────────────── */
  useEffect(() => {
    const manager = new THREE.LoadingManager()
    const loader  = new THREE.TextureLoader(manager)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(loader as any).crossOrigin = 'anonymous'

    let cancelled = false

    async function loadChain() {
      for (const url of TEXTURE_URLS) {
        try {
          const tex = await new Promise<THREE.Texture>((resolve, reject) => {
            loader.load(url, resolve, undefined, reject)
          })
          if (cancelled) { tex.dispose(); return }
          tex.colorSpace = THREE.SRGBColorSpace
          tex.anisotropy = 4
          setEarthTex(tex)
          return
        } catch (_err) {
          // CDN failed — try next in chain
        }
      }
      // All CDNs failed — solid dark-navy fallback
      if (!cancelled) {
        const fallback = new THREE.DataTexture(
          new Uint8Array([12, 20, 42, 255]),
          1, 1, THREE.RGBAFormat
        )
        fallback.needsUpdate = true
        setEarthTex(fallback)
      }
    }
    loadChain()
    return () => { cancelled = true }
  }, [])

  /* ── Load cloud alpha texture (optional) ─────────────────── */
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(loader as any).crossOrigin = 'anonymous'
    let cancelled = false
    loader.load(
      CLOUDS_URL,
      (tex) => {
        if (cancelled) { tex.dispose(); return }
        tex.colorSpace = THREE.SRGBColorSpace
        setCloudsTex(tex)
      },
      undefined,
      (_err) => { /* clouds are optional — silently ignore CDN failure */ }
    )
    return () => { cancelled = true }
  }, [])

  /* ── Reduced-motion: static Gaza-facing pose ─────────────── */
  useEffect(() => {
    if (reduced && groupRef.current) {
      groupRef.current.rotation.y = GAZA_Y
      groupRef.current.rotation.x = 0.10
      camera.position.set(0, 0, 3.8)
      invalidate()
    }
  }, [reduced, camera, invalidate])

  /* ── Per-frame animation ──────────────────────────────────── */
  useFrame((_, delta) => {
    if (reduced || pausedRef.current) return
    const group = groupRef.current
    if (!group) return

    const scroll = Math.min(1, Math.max(0, scrollRef.current ?? 0))

    /* 1 — Auto-spin */
    autoRotY.current += delta * BASE_ROTATION_SPEED

    /* 2 — Scroll-linked rotation lock toward Gaza */
    const lockWeight = Math.min(1, scroll * 2.4)
    group.rotation.y = THREE.MathUtils.lerp(autoRotY.current, GAZA_Y, lockWeight)

    /* 3 — Mouse parallax (fades out as user scrolls away) */
    const mx = (mouseRef.current?.x ?? 0) * (1 - scroll)
    const my = (mouseRef.current?.y ?? 0) * (1 - scroll)
    tilt.current.x = THREE.MathUtils.lerp(tilt.current.x, my * 0.10 + 0.10, 0.05)
    tilt.current.y = THREE.MathUtils.lerp(tilt.current.y, mx * 0.12,        0.05)
    group.rotation.x =  tilt.current.x
    group.rotation.z = -tilt.current.y * 0.35

    /* 4 — Scroll camera dive toward Gaza */
    const ease  = Math.pow(scroll, 1.7)
    const camZ  = THREE.MathUtils.lerp(3.8, 1.45, ease)
    const camY  = THREE.MathUtils.lerp(0,   0.30, ease)
    camera.position.set(0, camY, camZ)
    camera.lookAt(0, camY * 0.4, 0)

    /* 5 — Cloud slow-spin */
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * CLOUDS_EXTRA_SPEED

    /* 6 — Atmosphere uniform */
    if (atmMatRef.current) atmMatRef.current.uniforms.uScroll.value = scroll

    /* 7 — Hotspot pulse rings */
    const t = performance.now() * 0.001
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return
      const phase = ((t * 0.45 + i * 0.28) % 1)
      const s = 0.018 + phase * 0.072
      ring.scale.setScalar(s)
      ;(ring.material as THREE.MeshBasicMaterial).opacity =
        (1 - phase) * 0.90 * (1 - scroll * 0.65)
    })
  })

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Global Lights ── */}
      {/* Sun: angled from top-left to create a clear day/night terminator */}
      <directionalLight position={[5, 3, 5]} intensity={2.6} color="#fffce8" />
      {/* Dim fill so night side shows faint detail, not pure black */}
      <ambientLight intensity={0.08} color="#1a2a4a" />

      <group ref={groupRef}>
        {/* ── Earth Globe ── */}
        <mesh>
          <sphereGeometry args={[1, 96, 96]} />
          {earthTex ? (
            <meshStandardMaterial
              map={earthTex}
              roughness={0.78}
              metalness={0.04}
              envMapIntensity={0.15}
            />
          ) : (
            /* Loading placeholder — neutral dark navy */
            <meshStandardMaterial color="#0d1a30" roughness={1} metalness={0} />
          )}
        </mesh>

        {/* ── Cloud Layer (slightly larger, slower independent spin) ── */}
        {cloudsTex && (
          <mesh ref={cloudsRef} scale={[1.012, 1.012, 1.012]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
              map={cloudsTex}
              alphaMap={cloudsTex}
              transparent
              opacity={0.38}
              depthWrite={false}
              roughness={1}
              metalness={0}
            />
          </mesh>
        )}

        {/* ── Crisis Hotspot Fire Glow & Pulse Rings ── */}
        {fireTex && hotspots.map((h, i) => {
          const scale = h.primary ? 0.19 : 0.14
          return (
            <group key={h.id} position={h.pos}>
              {/* Fire sprite — always faces camera (billboard), AdditiveBlending */}
              <sprite scale={[scale, scale, scale]}>
                <spriteMaterial
                  map={fireTex}
                  blending={THREE.AdditiveBlending}
                  transparent
                  depthWrite={false}
                  opacity={0.92}
                />
              </sprite>

              {/* Pulsing thermal ring — surface-aligned plane */}
              {ringTex && (
                <mesh
                  ref={(el: THREE.Mesh | null) => { ringsRef.current[i] = el }}
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
                    opacity={0.9}
                  />
                </mesh>
              )}
            </group>
          )
        })}
      </group>

      {/* ── Thin Fresnel Atmosphere Rim — scale 1.015, BackSide ── */}
      {/* This renders ONLY at silhouette edges, NOT as a thick halo ring */}
      <mesh scale={[1.015, 1.015, 1.015]}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={atmMatRef}
          vertexShader={atmVert}
          fragmentShader={atmFrag}
          uniforms={atmUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
