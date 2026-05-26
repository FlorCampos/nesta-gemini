// components/NestaLogo.jsx
// Now renders the AAtI butterfly favicon.
// Image must be in: nesta-gemini/frontend/public/AAtI-Favicon.png

export default function NestaLogo({ size = 30, className = '' }) {
  return (
    <img
      src="/AAtI-Favicon.png"
      alt="AAtI"
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  )
}