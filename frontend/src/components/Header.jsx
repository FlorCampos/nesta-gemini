// components/Header.jsx
export default function Header() {
  return (
    <div style={{
      background: '#faf7f5',
      borderBottom: '0.5px solid rgba(182,144,136,0.3)',
      padding: '11px 18px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flexShrink: 0,
    }}>
      {/* AAtI Secondary logo — bigger for mobile readability */}
      <img
        src="/AAtI-Secondary.png"
        alt="AAtI"
        style={{
          height: 32,        // was 32 — now bigger and more prominent
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'left center',
          display: 'block',
        }}
      />

      {/* Tagline */}
      <div style={{
        fontSize: 10,
        fontStyle: 'italic',
        color: '#8a7572',
        lineHeight: 1.3,
        paddingLeft: 1,
      }}>
        Her Future, Guided.
      </div>
    </div>
  )
}