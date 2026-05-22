// components/SpeakerCard.jsx

import { useState } from 'react'

const ROLE_CHIP = {
  Host:                   { bg: '#fdf0ee', color: '#9e5e54' },
  Panelist:               { bg: '#edf5e8', color: '#3d7040' },
  'Workshop Facilitator': { bg: '#f1e4ff', color: '#9b5de5' },
  Speaker:                { bg: '#faf3e5', color: '#7a6030' },
  Closing:                { bg: '#f4f1f4', color: '#876f8f' },
}

const AVATAR_COLORS = ['#b69088','#9b5de5','#876f8f','#4d675c','#94aa82','#af9caf','#c4a065']

function Avatar({ speaker, size = 48 }) {
  const [err, setErr] = useState(false)
  const color = AVATAR_COLORS[(speaker.name || '').charCodeAt(0) % AVATAR_COLORS.length]

  if (speaker.photo && !err) {
    return (
      <img
        src={speaker.photo} alt={speaker.name}
        onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid #f2e8e5' }}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: color + '22', border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 700, color }}>
        {(speaker.name || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()}
      </span>
    </div>
  )
}

function RoleBadge({ role }) {
  const c = ROLE_CHIP[role] || { bg: '#f2e8e5', color: '#b69088' }
  return (
    <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: c.bg, color: c.color, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
      {role}
    </span>
  )
}

export default function SpeakerCard({ speaker, onSelect }) {
  return (
    <div
      onClick={() => onSelect?.(speaker)}
      style={{ padding: '13px 14px', background: '#ffffff', borderRadius: 14, border: '0.5px solid rgba(182,144,136,0.2)', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13 }}
    >
      <Avatar speaker={speaker} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#2d2420' }}>{speaker.name}</span>
          <RoleBadge role={speaker.conferenceRole || 'Speaker'} />
        </div>
        <div style={{ fontSize: 10, color: '#8a7572', lineHeight: 1.4, marginBottom: speaker.sessionTitle ? 5 : 0 }}>
          {speaker.jobTitle || ''}
        </div>
        {speaker.sessionTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: '#b69088' }}>📅</span>
            <span style={{ fontSize: 9, color: '#b69088', fontWeight: 500 }}>{speaker.sessionTitle}</span>
          </div>
        )}
      </div>
      <span style={{ color: '#d4c0bc', fontSize: 20, flexShrink: 0, fontWeight: 300 }}>›</span>
    </div>
  )
}