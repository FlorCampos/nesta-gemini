// pages/AgendaPage.jsx
// Componente de Agenda Inteligente y Automatizada por Tiempo Real
import { useState, useMemo, useEffect } from 'react'
import { supabase, CHIP, B } from '../data/conference'

// ── CONTROL DE SIMULACIÓN Y TIEMPO REAL ───────────────────────────────────────
// Dado que los datos de tu archivo CSV pertenecen a Mayo y Junio del año 2026:
// - Si SIMULATE_LIVE es true: El código forzará el reloj interno al '2026-05-30 a las 18:10'
//   lo cual te permitirá ver la primera sesión ("Welcome and Opening") marcada como "● LIVE NOW" de inmediato.
// - Si SIMULATE_LIVE es false: Usará el reloj exacto de tu computadora actual.
const SIMULATE_LIVE = true

// Listado global estandarizado para los chips de filtro superior
const FILTERS = ['All', 'Keynote', 'Workshop', 'Panel', 'Talk', 'Networking']

/**
 * Componente TypeChip
 * Renderiza etiquetas estilizadas según el tipo de sesión detectado en Supabase.
 * Soporta normalización de cadenas de texto para evitar fallos por mayúsculas.
 */
function TypeChip({ type }) {
  const safeType = type || 'Talk'
  // Convertimos a formato Título (Ej. 'talk' -> 'Talk') para que coincida con las llaves de CHIP
  const normalizedType = safeType.charAt(0).toUpperCase() + safeType.slice(1).toLowerCase()
  
  // Si no se encuentra el color en la paleta, se aplica el color institucional por defecto
  const styleConfig = CHIP[normalizedType] || CHIP[safeType] || { bg: B.nestaLight, color: B.nesta }
  
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 6,
      background: styleConfig.bg,
      color: styleConfig.color,
      letterSpacing: '0.02em',
      display: 'inline-block'
    }}>
      {safeType.toUpperCase()}
    </span>
  )
}

/**
 * Componente DetailSheet (Bottom Sheet)
 * Muestra la información extendida de un evento cuando el usuario hace clic sobre él.
 * Integra la visualización condicional de la columna 'relevant_for'.
 */
