// src/data/speakers.js
import { supabase } from './conference'

export async function fetchAllSpeakers() {
  try {
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
      id:           speaker.id,
      name:         speaker.name         || 'Anonymous Speaker',
      // ✅ jobTitle is what SpeakersPage and SpeakerCard display under the name
      jobTitle:     speaker.title        || '',
      // role kept for the conference role badge (Host, Panelist, etc.)
      // Since there's no role_type column, we derive it from session_id in SpeakersPage
      role:         speaker.title        || 'Speaker',
      linkedin:     speaker.linkedin     || '',
      bio:          speaker.bio          || 'No biography available at this moment.',
      photo:        speaker.photo_url    || null,
      sessionId:    speaker.session_id,
      sessionTitle: speaker.conference   ? speaker.conference.title    : null,
      sessionTime:  speaker.conference   ? speaker.conference.date_time : null,
    }))
  } catch (err) {
    console.error('Error en fetchAllSpeakers:', err.message)
    throw err
  }
}