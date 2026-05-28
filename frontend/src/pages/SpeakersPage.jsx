// pages/SpeakersPage.jsx
import { useState, useEffect, useMemo, useRef } from 'react'
import { fetchAllSpeakers } from '../data/speakers'
import { B, ROLE_CHIP } from '../data/conference'

function getInitials(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ speaker, size = 48 }) {
  const [imgError, setImgError] = useState(false)
  const hues  = ['#b69088','#9b5de5','#876f8f','#4d675c','#94aa82','#af9caf','#c4a065']
  const color = hues[(speaker.name || '').charCodeAt(0) % hues.length]

  if (speaker.photo && !imgError) {
    return (
      <img
        src={speaker.photo}
        alt={speaker.name}
        onError={() => setImgError(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
          border: `1.5px solid ${B.nestaLight}`,
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '22', border: `1px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 700, color }}>
        {getInitials(speaker.name)}
      </span>
    </div>
  )
}

// ── Role badge — only renders if role is a known value ────────────────────────
function RoleBadge({ role }) {
  // ✅ Don't render if role is empty, undefined, or not in ROLE_CHIP
  if (!role || !ROLE_CHIP[role]) return null
  const c = ROLE_CHIP[role]
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
      background: c.bg, color: c.color,
      textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
    }}>
      {role}
    </span>
  )
}

// ── Speaker detail bottom sheet ───────────────────────────────────────────────
function SpeakerSheet({ speaker, onClose }) {
  const sheetRef   = useRef(null)
  const touchStart = useRef(null)

  // ✅ Swipe-down to close — tracks touch on the whole sheet
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return
    const delta = e.changedTouches[0].clientY - touchStart.current
    // If swiped down more than 60px, close
    if (delta > 60) onClose()
    touchStart.current = null
  }

  if (!speaker) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(45,36,32,0.4)', backdropFilter: 'blur(5px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          background: B.cream,
          width: '100%', maxWidth: 448,
          borderRadius: '32px 32px 0 0',
          padding: '24px 22px 0',
          paddingBottom: 'calc(52px + env(safe-area-inset-bottom, 34px))',
          maxHeight: '90vh', overflowY: 'auto',
          zIndex: 210,
          boxSizing: 'border-box',
        }}
      >
        {/* ✅ Handle — wider touch target, cursor hint */}
        <div
          style={{
            width: 40, height: 5, background: B.mutedLight, borderRadius: 3,
            margin: '0 auto 22px', cursor: 'grab',
          }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 22, right: 22,
            border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: 18, color: B.muted, lineHeight: 1, padding: 4,
          }}
        >
          ✕
        </button>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <Avatar speaker={speaker} size={72} />
          <div style={{ flex: 1 }}>
            {/* ✅ RoleBadge only shows if role is a known conference role */}
            <RoleBadge role={speaker.conferenceRole} />
            <h2 style={{
              fontSize: 20, fontWeight: 700, color: B.charcoal,
              // Remove top margin if no badge is shown
              margin: speaker.conferenceRole && ROLE_CHIP[speaker.conferenceRole] ? '6px 0 3px' : '0 0 3px',
              lineHeight: 1.25,
            }}>
              {speaker.name}
            </h2>
            <p style={{ fontSize: 11, color: B.muted, margin: 0, lineHeight: 1.45 }}>
              {[speaker.jobTitle, speaker.company].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        {/* Session */}
        {speaker.sessionTitle && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '12px 0',
            borderTop: '0.5px solid rgba(182,144,136,0.15)',
            borderBottom: '0.5px solid rgba(182,144,136,0.15)',
            marginBottom: 18,
          }}>
            <span style={{ color: B.nesta, fontSize: 14, flexShrink: 0, marginTop: 1 }}>📅</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: B.nesta, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 3 }}>
                Session
              </div>
              <div style={{ fontSize: 12, color: B.charcoal, fontWeight: 500, lineHeight: 1.4 }}>
                {speaker.sessionTitle}
              </div>
              {speaker.sessionTime && (() => {
                const dt = new Date(speaker.sessionTime)
                const day = dt.toLocaleDateString('en-US', { timeZone: 'America/Montreal', weekday: 'long' })
                const date = dt.toLocaleDateString('en-US', { timeZone: 'America/Montreal', day: 'numeric', month: 'long' })
                const time = dt.toLocaleTimeString('en-US', { timeZone: 'America/Montreal', hour: '2-digit', minute: '2-digit', hour12: false })
                const isOnline = dt.getMonth() === 5 // June = month 5 (0-indexed)
                const format = isOnline ? 'Online' : 'In Person'
                return (
                  <div style={{ fontSize: 10, color: B.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{day} {date}</span>
                    <span style={{ color: B.mutedLight }}>|</span>
                    <span>{time}</span>
                    <span style={{ color: B.mutedLight }}>|</span>
                    <span style={{
                      color: isOnline ? '#9b5de5' : '#3d7040',
                      fontWeight: 600,
                    }}>{format}</span>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Bio */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: B.nesta, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
            Bio
          </div>
          {(speaker.bio || '').split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i} style={{ fontSize: 13, color: B.muted, lineHeight: 1.65, margin: '0 0 10px' }}>
              {para}
            </p>
          ))}
        </div>

        {/* LinkedIn CTA */}
        {speaker.linkedin ? (
          <a
            href={speaker.linkedin.startsWith('http') ? speaker.linkedin : `https://${speaker.linkedin}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: 14, borderRadius: 12,
              background: B.nesta, color: '#fff',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            View LinkedIn Profile ↗
          </a>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', padding: 14, borderRadius: 12,
            border: '0.5px solid rgba(182,144,136,0.3)',
            color: B.mutedLight, fontSize: 12,
            boxSizing: 'border-box',
          }}>
            LinkedIn profile coming soon
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SpeakersPage() {
  const [speakers,        setSpeakers]        = useState([])
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [searchQuery,     setSearchQuery]     = useState('')
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)

  useEffect(() => {
    fetchAllSpeakers()
      .then(setSpeakers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return speakers
    return speakers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.jobTitle || '').toLowerCase().includes(q) ||
      (s.company  || '').toLowerCase().includes(q)
    )
  }, [searchQuery, speakers])

  if (loading) {
    return <div style={{ padding: '60px 20px', color: B.muted, textAlign: 'center', fontSize: 13 }}>Loading speakers…</div>
  }
  if (error) {
    return <div style={{ padding: '40px 20px', color: B.conflictTxt, textAlign: 'center', fontSize: 13 }}>Could not load speakers. Please try again.</div>
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 100px', background: B.cream }}>

        {/* Section label */}
        <div style={{ fontSize: 10, fontWeight: 700, color: B.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          {speakers.length} Speaker{speakers.length !== 1 ? 's' : ''} · Her Career Conference
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search speakers…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 36px 10px 14px',
              fontSize: '16px',
              borderRadius: 12,
              border: '0.5px solid rgba(182,144,136,0.3)',
              background: B.white, color: B.charcoal,
              outline: 'none',
            }}
            onFocus={e => (e.target.style.border = `0.5px solid ${B.nesta}`)}
            onBlur={e  => (e.target.style.border = '0.5px solid rgba(182,144,136,0.3)')}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', color: B.muted, cursor: 'pointer', fontSize: 13,
              }}
            >✕</button>
          ) : (
            <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: B.mutedLight, fontSize: 13, pointerEvents: 'none' }}>
              ⌕
            </span>
          )}
        </div>

        {/* Speaker list */}
        {filtered.length === 0 ? (
          <div style={{ color: B.muted, fontSize: 12, textAlign: 'center', marginTop: 40 }}>No speakers match your search.</div>
        ) : (
          filtered.map(sp => (
            <div
              key={sp.id}
              onClick={() => setSelectedSpeaker(sp)}
              style={{
                padding: '13px 14px', background: B.white,
                borderRadius: 14, border: '0.5px solid rgba(182,144,136,0.2)',
                marginBottom: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 13,
              }}
            >
              <Avatar speaker={sp} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: B.charcoal }}>{sp.name}</span>
                  <RoleBadge role={sp.conferenceRole} />
                </div>
                <div style={{ fontSize: 10, color: B.muted, lineHeight: 1.4, marginBottom: sp.sessionTitle ? 5 : 0 }}>
                  {[sp.jobTitle, sp.company].filter(Boolean).join(' · ')}
                </div>
                {sp.sessionTitle && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: B.nesta }}>📅</span>
                    <span style={{ fontSize: 9, color: B.nesta, fontWeight: 500 }}>{sp.sessionTitle}</span>
                  </div>
                )}
              </div>
              <span style={{ color: B.mutedLight, fontSize: 18, flexShrink: 0, fontWeight: 300 }}>›</span>
            </div>
          ))
        )}
      </div>

      <SpeakerSheet speaker={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} />
    </>
  )
}