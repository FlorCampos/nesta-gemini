// components/MemberCard.jsx
// Team member card for the Showcase screen.
// Expects: { name, role, photo, skills[], color, linkedin, portfolio }
import { useState } from 'react'

const AVATAR_COLORS = ['#b69088','#9b5de5','#876f8f','#4d675c','#94aa82','#af9caf']

function Avatar({ member, size = 48 }) {
  const [err, setErr] = useState(false)
  const color = member.color || AVATAR_COLORS[(member.name || '').charCodeAt(0) % AVATAR_COLORS.length]
  const initials = (member.name || '?').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()

  if (member.photo && !err) {
    return (
      <img
        src={member.photo} alt={member.name}
        onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `1px solid ${color}55` }}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: color + '22', border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 700, color }}>{initials}</span>
    </div>
  )
}

export default function MemberCard({ member, onSelect }) {
  return (
    <div
      onClick={() => onSelect?.(member)}
      style={{ padding: '13px 14px', background: '#ffffff', borderRadius: 14, border: '0.5px solid rgba(182,144,136,0.2)', marginBottom: 10, cursor: onSelect ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Avatar member={member} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#2d2420', marginBottom: 2 }}>{member.name}</div>
          <div style={{ fontSize: 10, color: '#8a7572' }}>{member.role}</div>
        </div>

        {/* External links */}
        <div style={{ display: 'flex', gap: 8 }}>
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#0a66c2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          )}
          {member.portfolio && (
            <a href={member.portfolio} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8a7572" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Skills */}
      {member.skills && member.skills.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {member.skills.map(sk => (
            <span key={sk} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 6, background: '#f2e8e5', color: '#7a4e48', fontWeight: 500 }}>
              {sk}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}