// src/data/conference.js
import { createClient } from '@supabase/supabase-js'

// 1. Credenciales de tu proyecto de Supabase
const SUPABASE_URL ='https://SUPABASE_URL_REMOVED'
const SUPABASE_ANON_KEY ='SUPABASE_ANON_KEY_REMOVED'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Paleta de colores para los estilos inline
export const B = {
  nesta:       '#b69088',
  nestaDark:   '#7a4e48',
  nestaLight:  '#f2e8e5',
  charcoal:    '#2d2420',
  muted:       '#8a7572',
  mutedLight:  '#d4c0bc',
  cream:       '#faf7f5',
  white:       '#ffffff',
  conflict:    '#d07060',
  conflictBg:  '#fff9f8',
  conflictTxt: '#c06050',
}

// 3. Configuración de los tags/chips (en minúsculas para evitar problemas de matching)
export const CHIP = {
  keynote:    { bg: '#fdf0ee', color: '#9e5e54' },
  workshop:   { bg: '#f1e4ff', color: '#9b5de5' },
  panel:      { bg: '#edf5e8', color: '#3d7040' },
  talk:       { bg: '#faf3e5', color: '#7a6030' },
  networking: { bg: '#f4f1f4', color: '#876f8f' },
  break:      { bg: '#f5f5f5', color: '#9a9a9a' },
}

// ── Speaker-role badge styles ─────────────────────────────────────────────────
export const ROLE_CHIP = {
  Host:                   { bg: '#fdf0ee', color: '#9e5e54' },
  Panelist:               { bg: '#edf5e8', color: '#3d7040' },
  'Workshop Facilitator': { bg: '#f1e4ff', color: '#9b5de5' },
  Speaker:                { bg: '#faf3e5', color: '#7a6030' },
  Closing:                { bg: '#f4f1f4', color: '#876f8f' },
};

export const FILTERS = ['All', 'Keynote', 'Workshop', 'Panel', 'Talk', 'Networking'];

// 4. Funciones auxiliares ultra-flexibles para procesar las horas de Supabase
export function startOf(timeRange) {
  if (!timeRange || typeof timeRange !== 'string') return '00:00';
  
  try {
    // Reemplaza rayas largas por guiones normales y separa por el separador
    const cleanRange = timeRange.replace('–', '-');
    const [start] = cleanRange.split('-');
    return start ? start.trim() : '00:00';
  } catch (e) {
    return '00:00';
  }
}

export function getSessionStatus(timeRange) {
  if (!timeRange || typeof timeRange !== 'string') return 'upcoming';

  try {
    const cleanRange = timeRange.replace('–', '-');
    if (!cleanRange.includes('-')) return 'upcoming';

    const [startStr, endStr] = cleanRange.split('-');
    if (!startStr || !endStr) return 'upcoming';

    const now = new Date();
    // ATENCIÓN: Como tu base de datos simula un evento real, 
    // forzamos a que esté "en vivo" si la hora actual coincide,
    // o puedes cambiarlo para pruebas.
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [sh, sm] = startStr.trim().split(':').map(Number);
    const [eh, em] = endStr.trim().split(':').map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return 'live';
    } else if (currentMinutes > endMinutes) {
      return 'past';
    }
    return 'upcoming';
  } catch (e) {
    return 'upcoming';
  }
}