'use client'

import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ============================================================
   CINEMATIC 3D EARTH MESH
   • Gerçekçi gece/gündüz kontrastlı koyu küre dokusu
   • Atmosfer Fresnel Halesi (derin mavi-camgöbeği ışıltı)
   • Kriz Bölgesi Sıcak Noktaları (Gaza, East Turkistan, Sudan, Myanmar)
   • Ateş/ısı parıltısı (Additive blending particle sprites + pulsing rings)
   • Mouse Parallaksı (imlece doğru hafif 5-8 derece eğim)
   • Scroll Zoom / Dalış (Hero'dan kaydırıldığında Gazze'ye yumuşak kamera dalışı)
   ============================================================ */

// Kriz bölgeleri koordinatları (lat, lng, etiket, renk tonu)
export const CRISIS_HOTSPOTS = [
  { id: 'gaza',           name: 'Gazze / Filistin',       lat: 31.5, lng: 34.45, primary: true },
  { id: 'east_turkistan', name: 'Doğu Türkistan',        lat: 41.0, lng: 85.0,  primary: false },
  { id: 'sudan',          name: 'Sudan',                 lat: 15.5, lng: 32.5,  primary: false },
  { id: 'myanmar',        name: 'Arakan / Myanmar',      lat: 20.8, lng: 93.0,  primary: false },
]

// Lat/Lng -> 3D Küre Kartezyen Vektörü (R = 1.0)
export function latLngToVector3(lat: number, lng: number, radius = 1.0): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

// Gazze UV ve başlangıç açısı
const GAZA_UV = new THREE.Vector2(0.5969, 0.675)
const GAZA_FACING_Y = Math.PI / 2 - 2 * Math.PI * GAZA_UV.x // ≈ -2.18 rad
const BASE_ROTATION_SPEED = 0.035

// Ateş/ısı parıltısı için prosedürel radyal gradient dokusu
function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255, 255, 240, 1.0)') // Parlak sıcak merkez
  gradient.addColorStop(0.2, 'rgba(255, 110, 30, 0.95)') // Turuncu ateş
  gradient.addColorStop(0.55, 'rgba(217, 64, 64, 0.65)') // Nar Kırmızısı
  gradient.addColorStop(0.85, 'rgba(180, 20, 20, 0.25)')
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Halka dokusu (pulsing ring)
function createRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 128, 128)
  ctx.beginPath()
  ctx.arc(64, 64, 52, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 90, 40, 0.9)'
  ctx.lineWidth = 10
  ctx.shadowColor = 'rgba(255, 60, 20, 1.0)'
  ctx.shadowBlur = 12
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/* ── Earth Surface Custom Shader ── */
const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const earthFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2  uGazaUV;
  uniform float uMaskRadius;
  uniform vec3  uGlowColor;
  uniform float uTime;
  uniform float uScrollZoom;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 earth = texture2D(uTexture, vUv).rgb;

    // Koyu uzay estetiği: karasal tonları yüksek kontrastlı gece paletine dönüştür
    float lum = dot(earth, vec3(0.299, 0.587, 0.114));
    vec3 darkEarth = vec3(lum * 0.75) * vec3(0.72, 0.85, 1.08); // Soğuk çivit mavi/gri ton
    darkEarth = mix(darkEarth, vec3(0.04, 0.06, 0.10), 0.35); // Leyl lacivert taban karışımı

    // Gazze & Kriz bölgesi termal vurgusu
    vec2 d = vUv - uGazaUV;
    d.x *= 2.0;
    float dist = length(d);
    float gazaMask = 1.0 - smoothstep(uMaskRadius * 0.4, uMaskRadius * 1.6, dist);

    // Gazze sıcaklık dalgalanması
    float pulse = 0.85 + 0.15 * sin(uTime * 3.1415);
    vec3 hotGlow = uGlowColor * gazaMask * (0.85 * pulse);

    vec3 finalColor = darkEarth + hotGlow;

    // Atmosferik Fresnel Kenar Işıltısı (Rim lighting)
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
    fresnel = pow(fresnel, 2.8);
    vec3 atmosphereRim = vec3(0.10, 0.55, 0.98) * fresnel * 0.65;

    finalColor += atmosphereRim;

    // Scroll zoom yaptıkça yüzey karararak bir sonraki bölüme yumuşak geçiş sağlar
    finalColor *= (1.0 - smoothstep(0.75, 1.0, uScrollZoom));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

/* ── Atmosphere Outer Glow Shader ── */
const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uScrollZoom;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
    fresnel = pow(fresnel, 3.2);
    vec3 atmoColor = vec3(0.08, 0.52, 0.96);
    float alpha = fresnel * 0.75 * (1.0 - uScrollZoom * 0.8);
    gl_FragColor = vec4(atmoColor, alpha);
  }
