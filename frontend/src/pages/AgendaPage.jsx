// pages/AgendaPage.jsx
import { useState, useMemo, useEffect } from 'react'
import { supabase, CHIP, B } from '../data/conference'

const SIMULATE_LIVE  = false
const SIMULATED_TIME = new Date('2026-05-30T18:05:00Z')

const FILTERS = ['All', 'Keynote', 'Workshop', 'Panel', 'Talk', 'Networking']

// ── Formatters — always English, always Montreal TZ ───────────────────────────
function fmtDate(date) {
  return date.toLocaleDateString('en-US', {
    timeZone: 'America/Montreal',
    weekday: 'short', month: 'short', day: 'numeric',
  })
}
function fmtTime(date) {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/Montreal',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function calcStatus(dateTimeISO, durationMinutes, now) {
  try {
    const start = new Date(dateTimeISO).getTime()
    const end   = start + durationMinutes * 60_000
    const t     = now.getTime()
    if (t >= start && t <= end) return 'live'
    if (t > end)                return 'past'
    return 'upcoming'
  } catch { return 'upcoming' }
}

// ── Render description with paragraph breaks ──────────────────────────────────
// Splits on \n\n (blank lines) and single \n for list-style lines
function DescriptionText({ text }) {
  if (!text) return null

  // Split into blocks by double newline first
  const blocks = text.trim().split(/\n\n+/)

  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean)

        // Detect bullet-style lines (no full stop at end, or start with what/how/why etc)
        // Heuristic: if block has multiple short lines, treat as a list
        const isList = lines.length > 1 && lines.every(l => l.length < 120)

        if (isList) {
          return (
            <ul key={bi} style={{ margin: '0 0 12px', paddingLeft: 18 }}>
              {lines.map((line, li) => (
                <li key={li} style={{ fontSize: 13, color: B.muted, lineHeight: 1.65, marginBottom: 3 }}>
                  {line}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={bi} style={{ fontSize: 13, color: B.muted, lineHeight: 1.65, margin: '0 0 12px' }}>
            {lines.join(' ')}
          </p>
        )
      })}
    </>
  )
}

// ── TypeChip ──────────────────────────────────────────────────────────────────
function TypeChip({ type }) {
  const safe       = type || 'Talk'
  const normalised = safe.charAt(0).toUpperCase() + safe.slice(1).toLowerCase()
  const c          = CHIP[normalised] || CHIP[safe] || { bg: '#f2e8e5', color: '#b69088' }
  return (
    <span style={{
      fontSize: 9, fontWeight: 700,
      padding: '2px 8px', borderRadius: 6,
      background: c.bg, color: c.color,
      display: 'inline-block',
    }}>
      {safe.toUpperCase()}
    </span>
  )
}

