// components/TabBar.jsx
// ✅ SVG icons (no emojis), elevated Nesta orb, correct safe-area padding

const AgendaIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#b69088' : '#d4c0bc'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
)

const SpeakersIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#b69088' : '#d4c0bc'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const ResourcesIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#b69088' : '#d4c0bc'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)

const ShowcaseIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#b69088' : '#d4c0bc'}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

function NavBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 3, border: 'none', background: 'transparent', cursor: 'pointer',
        padding: '8px 0 0',
      }}
    >
      {icon}
      <span style={{
        fontSize: 8, fontWeight: 600,
        color: active ? '#b69088' : '#d4c0bc',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {label}
      </span>
    </button>
  )
}

export default function TabBar({ activeTab, onTabChange }) {
  return (
    // ✅ overflow: visible so the Nesta orb (negative margin) isn't clipped
    <div
      className="shrink-0 flex items-end bg-white w-full"
      style={{
        borderTop: '0.5px solid rgba(182,144,136,0.25)',
        // Safe area for iPhone home bar + a little breathing room
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        overflow: 'visible',
        position: 'relative',
        zIndex: 40,
      }}
    >
      <NavBtn active={activeTab === 'agenda'}    onClick={() => onTabChange('agenda')}    icon={<AgendaIcon    active={activeTab === 'agenda'}    />} label="Agenda"    />
      <NavBtn active={activeTab === 'speakers'}  onClick={() => onTabChange('speakers')}  icon={<SpeakersIcon  active={activeTab === 'speakers'}  />} label="Speakers"  />

      {/* ── Nesta orb — elevated above the tab bar ── */}
      <div
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', position: 'relative',
          paddingTop: 8,
        }}
      >
        <button
          onClick={() => onTabChange('nesta')}
          style={{
            width: 46, height: 46, borderRadius: '50%',
            background: activeTab === 'nesta' ? '#7a4e48' : '#b69088',
            border: '3px solid #faf7f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            // Lift the orb above the bar
            marginTop: -26,
            boxShadow: '0 4px 16px rgba(182,144,136,0.55)',
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
        >
          <ChatIcon />
        </button>
        <span style={{
          fontSize: 8, fontWeight: 600,
          color: activeTab === 'nesta' ? '#b69088' : '#d4c0bc',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginTop: 4,
        }}>
          Nesta
        </span>
      </div>

      <NavBtn active={activeTab === 'resources'} onClick={() => onTabChange('resources')} icon={<ResourcesIcon active={activeTab === 'resources'} />} label="Resources" />
      <NavBtn active={activeTab === 'showcase'}  onClick={() => onTabChange('showcase')}  icon={<ShowcaseIcon  active={activeTab === 'showcase'}  />} label="Showcase"  />
    </div>
  )
}