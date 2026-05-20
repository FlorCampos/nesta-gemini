// pages/SpeakersPage.jsx
// Pantalla de Conferencistas Conectada Automáticamente al Backend de Supabase
import { useState, useEffect, useMemo } from 'react'
import { fetchAllSpeakers } from '../data/speakers'
import { B } from '../data/conference'

/**
 * Componente SpeakerDetailSheet (Bottom Sheet)
 * Emerge desde la parte inferior de la interfaz al pulsar sobre cualquier tarjeta.
 * Muestra la biografía detallada del ponente y vincula la sesión que impartirá.
 */
function SpeakerDetailSheet({ speaker, onClose }) {
  if (!speaker) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      {/* Fondo traslúcido difuminado */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(45, 36, 32, 0.4)',
          backdropFilter: 'blur(6px)',
          transition: 'all 0.3s ease-in-out'
        }}
        onClick={onClose}
      />

      {/* Cuerpo del Bottom Sheet */}
      <div style={{
        position: 'relative',
        background: B.cream,
        width: '100%',
        maxWidth: 480,
        borderRadius: '32px 32px 0 0',
        padding: '24px 24px 48px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 -12px 30px -5px rgba(0,0,0,0.15)',
        zIndex: 210,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Barra superior decorativa de arrastre */}
        <div style={{
          width: 42,
          height: 5,
          background: B.mutedLight,
          borderRadius: 3,
          margin: '0 auto 24px'
        }} />

        {/* Botón de salida */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            border: 'none',
            background: 'rgba(45,36,32,0.05)',
            cursor: 'pointer',
            fontSize: 12,
            color: B.charcoal,
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>

        {/* Encabezado de perfil principal del ponente */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 24 }}>
          <img
            src={speaker.photo}
            alt={speaker.name}
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              objectFit: 'cover',
              border: `2.5px solid ${B.white}`,
              boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: B.charcoal, margin: '0 0 4px 0', lineHeight: 1.25 }}>
              {speaker.name}
            </h2>
            <p style={{ fontSize: 13, fontWeight: 600, color: B.nesta, margin: 0, lineHeight: 1.3 }}>
              {speaker.role}
            </p>
            {speaker.company && (
              <p style={{ fontSize: 12, color: B.muted, margin: '2px 0 0 0', fontWeight: 500 }}>
                {speaker.company}
              </p>
            )}
          </div>
        </div>

        {/* Sección de Biografía Profesional */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 9,
            fontWeight: 800,
            color: B.nesta,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 10
          }}>
            Professional Profile
          </div>
          <p style={{
            fontSize: 13.5,
            color: B.charcoal,
            lineHeight: 1.7,
            margin: 0,
            textAlign: 'justify',
            opacity: 0.95
          }}>
            {speaker.bio}
          </p>
        </div>

        {/* Agenda Asignada: Muestra qué charla dará este ponente */}
        {speaker.sessionTitle && (
          <div style={{
            background: B.white,
            borderRadius: 18,
            border: '1px solid rgba(182,144,136,0.2)',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}>
            <div style={{
              fontSize: 9,
              fontWeight: 800,
              color: B.nesta,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 8
            }}>
              Scheduled Conference Session
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, marginTop: 2 }}>🎤</span>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: B.charcoal, margin: '0 0 4px 0', lineHeight: 1.4 }}>
                  {speaker.sessionTitle}
                </h4>
                <p style={{ fontSize: 11, color: B.muted, margin: 0, fontWeight: 500 }}>
                  Consulte los horarios específicos dentro de la pestaña Agenda.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Componente SpeakerCard
 * Tarjeta individual optimizada con efectos suaves al pasar el mouse (hover).
 */