// ── Session detail sheet ──────────────────────────────────────────────────────
function DetailSheet({ session, onClose }) {
  if (!session) return null

  const isOnline = !!session.online_link

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(45,36,32,0.4)', backdropFilter: 'blur(5px)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative', background: B.cream,
        width: '100%', maxWidth: 448,
        borderRadius: '32px 32px 0 0',
        padding: '24px 20px',
        // ✅ safe-area-inset-bottom so content clears Safari toolbar
        paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 24px))',
        maxHeight: '90vh', overflowY: 'auto',
        zIndex: 110,
        animation: 'slideUp 0.28s ease',
        boxSizing: 'border-box',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: B.mutedLight, borderRadius: 2, margin: '0 auto 20px' }} />

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: B.muted, lineHeight: 1, padding: 4 }}>
          ✕
        </button>

        {/* Chip row — type + optional Online badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <TypeChip type={session.type} />
          {isOnline && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              padding: '2px 8px', borderRadius: 6,
              background: '#edf5e8', color: '#3d7040',
              display: 'inline-block',
            }}>
              ONLINE
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: B.charcoal, margin: '0 0 16px', lineHeight: 1.3 }}>
          {session.title}
        </h2>

        {/* Meta row */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '12px 0',
          borderTop: '0.5px solid rgba(182,144,136,0.15)',
          borderBottom: '0.5px solid rgba(182,144,136,0.15)',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: B.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: B.nesta }}>🕐</span>
            <strong style={{ color: B.charcoal }}>{session.dateDisplay}</strong>
            <span style={{ color: B.mutedLight }}>·</span>
            <span>{session.timeDisplay}</span>
          </div>
          <div style={{ fontSize: 11, color: B.muted, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ color: B.nesta, marginTop: 1 }}>📍</span>
            <span style={{ lineHeight: 1.4 }}>{session.location || 'TBD'}</span>
          </div>
          {session.speaker && session.speaker !== 'None' && (
            <div style={{ fontSize: 11, color: B.muted, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ color: B.nesta }}>👤</span>
              <span>{session.speaker}</span>
            </div>
          )}
        </div>

        {/* Description — rendered as paragraphs/lists */}
        {session.description && (
          <div style={{ marginBottom: isOnline ? 20 : 0 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: B.nesta,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              About this Session
            </div>
            <DescriptionText text={session.description} />
          </div>
        )}

        {/* ✅ Join Online button — shown only when online_link exists */}
        {isOnline && (
          <a
            href={session.online_link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 0',
              borderRadius: 12,
              background: B.nesta, color: '#fff',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            {/* Video camera icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Join Online Session
          </a>
        )}
      </div>
    </div>
  )
}

// ── Conflict block ────────────────────────────────────────────────────────────
function ConflictBlock({ sessions, onSelect }) {
  return (
    <div style={{ background: B.conflictBg, borderRadius: 14, overflow: 'hidden', border: '0.5px solid rgba(200,90,70,0.3)', borderLeft: `3px solid ${B.conflict}` }}>
      <div style={{ padding: '6px 12px', background: 'rgba(208,112,96,0.07)', borderBottom: '0.5px solid rgba(200,90,70,0.2)', fontSize: 10, color: B.conflictTxt, fontWeight: 600 }}>
        {sessions.length} sessions at the same time — pick one
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {sessions.map((s, i) => (
          <div key={s.id || i} onClick={() => onSelect(s)} style={{ padding: '10px 11px', borderRight: i < sessions.length - 1 ? '0.5px solid rgba(200,90,70,0.15)' : 'none', cursor: 'pointer' }}>
            <div style={{ marginBottom: 4 }}><TypeChip type={s.type} /></div>
            <div style={{ fontSize: 11, fontWeight: 600, color: B.charcoal, lineHeight: 1.35, marginBottom: 4 }}>{s.title}</div>
            {s.speaker && s.speaker !== 'None' && <div style={{ fontSize: 9, color: B.muted }}>{s.speaker}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({ session, onSelect }) {
  const isLive   = session.status === 'live'
  const isPast   = session.status === 'past'
  const isOnline = !!session.online_link

  return (
    <div
      onClick={() => onSelect(session)}
      style={{
        padding: '11px 13px',
        background: isLive ? '#fffaf9' : B.white,
        borderRadius: 14,
        border: `0.5px solid ${isLive ? 'rgba(182,144,136,0.5)' : 'rgba(182,144,136,0.2)'}`,
        ...(isLive ? { borderLeft: `3px solid ${B.nesta}` } : {}),
        opacity: isPast ? 0.6 : 1,
        marginBottom: 8, cursor: 'pointer',
      }}
    >
      {/* Type chip + optional Online badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <TypeChip type={session.type} />
        {isOnline && (
          <span style={{
            fontSize: 8, fontWeight: 700,
            padding: '2px 6px', borderRadius: 5,
            background: '#edf5e8', color: '#3d7040',
          }}>
            ONLINE
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 6, color: isPast ? B.muted : B.charcoal }}>
        {session.title}
      </div>

      {/* Location + speaker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 10, color: B.muted, flex: 1, lineHeight: 1.4 }}>
          {session.location || 'TBD'}
        </span>
        {session.speaker && session.speaker !== 'None' && (
          <span style={{ fontSize: 10, color: B.muted, textAlign: 'right', fontWeight: 500, flex: 1, lineHeight: 1.4, wordBreak: 'break-word' }}>
            {session.speaker}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [filter,     setFilter]     = useState('All')
  const [selected,   setSelected]   = useState(null)
  const [agendaData, setAgendaData] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [now,        setNow]        = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('conference')
          .select('*')
          .order('date_time', { ascending: true })
        if (error) throw error
        if (data) setAgendaData(data)
      } catch (err) {
        console.error('AgendaPage fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const currentTime = SIMULATE_LIVE ? SIMULATED_TIME : now

  const processedAgenda = useMemo(() => {
    return agendaData.map(item => {
      const startDate       = new Date(item.date_time)
      const durationMinutes = item.duration_minutes || 30
      const endDate         = new Date(startDate.getTime() + durationMinutes * 60_000)

      const dateDisplay = fmtDate(startDate)
      const startStr    = fmtTime(startDate)
      const endStr      = fmtTime(endDate)
      const timeDisplay = `${startStr} – ${endStr}`
      const status      = calcStatus(item.date_time, durationMinutes, currentTime)

      return {
        ...item,
        type:         item.session_type || item.type || 'Talk',
        dateDisplay,
        timeDisplay,
        groupKey:     `${dateDisplay} · ${startStr}`,
        startTimeRaw: startDate.getTime(),
        status,
        // ✅ Pass online_link through — it comes from Supabase select('*')
        online_link:  item.online_link || null,
      }
    })
  }, [agendaData, currentTime])

  const grouped = useMemo(() => {
    const filtered = filter === 'All'
      ? processedAgenda
      : processedAgenda.filter(s => (s.type || '').toLowerCase() === filter.toLowerCase())

    const map = new Map()
    const sorted = [...filtered].sort((a, b) => a.startTimeRaw - b.startTimeRaw)
    sorted.forEach(s => {
      if (!map.has(s.groupKey)) map.set(s.groupKey, [])
      map.get(s.groupKey).push(s)
    })
    return Array.from(map.entries())
  }, [filter, processedAgenda])

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', color: B.muted, textAlign: 'center', fontSize: 13 }}>
        Loading sessions…
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto" style={{ padding: '14px 16px 100px', background: B.cream }}>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
          {FILTERS.map(f => {
            const active = filter === f
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                flexShrink: 0, padding: '5px 13px', borderRadius: 16,
                border: `0.5px solid ${active ? B.nesta : 'rgba(182,144,136,0.35)'}`,
                background: active ? B.nesta : 'transparent',
                color: active ? '#fff' : B.muted,
                fontSize: 10, fontWeight: 600, cursor: 'pointer', lineHeight: '1.4',
              }}>
                {f}
              </button>
            )
          })}
        </div>

        {/* Time blocks */}
        {grouped.length === 0 ? (
          <div style={{ color: B.muted, fontSize: 12, textAlign: 'center', marginTop: 40 }}>
            No sessions in this category.
          </div>
        ) : (
          grouped.map(([groupKey, sessions]) => {
            const isLive     = sessions.some(s => s.status === 'live')
            const isPast     = sessions.every(s => s.status === 'past')
            const isConflict = sessions.length > 1

            return (
              <div key={groupKey} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  {isLive && (
                    <>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: B.nesta, animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: B.nesta, letterSpacing: '0.05em' }}>LIVE NOW</span>
                    </>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, color: isLive ? B.nesta : isPast ? '#c0aeaa' : '#5a4a46' }}>
                    {groupKey}
                  </span>
                  {isConflict && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: '#fff5f3', padding: '2px 8px', borderRadius: 10, border: '0.5px solid rgba(200,90,70,0.3)' }}>
                      <span style={{ fontSize: 9, color: B.conflictTxt, fontWeight: 700 }}>⚠ Scheduling conflict</span>
                    </div>
                  )}
                </div>

                {isConflict
                  ? <ConflictBlock sessions={sessions} onSelect={setSelected} />
                  : sessions.map((s, idx) => <SessionCard key={s.id || idx} session={s} onSelect={setSelected} />)
                }
              </div>
            )
          })
        )}
      </div>

      <DetailSheet session={selected} onClose={() => setSelected(null)} />
    </>
  )
}