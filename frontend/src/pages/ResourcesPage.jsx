// pages/ResourcesPage.jsx
import { useState, useEffect } from 'react'
import { fetchAllResources } from '../data/resources'
import { B } from '../data/conference'

const FILTERS = ['All', 'Intelligent Nest', 'MamaNest', 'Conference', 'The Nest']

const TAB_ACCENT = {
  'Intelligent Nest': '#9b5de5',
  'MamaNest':         '#876f8f',
  'Conference':       '#4d675c',
  'The Nest':         '#af9caf',
  'All':              B.nesta,
}

function ResourceCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const [imgErr,   setImgErr]   = useState(false)
  const hasDescription = !!item.description

  return (
    <div style={{
      background: B.white, borderRadius: 14,
      border: '0.5px solid rgba(182,144,136,0.2)',
      borderLeft: `3px solid ${item.pc}`,
      marginBottom: 10, overflow: 'hidden',
    }}>
      {/* Collapsed row */}
      <div
        onClick={() => hasDescription && setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: hasDescription ? 'pointer' : 'default' }}
      >
        <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 10, background: item.pl, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {item.logo && !imgErr ? (
            <img src={item.logo} alt={item.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
          ) : (
            <span style={{ fontSize: 13, fontWeight: 700, color: item.pc }}>{item.name.charAt(0)}</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-block', fontSize: 7, fontWeight: 700, color: item.pc, background: item.pl, padding: '1px 6px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
            {item.category}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: B.charcoal, lineHeight: 1.3, marginBottom: 3 }}>
            {item.name}
          </div>
          {hasDescription && !expanded && (
            <div style={{ fontSize: 11, color: B.muted, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.description}
            </div>
          )}
        </div>

        {hasDescription && (
          <div style={{ flexShrink: 0, color: B.mutedLight, fontSize: 16, transition: 'transform 0.22s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', lineHeight: 1 }}>
            ⌄
          </div>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: `0.5px solid ${item.pl}`, animation: 'slideDown 0.2s ease' }}>
          <p style={{ fontSize: 12, color: B.muted, lineHeight: 1.65, margin: '12px 0 14px' }}>
            {item.description}
          </p>
          {item.url ? (
            <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 16px', borderRadius: 20, background: item.pc, color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
              {item.cta} ↗
            </a>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 16px', borderRadius: 20, background: item.pc, color: '#fff', fontSize: 11, fontWeight: 600 }}>
              {item.cta} →
            </div>
          )}
        </div>
      )}

      {!hasDescription && item.url && (
        <div style={{ padding: '0 14px 12px' }}>
          <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 14px', borderRadius: 20, background: item.pc, color: '#fff', fontSize: 10, fontWeight: 600, textDecoration: 'none' }}>
            {item.cta} ↗
          </a>
        </div>
      )}
    </div>
  )
}

export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [filter,    setFilter]    = useState('All')
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetchAllResources()
      .then(setResources)
      .catch(() => setResources([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? resources : resources.filter(r => r.category === filter)

  if (loading) {
    return <div style={{ padding: '60px 20px', color: B.muted, textAlign: 'center', fontSize: 13 }}>Loading resources…</div>
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 100px', background: B.cream }}>

      {/* Section label — no logo, just text */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: B.muted,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        marginBottom: 14,
      }}>
        Programs & Resources · Her Career Conference
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {FILTERS.map(f => {
          const active = filter === f
          const accent = TAB_ACCENT[f] || B.nesta
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              flexShrink: 0, padding: '5px 13px', borderRadius: 16,
              border: `0.5px solid ${active ? accent : 'rgba(182,144,136,0.35)'}`,
              background: active ? accent : 'transparent',
              color: active ? '#fff' : B.muted,
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
              lineHeight: '1.4', whiteSpace: 'nowrap',
            }}>
              {f}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: B.muted, fontSize: 12, textAlign: 'center', marginTop: 40 }}>No resources in this category yet.</div>
      ) : (
        filtered.map(item => <ResourceCard key={item.id} item={item} />)
      )}
    </div>
  )
}