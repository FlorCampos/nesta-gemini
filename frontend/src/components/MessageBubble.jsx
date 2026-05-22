// components/MessageBubble.jsx
import NestaLogo from './NestaLogo'

export default function MessageBubble({ message }) {
  const isNesta = message.sender === 'nesta'

  if (isNesta && !message.text) return null

  if (isNesta) {
    return (
      // Row: avatar bottom-aligned + bubble
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',   
        gap: 8,
        paddingLeft: 4,
        paddingRight: 16,         
      }}>
        {/* Nesta logo avatar — 26 px, aligned to bottom of bubble */}
        <div style={{ flexShrink: 0, marginBottom: 2 }}>
          <NestaLogo size={26} />
        </div>

        {/* Bubble */}
        <div style={{
          maxWidth: '78%',
          padding: '10px 13px',
          background: '#ffffff',
          border: '0.5px solid rgba(182,144,136,0.25)',
          borderRadius: '14px 14px 14px 3px',   // sharp bottom-left = tail side
          fontSize: 13,
          color: '#2d2420',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}>
          {message.text}
        </div>
      </div>
    )
  }


  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      paddingLeft: 48,            
      paddingRight: 4,
    }}>
      <div style={{
        maxWidth: '78%',
        padding: '10px 13px',
        background: '#b69088',
        borderRadius: '14px 14px 3px 14px',   
        fontSize: 13,
        color: '#ffffff',
        lineHeight: 1.6,
        wordBreak: 'break-word',
      }}>
        {message.text}
      </div>
    </div>
  )
}