// components/ConsentModal.jsx
import NestaLogo from './NestaLogo'

export default function ConsentModal({ onAccept, onDecline, isLeaving }) {
  const items = [
    {
      ok: true,
      text: 'Your questions help shape future programs — used to understand what women in tech care about',
    },
    {
      ok: true,
      text: 'Everything is anonymised — your name, email and personal details are removed before anything is stored',
    },
    {
      ok: false,
      text: "No one will know it's you — no login, no tracking, and no way to identify you from your questions",
    },
  ]

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#faf7f5',
        opacity: isLeaving ? 0 : 1,
        transform: isLeaving ? 'translateY(-20px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        pointerEvents: isLeaving ? 'none' : 'auto',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* X button */}
      <button
        onClick={onDecline}
        style={{
          position: 'absolute', top: 16, right: 18,
          width: 32, height: 32, borderRadius: '50%',
          border: 'none', background: 'rgba(182,144,136,0.12)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#8a7572" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 32px' }}>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column' }}>

          {/* Logo + title */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <NestaLogo size={58} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2d2420', margin: '0 0 8px' }}>
              Before we chat
            </h2>
            <p style={{ fontSize: 12, color: '#8a7572', lineHeight: 1.65, margin: 0 }}>
              AAtI learns from conversations to improve programs for women like you.
            </p>
          </div>

          {/* Privacy items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: '20px', height: '20px', minWidth: '20px',
                  borderRadius: '50%',
                  background: item.ok ? '#edf5e8' : '#fdf0ee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '1px', flexShrink: 0,
                }}>
                  {item.ok ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#4a7a50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#a03030" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6"  y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </div>
                <p style={{ fontSize: 12, color: '#5a4a46', lineHeight: 1.6, margin: 0 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div style={{ height: '0.5px', background: 'rgba(182,144,136,0.3)', marginBottom: 22 }} />

          <button
            onClick={onAccept}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              border: 'none', background: '#b69088',
              color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Start chatting with AAtI
          </button>

          <p style={{ textAlign: 'center', fontSize: 10, color: '#d4c0bc', marginTop: 14 }}>
            You can change this anytime in settings
          </p>
        </div>
      </div>
    </div>
  )
}