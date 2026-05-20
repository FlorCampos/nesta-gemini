// pages/ShowcasePage.jsx

import { B } from '../data/conference'

export default function ShowcasePage() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{ padding: '40px 32px', background: B.cream, textAlign: 'center' }}
    >
      {/* Lock icon */}
      <div style={{
        width: 72, height: 72, borderRadius: 36,
        background: B.nestaLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        border: `1px solid ${B.nesta}33`,
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={B.nesta} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>

      {/* Heading */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: B.charcoal, margin: '0 0 10px', lineHeight: 1.25 }}>
        Premium Feature
      </h2>

      {/* Sub-text */}
      <p style={{ fontSize: 13, color: B.muted, lineHeight: 1.65, margin: '0 0 28px', maxWidth: 260 }}>
        The Showcase is available for Intelligent Nest program members. Join a program to unlock this section.
      </p>

      {/* CTA */}
      <a
        href="https://intelligentnestwomen.com"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-block',
          padding: '12px 28px', borderRadius: 12,
          background: B.nesta, color: '#fff',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}
      >
        Learn about our programs ↗
      </a>
    </div>
  )
}