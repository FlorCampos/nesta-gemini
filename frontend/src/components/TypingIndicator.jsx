// components/TypingIndicator.jsx
import NestaLogo from './NestaLogo'

export default function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      paddingLeft: 4,
    }}>
      {/* Nesta logo avatar */}
      <div style={{ flexShrink: 0, marginBottom: 2 }}>
        <NestaLogo size={26} />
      </div>

      {/* Bubble with dots + text */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: '#ffffff',
        border: '0.5px solid rgba(182,144,136,0.25)',
        borderRadius: '14px 14px 14px 3px',
      }}>
        {/* Bouncing dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[0, 150, 300].map(delay => (
            <div
              key={delay}
              style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: '#b69088',
                animation: `bounce 1s ease-in-out ${delay}ms infinite`,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <span style={{
          fontSize: 12,
          color: '#b69088',
          fontStyle: 'italic',
        }}>
          Nesta is thinking...
        </span>
      </div>
    </div>
  )
}