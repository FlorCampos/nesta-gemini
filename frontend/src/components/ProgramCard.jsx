// components/ProgramCard.jsx
// Small horizontal pill showing a program name with a colour accent.
// Used in Nesta chat header or any "quick links" context.
// Expects: { label, color, lightColor, icon? }

export default function ProgramCard({ label, color = '#b69088', lightColor = '#f2e8e5', icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 12px',
        background: '#ffffff',
        border: `0.5px solid ${color}44`,
        borderRadius: 11,
        cursor: 'pointer',
        minWidth: 120,
      }}
    >
      {icon && (
        <div style={{ width: 24, height: 24, background: lightColor, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>{icon}</span>
        </div>
      )}
      <span style={{ fontSize: 10, fontWeight: 700, color: '#2d2420' }}>{label}</span>
    </button>
  )
}