// components/ResourceCard.jsx

export default function ResourceCard({ item }) {
  const { pc = '#b69088', pl = '#f2e8e5' } = item

  return (
    <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: 14, border: '0.5px solid rgba(182,144,136,0.2)', borderLeft: `3px solid ${pc}`, marginBottom: 10 }}>
      {/* Category badge */}
      <div style={{ display: 'inline-block', fontSize: 8, fontWeight: 700, color: pc, background: pl, padding: '2px 8px', borderRadius: 6, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {item.category}
      </div>

      {/* Tagline */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#2d2420', lineHeight: 1.35, marginBottom: 4 }}>
        {item.tagline}
      </div>

      {/* Program name */}
      <div style={{ fontSize: 11, color: pc, fontWeight: 600, marginBottom: 3 }}>
        {item.program_name}
      </div>

      {/* Sub-description */}
      <div style={{ fontSize: 10, color: '#8a7572', marginBottom: 10 }}>
        {item.sub_description}
      </div>

      {/* CTA */}
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 14px', borderRadius: 20, background: pc, color: '#fff', fontSize: 10, fontWeight: 600, textDecoration: 'none' }}
        >
          {item.cta_label} ↗
        </a>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 14px', borderRadius: 20, background: pc, color: '#fff', fontSize: 10, fontWeight: 600 }}>
          {item.cta_label} →
        </div>
      )}
    </div>
  )
}