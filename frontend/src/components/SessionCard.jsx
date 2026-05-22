// components/SessionCard.jsx
// Reusable card for individual agenda sessions.

const CHIP = {
  Keynote:    { bg: '#fdf0ee', color: '#9e5e54' },
  Workshop:   { bg: '#f1e4ff', color: '#9b5de5' },
  Panel:      { bg: '#edf5e8', color: '#3d7040' },
  Talk:       { bg: '#faf3e5', color: '#7a6030' },
  Networking: { bg: '#f4f1f4', color: '#876f8f' },
  Break:      { bg: '#f5f5f5', color: '#9a9a9a' },
}

function TypeChip({ type }) {
  const normalised = (type || 'Talk').charAt(0).toUpperCase() + (type || 'talk').slice(1).toLowerCase()
  const c          = CHIP[normalised] || { bg: '#f2e8e5', color: '#b69088' }
  return (
    <span style={{
      fontSize: 9, fontWeight: 700,
      padding: '2px 8px', borderRadius: 6,
      background: c.bg, color: c.color,
      display: 'inline-block',
    }}>
      {(type || 'TALK').toUpperCase()}
    </span>
  )
}

export default function SessionCard({ session, onSelect }) {
  const isLive = session.status === 'live'
  const isPast = session.status === 'past'

  return (
    <div
      onClick={() => onSelect?.(session)}
      style={{
        padding: '11px 13px',
        background: isLive ? '#fffaf9' : '#ffffff',
        borderRadius: 14,
        border: `0.5px solid ${isLive ? 'rgba(182,144,136,0.5)' : 'rgba(182,144,136,0.2)'}`,
        ...(isLive ? { borderLeft: '3px solid #b69088' } : {}),
        opacity: isPast ? 0.6 : 1,
        marginBottom: 8, cursor: onSelect ? 'pointer' : 'default',
      }}
    >
      <div style={{ marginBottom: 6 }}>
        <TypeChip type={session.type} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 6, color: isPast ? '#8a7572' : '#2d2420' }}>
        {session.title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 10, color: '#8a7572', flex: 1, lineHeight: 1.4 }}>
          {session.location || 'TBD'}
        </span>
        {session.speaker && session.speaker !== 'None' && (
          <span style={{ fontSize: 10, color: '#8a7572', textAlign: 'right', fontWeight: 500, flex: 1, lineHeight: 1.4, wordBreak: 'break-word' }}>
            {session.speaker}
          </span>
        )}
      </div>
    </div>
  )
}