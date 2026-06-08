'use client'

import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ============================================================
   EARTH MESH — tek sphere + tek ShaderMaterial.
   Tüm dünya gri/desatüre; yalnızca Filistin (Levant) bölgesi
   tam renkli + bayrak tonlu hâle. Işıklandırma yok (self-lit):
   döner küre kararmaz, Blue Marble texture'ı zaten gölgeli.
   ============================================================ */

// Filistin merkezi [lat 31.5, lon 34.9] → equirektangüler UV
// u = (lon+180)/360, v = (90-lat)/180 — three'nin UV konvansiyonuna
// göre tarayıcıda kalibre edilir (gerekirse bileşenler aynalanır).
const PALESTINE_UV = new THREE.Vector2(0.5969, 0.675)

// Dinlenme/başlangıç oryantasyonu: Filistin kameraya baksın.
// R = π/2 − 2π·u_P  (three SphereGeometry uv→world türetmesi)
const PALESTINE_FACING_Y = Math.PI / 2 - 2 * Math.PI * PALESTINE_UV.x // ≈ -2.18

// Sayfa boyunca scroll'un eklediği toplam dönüş
const SCROLL_TO_RAD = Math.PI * 1.5
// Sürekli yavaş kendi ekseninde dönüş (rad/sn)
const BASE_SPEED = 0.045

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2  uPalestineUV;
  uniform float uMaskRadius;
  uniform vec3  uGlowColor;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 earth = texture2D(uTexture, vUv).rgb;

    // Luminance → soğuk tonlu, hafif karartılmış gri (uzayda geri çekilir)
    float lum = dot(earth, vec3(0.299, 0.587, 0.114));
    vec3 gray = vec3(lum) * vec3(0.86, 0.92, 1.06);
    gray = mix(gray, vec3(0.02, 0.03, 0.05), 0.18);

    // Filistin maskesi — equirect yatay esnemesi için d.x *= 2
    vec2 d = vUv - uPalestineUV;
    d.x *= 2.0;
    float dist = length(d);
    float mask = 1.0 - smoothstep(uMaskRadius * 0.45, uMaskRadius, dist);

    // Renkli bölge biraz canlandırılır
    vec3 colored = clamp(earth * 1.10, 0.0, 1.0);
    vec3 col = mix(gray, colored, mask);

    // Bayrak tonlu yumuşak hâle — hafifçe nefes alır
    float pulse = 0.88 + 0.12 * sin(uTime * 0.7);
    float glow = (1.0 - smoothstep(0.0, uMaskRadius * 1.7, dist)) * 0.55 * pulse;
    col += uGlowColor * glow * mask;

    // Işıksız hacim: kameraya bakan yüz parlak, kenarlar koyu
    float facing = clamp(vNormal.z, 0.0, 1.0);
    col *= mix(0.74, 1.0, facing);

    gl_FragColor = vec4(col, 1.0);
  }
`

interface EarthMeshProps {
  scrollRef: RefObject<number>
  pausedRef: RefObject<boolean>
  reduced: boolean
}

export default function EarthMesh({
  scrollRef,
  pausedRef,
  reduced,
}: EarthMeshProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const auto = useRef(PALESTINE_FACING_Y)

  const texture = useLoader(THREE.TextureLoader, '/textures/earth-2k.jpg')
  const { gl, invalidate } = useThree()

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    texture.needsUpdate = true
  }, [texture, gl])

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uPalestineUV: { value: PALESTINE_UV },
      uMaskRadius: { value: 0.09 },
      uGlowColor: { value: new THREE.Color('#e02718') },
      uTime: { value: 0 },
    }),
    [texture]
  )

  // Reduced-motion: Filistin'e bakan tek statik kare
  useEffect(() => {
    if (reduced && mesh.current) {
      mesh.current.rotation.y = PALESTINE_FACING_Y
      invalidate()
    }
  }, [reduced, invalidate])

  useFrame((_, delta) => {
    if (reduced || pausedRef.current) return
    const m = mesh.current
    if (!m) return
    auto.current += delta * BASE_SPEED
    m.rotation.y = auto.current + scrollRef.current * SCROLL_TO_RAD
    if (material.current) material.current.uniforms.uTime.value += delta
  })

  return (
    <mesh ref={mesh} rotation={[0.12, PALESTINE_FACING_Y, 0]}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
