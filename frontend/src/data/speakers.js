// src/data/speakers.js
import { supabase } from './conference'

/**
 * Obtiene la lista completa de conferencistas desde Supabase.
 * Realiza adicionalmente un Left Join automático con la tabla 'conference'
 * para traer el título de la sesión que dará cada speaker en tiempo real.
 */
export async function fetchAllSpeakers() {
  try {
    // Consultamos la tabla 'speakers' y anidamos los datos de la sesión asignada
    const { data, error } = await supabase
      .from('speakers')
      .select(`
        id,
        name,
        title,
        linkedin,
        bio,
        photo_url,
        session_id,
        conference (
          title,
          date_time
        )
      `)
      .order('name', { ascending: true })

    if (error) throw error

    return data.map(speaker => ({
      id: speaker.id,
      name: speaker.name || 'Anonymous Speaker',
      role: speaker.title || 'Special Guest',
      linkedin: speaker.linkedin || '',
      bio: speaker.bio || 'No biography available at this moment.',
      // Si la foto es null o falla, usamos un avatar genérico elegante de respaldo
      photo: speaker.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      sessionId: speaker.session_id,
      sessionTitle: speaker.conference ? speaker.conference.title : null
    }))
  } catch (err) {
    console.error("Error en fetchAllSpeakers:", err.message)
    throw err
  }
}