function DetailSheet({ session, onClose }) {
  if (!session) return null
  
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 100, 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'center' 
    }}>
      {/* Fondo oscuro traslúcido con desenfoque de fondo */}
      <div
        style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(45,36,32,0.4)', 
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s ease'
        }}
        onClick={onClose}
      />

      {/* Panel Contenedor Deslizable */}
      <div style={{
        position: 'relative',
        background: B.cream,
        width: '100%',
        maxWidth: 460,
        borderRadius: '32px 32px 0 0',
        padding: '26px 22px 50px',
        maxHeight: '88vh',
        overflowY: 'auto',
        boxShadow: '0 -10px 25px -5px rgba(0,0,0,0.1)',
        zIndex: 110,
      }}>
        {/* Indicador superior estético para simular un tirador de hoja móvil */}
        <div style={{ 
          width: 40, 
          height: 4, 
          background: B.mutedLight, 
          borderRadius: 2, 
          margin: '0 auto 22px' 
        }} />

        {/* Botón de cierre en la esquina superior derecha */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', 
            top: 22, 
            right: 22,
            border: 'none', 
            background: 'rgba(0,0,0,0.03)', 
            cursor: 'pointer', 
            fontSize: 14, 
            color: B.muted,
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: 12 }}>
          <TypeChip type={session.type} />
        </div>

        <h2 style={{ 
          fontSize: 21, 
          fontWeight: 700, 
          color: B.charcoal, 
          margin: '0 0 16px 0', 
          lineHeight: 1.35 
        }}>
          {session.title}
        </h2>

        {/* Faja de metadatos espaciales y temporales del evento */}
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          gap: 10,
          padding: '14px 0',
          borderTop: '1px solid rgba(182,144,136,0.15)',
          borderBottom: '1px solid rgba(182,144,136,0.15)',
          marginBottom: 22,
        }}>
          <div style={{ fontSize: 12, color: B.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🗓</span> 
            <span style={{ fontWeight: 600, color: B.charcoal }}>{session.dateDisplay}</span>
            <span style={{ color: B.mutedLight }}>•</span>
            <span>{session.timeDisplay} ({session.duration_minutes} min)</span>
          </div>
          
          <div style={{ fontSize: 12, color: B.muted, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 14, marginTop: -1 }}>📍</span> 
            <span style={{ lineHeight: 1.4 }}>{session.location || 'Location To Be Determined'}</span>
          </div>
        </div>

        {/* Bloque descriptivo */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            fontSize: 9, 
            fontWeight: 800, 
            color: B.nesta, 
            letterSpacing: '0.14em', 
            textTransform: 'uppercase', 
            marginBottom: 8 
          }}>
            About this Session
          </div>
          <p style={{ 
            fontSize: 13, 
            color: B.charcoal, 
            lineHeight: 1.7, 
            margin: 0,
            opacity: 0.9
          }}>
            {session.description || 'No supplementary details provided for this itinerary segment.'}
          </p>
        </div>

        {/* NUEVA COLUMNA: Relevant For integrada en el panel desplegable */}
        {session.relevant_for && (
          <div style={{ 
            background: B.white, 
            borderRadius: 16, 
            border: '1px solid rgba(182,144,136,0.18)', 
            padding: '14px 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
          }}>
            <div style={{ 
              fontSize: 9, 
              fontWeight: 800, 
              color: B.nesta, 
              letterSpacing: '0.14em', 
              textTransform: 'uppercase', 
              marginBottom: 6 
            }}>
              Target Audience / Relevant For
            </div>
            <p style={{ 
              fontSize: 12, 
              color: B.charcoal, 
              fontWeight: 600, 
              fontStyle: 'italic', 
              margin: 0,
              lineHeight: 1.4
            }}>
              🎯 {session.relevant_for}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Componente ConflictBlock
 * Gestiona escenarios donde dos o más conferencias comparten el mismo intervalo de tiempo exacto.
 * Divide el espacio en columnas interactivas para que el usuario seleccione la de su interés.
 */
function ConflictBlock({ sessions, onSelect }) {
  return (
    <div style={{ 
      background: B.conflictBg, 
      borderRadius: 16, 
      overflow: 'hidden', 
      border: '1px solid rgba(208,112,96,0.25)', 
      borderLeft: `4px solid ${B.conflict}`,
      boxShadow: '0 2px 6px rgba(208,112,96,0.03)'
    }}>
      <div style={{ 
        padding: '8px 14px', 
        background: 'rgba(208,112,96,0.05)', 
        borderBottom: '1px solid rgba(208,112,96,0.15)', 
        fontSize: 10, 
        color: B.conflictTxt, 
        fontWeight: 700,
        letterSpacing: '0.02em'
      }}>
        {sessions.length} parallel events detected — choose one to explore
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', divideX: '1px' }}>
        {sessions.map((s, i) => (
          <div 
            key={s.id || i} 
            onClick={() => onSelect(s)} 
            style={{ 
              padding: '12px 14px', 
              borderRight: i < sessions.length - 1 ? '1px solid rgba(208,112,96,0.12)' : 'none', 
              cursor: 'pointer',
              background: 'transparent',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(250,250,250,0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ marginBottom: 6 }}><TypeChip type={s.type} /></div>
            
            <div style={{ 
              fontSize: 12, 
              fontWeight: 600, 
              color: B.charcoal, 
              lineHeight: 1.4, 
              marginBottom: 6 
            }}>
              {s.title}
            </div>

            {/* Inclusión de Relevant For dentro de las subdivisiones por colisión */}
            {s.relevant_for && (
              <div style={{ 
                fontSize: 10, 
                color: B.nesta, 
                fontWeight: 500, 
                fontStyle: 'italic', 
                marginBottom: 6 
              }}>
                🎯 {s.relevant_for}
              </div>
            )}
            
            {s.speaker && s.speaker !== 'None' && (
              <div style={{ fontSize: 10, color: B.muted, fontWeight: 500 }}>
                👤 {s.speaker}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Componente SessionCard
 * Representa de forma individual cada bloque programático estándar.
 * Controla visualmente los estados Activo ("LIVE NOW") y Expirado ("Past") dinámicamente.
 */
function SessionCard({ session, onSelect }) {
  const isLive = session.status === 'live'
  const isPast = session.status === 'past'

  return (
    <div
      onClick={() => onSelect(session)}
      style={{
        padding: '14px 16px', 
        background: isLive ? '#fffbfa' : B.white, 
        borderRadius: 16,
        border: `1px solid ${isLive ? 'rgba(208,112,96,0.35)' : 'rgba(182,144,136,0.18)'}`,
        boxShadow: isLive ? '0 4px 12px rgba(208,112,96,0.06)' : '0 2px 4px rgba(0,0,0,0.01)',
        ...(isLive ? { borderLeft: `4px solid ${B.conflict}` } : {}), 
        opacity: isPast ? 0.55 : 1, 
        marginBottom: 10, 
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <TypeChip type={session.type} />
        
        {/* INDICADOR LIVE NOW AUTOMÁTICO CONTROLADO POR EL RELOJ MATEMÁTICO */}
        {isLive && (
          <span style={{ 
            fontSize: 9, 
            fontWeight: 800, 
            color: '#d07060', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 5,
            letterSpacing: '0.04em'
          }}>
            <span style={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              background: '#d07060', 
              display: 'inline-block' 
            }} />
            LIVE NOW
          </span>
        )}
      </div>

      <div style={{ 
        fontSize: 13, 
        fontWeight: 700, 
        lineHeight: 1.4, 
        marginBottom: 6, 
        color: isPast ? B.muted : B.charcoal 
      }}>
        {session.title}
      </div>

      {/* RENDERIZADO AUTOMÁTICO DE LA COLUMNA RELEVANT FOR */}
      {session.relevant_for && (
        <div style={{ 
          fontSize: 10, 
          color: B.nesta, 
          fontWeight: 600, 
          marginBottom: 8, 
          fontStyle: 'italic' 
        }}>
          🎯 {session.relevant_for}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: B.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
          📍 {session.location || 'TBD'}
        </span>
        {session.speaker && session.speaker !== 'None' && (
          <span style={{ 
            fontSize: 11, 
            color: B.muted, 
            textAlign: 'right', 
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '40%'
          }}>
            {session.speaker}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Componente Raíz: AgendaPage
 * Ejecuta las consultas de datos asíncronas hacia Supabase, monta los observadores de tiempo,
 * procesa linealmente los estados temporales de cada evento y agrupa visualmente los elementos.
 */
export default function AgendaPage() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [agendaData, setAgendaData] = useState([])
  const [loading, setLoading] = useState(true)
  const [systemTime, setSystemTime] = useState(new Date())

  // Observador de Tiempo Continuo: Forzamos la reevaluación del estado de la app cada 15 segundos
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setSystemTime(new Date())
    }, 15000)
    
    return () => clearInterval(clockInterval)
  }, [])

  // Consumidor de Datos de la Base de Datos Externa (Supabase)
  useEffect(() => {
    async function loadConferenceData() {
      try {
        setLoading(true)
        // Apuntamos directo a tu tabla relacional mapeando todo el universo de filas
        const { data, error } = await supabase
          .from('conference')
          .select('*')
          
        if (error) throw error
        if (data) setAgendaData(data)
      } catch (err) {
        console.error("Critical error mapping data from Supabase storage:", err.message)
      } finally {
        setLoading(false)
      }
    }
    loadConferenceData()
  }, [])

  // Gestor del tiempo actual según la configuración del entorno (Simulado o Local Real)
  const currentTime = useMemo(() => {
    if (SIMULATE_LIVE) {
      // Clavamos las manecillas del reloj de JavaScript al primer día del evento (30 de Mayo, 2026 a las 18:10 UTC)
      // Esto interceptará la primera fila del CSV y gatillará el disparador automático "LIVE NOW".
      return new Date('2026-05-30T18:10:00Z')
    }
    return systemTime
  }, [systemTime])

  /**
   * pipeline de Procesamiento processedAgenda (useMemo):
   * Cruza de manera matemática los Timestamps globales transformando strings de Supabase a objetos operables.
   */
  const processedAgenda = useMemo(() => {
    return agendaData.map(sessionItem => {
      // Instanciamos el hito cronológico exacto provisto por la celda 'date_time'
      const startDate = new Date(sessionItem.date_time)
      const executionMinutes = sessionItem.duration_minutes || 30
      
      // Calculamos la hora de clausura de la sesión añadiéndole los minutos transformados a milisegundos
      const endDate = new Date(startDate.getTime() + executionMinutes * 60000)

      // Convertimos los hitos a cadenas de lectura amigable para el diseño en español
      const dateDisplay = startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      const startStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      const endStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      const timeDisplay = `${startStr} - ${endStr}`

      // EVALUADOR MATEMÁTICO INTEGRAL DE ESTADO CRONOLÓGICO
      let currentStatus = 'upcoming'
      const currentTimestampMs = currentTime.getTime()
      const eventStartTimestampMs = startDate.getTime()
      const eventEndTimestampMs = endDate.getTime()

      if (currentTimestampMs >= eventStartTimestampMs && currentTimestampMs <= eventEndTimestampMs) {
        currentStatus = 'live'
      } else if (currentTimestampMs > eventEndTimestampMs) {
        currentStatus = 'past'
      }

      return {
        ...sessionItem,
        type: sessionItem.session_type || 'Talk', // Enlace con la columna real de tu base de datos
        dateDisplay,
        timeDisplay,
        // Combinación unificada para la clave de agrupamiento cronológico en pantalla
        groupKey: `${dateDisplay} · ${startStr}`,
        startTimeRaw: eventStartTimestampMs,
        status: currentStatus
      }
    })
  }, [agendaData, currentTime])

  /**
   * pipeline de Agrupamiento grouped (useMemo):
   * Filtra las categorías y segmenta la agenda por llaves horarias compartidas para detectar colisiones.
   */
  const grouped = useMemo(() => {
    // Aplicamos el discriminador por chips superiores de categoría
    const filteredResults = filter === 'All'
      ? processedAgenda
      : processedAgenda.filter(s => s.type.toLowerCase() === filter.toLowerCase())

    // Ordenamos de manera ascendente para asegurar la coherencia del flujo de lectura
    const sortedChronologically = [...filteredResults].sort((a, b) => a.startTimeRaw - b.startTimeRaw)

    // Agrupamiento asociativo mediante estructura Map nativa
    const mappingGroup = new Map()
    sortedChronologically.forEach(item => {
      const uniqueKey = item.groupKey
      if (!mappingGroup.has(uniqueKey)) {
        mappingGroup.set(uniqueKey, [])
      }
      mappingGroup.get(uniqueKey).push(item)
    })
    
    return Array.from(mappingGroup.entries())
  }, [filter, processedAgenda])

  // Estado de carga intermedio
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
        Estableciendo conexión y mapeando agenda de Supabase...
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto" style={{ padding: '14px 16px 100px' }}>
        
        {/* Barra de Navegación Horizontal de Filtros */}
        <div style={{ 
          display: 'flex', 
          gap: 6, 
          overflowX: 'auto', 
          paddingBottom: 6, 
          marginBottom: 16, 
          scrollbarWidth: 'none' 
        }}>
          {FILTERS.map(filterKey => {
            const isTabActive = filter === filterKey
            return (
              <button
                key={filterKey}
                onClick={() => setFilter(filterKey)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 18,
                  border: `1px solid ${isTabActive ? B.nesta : 'rgba(182,144,136,0.3)'}`,
                  background: isTabActive ? B.nesta : 'transparent',
                  color: isTabActive ? '#fff' : B.muted,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  lineHeight: '1.3',
                  transition: 'all 0.15s ease'
                }}
              >
                {filterKey}
              </button>
            )
          })}
        </div>

        {/* Renderizado de Bloques Condicionales de la Agenda */}
        {grouped.length === 0 ? (
          <div style={{ 
            color: B.muted, 
            fontSize: 12, 
            textAlign: 'center', 
            marginTop: 40,
            fontWeight: 500 
          }}>
            No se encontraron eventos activos en la categoría seleccionada.
          </div>
        ) : (
          grouped.map(([groupKey, sessionGroup]) => {
            // Evaluamos si alguna de las subsesiones en el bloque está en vivo actualmente
            const isBlockLive = sessionGroup.some(s => s.status === 'live')
            const isBlockPast = sessionGroup.every(s => s.status === 'past')
            const isConflictDetected = sessionGroup.length > 1

            return (
              <div key={groupKey} style={{ marginBottom: 18 }}>
                
                {/* Cabecera Temporal del Bloque (Imprime Día + Hora de Inicio) */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: 10 
                }}>
                  {isBlockLive && (
                    <div style={{ 
                      width: 7, 
                      height: 7, 
                      borderRadius: '50%', 
                      background: '#d07060'
                    }} />
                  )}
                  
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: isBlockLive ? '#d07060' : isBlockPast ? '#c0aeaa' : '#5a4a46',
                    letterSpacing: '0.01em'
                  }}>
                    {groupKey}
                  </span>

                  {isConflictDetected && (
                    <div style={{ 
                      marginLeft: 'auto', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4, 
                      background: '#fff6f5', 
                      padding: '3px 9px', 
                      borderRadius: 12, 
                      border: '1px solid rgba(208,112,96,0.2)' 
                    }}>
                      <span style={{ fontSize: 9, color: B.conflictTxt, fontWeight: 800 }}>
                        ⚠ TIMING CONFLICT
                      </span>
                    </div>
                  )}
                </div>

                {/* bifurcación de diseño: Bloque de Conflicto Colectivo o Tarjeta Simple */}
                {isConflictDetected ? (
                  <ConflictBlock sessions={sessionGroup} onSelect={setSelected} />
                ) : (
                  sessionGroup.map((singleSession, idx) => (
                    <SessionCard 
                      key={singleSession.id || idx} 
                      session={singleSession} 
                      onSelect={setSelected} 
                    />
                  ))
                )}
                
              </div>
            )
          })
        )}
      </div>

      {/* Hoja desplegable inferior para visualización extendida del itinerario */}
      <DetailSheet session={selected} onClose={() => setSelected(null)} />
    </>
  )
}