// components/MessageBubble.jsx
import NestaLogo from './NestaLogo'

function formatText(text) {
  if (!text) return text
  const lines = text.split('\n')
  const result = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isBullet = line.trim().startsWith('•')

    if (line.trim() === '') continue  // skip all empty lines

    if (isBullet) {
      result.push(<div key={i} style={{ paddingLeft: 8, marginTop: 4, marginBottom: 4 }}>{line}</div>)
    } else {
      result.push(<span key={i}>{line} </span>)
    }
  }

  return result
}

export default function MessageBubble({ message }) {
  const isNesta = message.sender === 'nesta'
  if (isNesta && !message.text) return null
  if (isNesta) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingLeft: 4, paddingRight: 16 }}>
        <div style={{ flexShrink: 0, marginBottom: 2 }}>
          <NestaLogo size={26} />
        </div>
        <div style={{
          maxWidth: '78%', padding: '10px 13px',
          background: '#ffffff',
          border: '0.5px solid rgba(182,144,136,0.25)',
          borderRadius: '14px 14px 14px 3px',
          fontSize: 13, color: '#2d2420', lineHeight: 1.6,
          wordBreak: 'break-word',
        }}>
          {message.text && message.text.includes('•') ? formatText(message.text) : message.text}
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 48, paddingRight: 4 }}>
      <div style={{
        maxWidth: '78%', padding: '10px 13px',
        background: '#b69088',
        borderRadius: '14px 14px 3px 14px',
        fontSize: 13, color: '#ffffff', lineHeight: 1.6,
        wordBreak: 'break-word',
      }}>
        {message.text}
      </div>
    </div>
  )
}