function SpeakerCard({ speaker, onSelect }) {
  return (
    <div
      onClick={() => onSelect(speaker)}
      style={{
        background: B.white,
        borderRadius: 20,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px solid rgba(182,144,136,0.15)',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(45,36,32,0.02)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'clientY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(45,36,32,0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(45,36,32,0.02)'
      }}
    >
      {/* Contenedor de la Imagen con Marco Circular estilizado */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <img
          src={speaker.photo}
          alt={speaker.name}
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${B.nestaLight}`,
            background: B.cream
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
          }}
        />
      </div>

      {/* Metadatos de Información */}
      <h3 style={{
        fontSize: 13.5,
        fontWeight: 700,
        color: B.charcoal,
        margin: '0 0 4px 0',
        lineHeight: 1.3,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        height: '36px',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {speaker.name}
      </h3>

      <p style={{
        fontSize: 11,
        fontWeight: 600,
        color: B.nesta,
        margin: '0 0 2px 0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%'
      }}>
        {speaker.role}
      </p>

      <p style={{
        fontSize: 10.5,
        color: B.muted,
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
        fontWeight: 500
      }}>
        {speaker.company || 'Independent'}
      </p>

      {/* Pequeño Tag interactivo inferior */}
      {speaker.sessionTitle && (
        <div style={{
          marginTop: '12px',
          background: B.nestaLight,
          color: B.nestaDark,
          fontSize: 9,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 12,
          letterSpacing: '0.01em'
        }}>
          VIEW SESSION
        </div>
      )}
    </div>
  )
}

/**
 * Componente Principal: SpeakersPage
 * Administra los estados de conexión, barra de búsquedas y estructuración en Grid.
 */
export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carga asíncrona de datos desde el servicio modular speakers.js
  useEffect(() => {
    async function loadSpeakersData() {
      try {
        setLoading(true)
        const data = await fetchAllSpeakers()
        setSpeakers(data)
      } catch (err) {
        console.error("Error cargando el listado de expertos profesionales:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSpeakersData()
  }, [])

  // Pipeline de búsqueda reactiva en tiempo real (useMemo para alto rendimiento)
  const filteredSpeakers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return speakers

    return speakers.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.role.toLowerCase().includes(query) ||
      s.company.toLowerCase().includes(query)
    )
  }, [searchQuery, speakers])

  // Vista en estado de carga (Shimmer / Loading Placeholder)
  if (loading) {
    return (
      <div style={{
        padding: '60px 20px',
        color: B.muted,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.01em'
      }}>
        Conectando con Supabase y descargando perfiles de expertos...
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto" style={{ padding: '16px 16px 100px', background: B.cream }}>
        
        {/* Input de Búsqueda Avanzado Estilizado */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 14,
            color: B.muted,
            pointerEvents: 'none'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, rol o compañía..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 16px 11px 38px',
              fontSize: 13,
              borderRadius: 16,
              border: '1px solid rgba(182,144,136,0.3)',
              background: B.white,
              color: B.charcoal,
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
              transition: 'border 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.border = `1px solid ${B.nesta}`}
            onBlur={(e) => e.target.style.border = '1px solid rgba(182,144,136,0.3)'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: B.muted,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sección Informativa de Resultados */}
        <div style={{ fontSize: 11, fontWeight: 600, color: B.muted, marginBottom: 12, paddingLeft: 4 }}>
          {filteredSpeakers.length === 0 
            ? 'No se encontraron resultados' 
            : `Mostrando ${filteredSpeakers.length} conferencista${filteredSpeakers.length > 1 ? 's' : ''}`
          }
        </div>

        {/* Rejilla de Tarjetas Adaptativa (CSS Grid Inline) */}
        {filteredSpeakers.length === 0 ? (
          <div style={{ color: B.muted, fontSize: 12, textAlign: 'center', marginTop: 40, fontWeight: 500 }}>
            No hay perfiles que coincidan con los criterios de búsqueda.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', // Fuerza 2 columnas perfectas para móviles
            gap: '12px',
          }}>
            {filteredSpeakers.map((speakerItem) => (
              <SpeakerCard
                key={speakerItem.id}
                speaker={speakerItem}
                onSelect={setSelectedSpeaker}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hoja desplegable inferior para ver el perfil extendido */}
      <SpeakerDetailSheet
        speaker={selectedSpeaker}
        onClose={() => setSelectedSpeaker(null)}
      />
    </>
  )
}