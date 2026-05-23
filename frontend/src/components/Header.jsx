// components/Header.jsx
import NestaLogo from './NestaLogo'

export default function Header() {
  return (
    <div
      style={{
        background: '#faf7f5',
        borderBottom: '0.5px solid rgba(182,144,136,0.3)',
        padding: '12px 18px 11px',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        flexShrink: 0,
      }}
    >
      {/* Real Nesta SVG mark — bigger for mobile */}
      <NestaLogo size={40} />

      <div>
        {/* App name — bigger & bolder */}
        <div style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#b69088',
          lineHeight: '1.2',
          letterSpacing: '-0.01em',
        }}>
          Nesta
        </div>
        {/* Tagline */}
        <div style={{
          fontSize: 11,
          fontStyle: 'italic',
          color: '#8a7572',
          lineHeight: '1.3',
          marginTop: 1,
        }}>
          Her Future, Guided.
        </div>
      </div>
    </div>
  )
}