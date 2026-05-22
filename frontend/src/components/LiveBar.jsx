// components/LiveBar.jsx
// Shows the currently-live conference session.
// Fetches from Supabase every 60 s and derives status from date_time + duration_minutes.
import { useState, useEffect } from 'react'
import { supabase } from '../data/conference'

function getLiveSession(sessions, now = new Date()) {
  const t = now.getTime()
  return sessions.find(s => {
    try {
      const start = new Date(s.date_time).getTime()
      const end   = start + (s.duration_minutes || 30) * 60_000
      return t >= start && t <= end
    } catch { return false }
  }) || null
}

function getNextSession(sessions, now = new Date()) {
  const t = now.getTime()
  return [...sessions]
    .filter(s => { try { return new Date(s.date_time).getTime() > t } catch { return false } })
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))[0] || null
}

export default function LiveBar() {
  const [sessions,    setSessions]    = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Refresh time every 30 s so live status stays accurate
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Fetch sessions once on mount (data rarely changes during the event)
  useEffect(() => {
    supabase
      .from('conference')
      .select('id, title, date_time, duration_minutes, session_type')
      .then(({ data }) => { if (data) setSessions(data) })
  }, [])

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  const liveSession = getLiveSession(sessions, currentTime)
  const nextSession = !liveSession ? getNextSession(sessions, currentTime) : null

  // Nothing to show if we have no data yet and there's no live/next session
  if (!liveSession && !nextSession) return null

  const label      = liveSession ? 'Happening now' : 'Up next'
  const title      = liveSession ? liveSession.title : nextSession?.title
  const isLive     = !!liveSession
  const dotColor   = isLive ? '#b69088' : '#c0aeaa'
  const labelColor = isLive ? '#b69088' : '#9a9a9a'

  return (
    <div
      className="mx-4 mb-2 px-4 py-2.5 rounded-xl flex items-center justify-between"
      style={{ background: isLive ? '#fff9f8' : '#f5f5f5', border: `0.5px solid ${isLive ? 'rgba(182,144,136,0.25)' : 'rgba(0,0,0,0.05)'}` }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Status dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: dotColor, flexShrink: 0,
        }} />

        <div className="min-w-0">
          <div style={{ fontSize: 9, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>
            {label}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#2d2420', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 210 }}>
            {title || '—'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#b69088', fontWeight: 500, flexShrink: 0, marginLeft: 8 }}>
        {timeString}
      </div>
    </div>
  )
}