`

interface EarthMeshProps {
  scrollRef: RefObject<number>
  pausedRef: RefObject<boolean>
  mouseRef: RefObject<{ x: number; y: number }>
  reduced: boolean
}

export default function EarthMesh({
  scrollRef,
  pausedRef,
  mouseRef,
  reduced,
}: EarthMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const earthMeshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const atmoMaterialRef = useRef<THREE.ShaderMaterial>(null)
  const ringsRef = useRef<THREE.Mesh[]>([])

  const autoRotY = useRef(GAZA_FACING_Y)
  const currentTilt = useRef({ x: 0, y: 0 })

  const texture = useLoader(THREE.TextureLoader, '/textures/earth-2k.jpg')
  const { gl, camera, invalidate } = useThree()

  // Prosedürel parıltı ve halka dokuları
  const glowTexture = useMemo(() => (typeof window !== 'undefined' ? createGlowTexture() : null), [])
  const ringTexture = useMemo(() => (typeof window !== 'undefined' ? createRingTexture() : null), [])

  // 4 kriz bölgesi 3D konumları
  const hotspotPositions = useMemo(() => {
    return CRISIS_HOTSPOTS.map((spot) => ({
      ...spot,
      position: latLngToVector3(spot.lat, spot.lng, 1.006),
      normal: latLngToVector3(spot.lat, spot.lng, 1.0).normalize(),
    }))
  }, [])

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.needsUpdate = true
  }, [texture, gl])

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uGazaUV: { value: GAZA_UV },
      uMaskRadius: { value: 0.08 },
      uGlowColor: { value: new THREE.Color('#FF4500') },
      uTime: { value: 0 },
      uScrollZoom: { value: 0 },
    }),
    [texture]
  )

  const atmoUniforms = useMemo(
    () => ({
      uScrollZoom: { value: 0 },
    }),
    []
  )

  // Reduced-motion: Gazze'ye bakan statik görünüm
  useEffect(() => {
    if (reduced && groupRef.current) {
      groupRef.current.rotation.y = GAZA_FACING_Y
      groupRef.current.rotation.x = 0.12
      camera.position.set(0, 0, 3.8)
      invalidate()
    }
  }, [reduced, camera, invalidate])

  useFrame((_, delta) => {
    if (reduced || pausedRef.current) return
    const group = groupRef.current
    if (!group) return

    const scrollP = Math.min(1, Math.max(0, scrollRef.current || 0))

    // 1. Sürekli Yavaş Dönüş (Hero durumunda)
    autoRotY.current += delta * BASE_ROTATION_SPEED

    // 2. Scroll-Linked Dive / Gazze'ye Doğru Hizalama:
    // Scroll ilerledikçe dönüş açısını Gazze'nin kameraya baktığı açıya kilitler
    const targetY = THREE.MathUtils.lerp(autoRotY.current, GAZA_FACING_Y, Math.min(1, scrollP * 2.2))
    group.rotation.y = targetY

    // 3. Mouse Parallax (Maksimum ~6-8 derece yumuşak eğim)
    const targetMouseX = (mouseRef.current?.x || 0) * (1 - scrollP)
    const targetMouseY = (mouseRef.current?.y || 0) * (1 - scrollP)

    currentTilt.current.x = THREE.MathUtils.lerp(currentTilt.current.x, targetMouseY * 0.12 + 0.12, 0.06)
    currentTilt.current.y = THREE.MathUtils.lerp(currentTilt.current.y, targetMouseX * 0.14, 0.06)

    group.rotation.x = currentTilt.current.x
    group.rotation.z = -currentTilt.current.y * 0.4

    // 4. Scroll-Linked Camera Zoom / Dive Animasyonu
    // Başlangıç: Z=3.8 (geniş dünya görünümü) -> Scroll ile Gazze koordinatına yaklaşır (Z=1.45)
    const zoomEase = Math.pow(scrollP, 1.8)
    const camZ = THREE.MathUtils.lerp(3.8, 1.45, zoomEase)
    const camY = THREE.MathUtils.lerp(0, 0.35, zoomEase)
    camera.position.set(0, camY, camZ)
    camera.lookAt(0, camY * 0.5, 0)

    // 5. Shader Zamanı & Scroll Parametresi
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      materialRef.current.uniforms.uScrollZoom.value = scrollP
    }
    if (atmoMaterialRef.current) {
      atmoMaterialRef.current.uniforms.uScrollZoom.value = scrollP
    }

    // 6. Sıcak Noktalar Pulsing Animasyonu
    const time = performance.now() * 0.001
    ringsRef.current.forEach((ring, idx) => {
      if (!ring) return
      // 2 saniyelik döngü
      const phase = ((time * 0.5 + idx * 0.25) % 1)
      const scale = 0.025 + phase * 0.08
      ring.scale.set(scale, scale, scale)
      const mat = ring.material as THREE.MeshBasicMaterial
      if (mat) mat.opacity = (1 - phase) * (1 - scrollP * 0.7) * 0.85
    })
  })

  return (
    <group ref={groupRef}>
      {/* ── 3D Earth Globe ── */}
      <mesh ref={earthMeshRef} rotation={[0, 0, 0]}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* ── Atmosphere Outer Fresnel Glow Mesh ── */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={atmoMaterialRef}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmoUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Hotspot Glow Sprites & Pulsing Wave Rings ── */}
      {glowTexture &&
        hotspotPositions.map((spot, i) => {
          const spriteScale = spot.primary ? 0.22 : 0.16

          return (
            <group key={spot.id} position={spot.position}>
              {/* Ateş Parıltısı Billboard Sprite (Sürekli Parlayan Sıcak Çekirdek) */}
              <sprite scale={[spriteScale, spriteScale, spriteScale]}>
                <spriteMaterial
                  map={glowTexture}
                  blending={THREE.AdditiveBlending}
                  transparent
                  depthWrite={false}
                  opacity={0.95}
                />
              </sprite>

              {/* Dışa Doğru Yayılan Sıcaklık Dalgası (Pulsing Ring) */}
              {ringTexture && (
                <mesh
                  ref={(el) => {
                    if (el) ringsRef.current[i] = el
                  }}
                  quaternion={new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1),
                    spot.normal
                  )}
                >
                  <planeGeometry args={[1, 1]} />
                  <meshBasicMaterial
                    map={ringTexture}
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
            </group>
          )
        })}
    </group>
  )
}

