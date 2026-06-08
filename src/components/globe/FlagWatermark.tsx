/* ============================================================
   FLAG WATERMARK — dünya ile içerik arasında çok ince
   Filistin bayrağı deseni (filigran). Boşluklu tile → Image #3
   benzeri bayrak grid'i hissi. Sabit, tıklanamaz, düşük opaklık.
   ============================================================ */

// Tek bayrak (üçgen + bantlar), etrafında şeffaf boşluk → grid aralığı
const FLAG_TILE = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='104' viewBox='0 0 128 104'>
  <g transform='translate(28 28)'>
    <rect width='72' height='16' fill='#000000'/>
    <rect y='16' width='72' height='16' fill='#ffffff'/>
    <rect y='32' width='72' height='16' fill='#007A3D'/>
    <path d='M0 0 L30 24 L0 48 Z' fill='#CE1126'/>
  </g>
</svg>`

const dataUri = `url("data:image/svg+xml,${encodeURIComponent(FLAG_TILE)}")`

export default function FlagWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{
        backgroundImage: dataUri,
        backgroundRepeat: 'repeat',
        backgroundSize: '132px 108px',
        opacity: 0.035,
        mixBlendMode: 'screen',
      }}
    />
  )
}
