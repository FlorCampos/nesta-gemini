// src/data/resources.js
import { supabase } from './conference'

// ── Derive category + accent colours from program name ────────────────────────
function categorise(name = '') {
  const n = name.toLowerCase()
  if (n === 'nesta')                                               return { category: 'Nesta',            pc: '#b69088', pl: '#f2e8e5' }
  if (n.includes('intelligent nest'))                              return { category: 'Intelligent Nest', pc: '#9b5de5', pl: '#f1e4ff' }
  if (n.includes('futureready') || n.includes('future ready') ||
      n.includes('techtable')   || n.includes('tech table'))      return { category: 'Intelligent Nest', pc: '#9b5de5', pl: '#f1e4ff' }
  if (n.includes('mamanest') || n === 'mamanest')                 return { category: 'MamaNest',         pc: '#876f8f', pl: '#f4f1f4' }
  if (n.includes('mamatech') || n.includes('future-ready moms') ||
      n.includes('future ready moms'))                            return { category: 'MamaNest',         pc: '#876f8f', pl: '#f4f1f4' }
  if (n.includes('her career conference'))                         return { category: 'Conference',       pc: '#4d675c', pl: '#eef1f0' }
  if (n.includes('nest notes') || n.includes('the nest'))         return { category: 'The Nest',         pc: '#af9caf', pl: '#f4f1f4' }
  return { category: 'Other', pc: '#b69088', pl: '#f2e8e5' }
}


export async function fetchAllResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('id, name, description, logo, button, button_link')
    .order('id', { ascending: true })

  if (error) {
    console.error('fetchAllResources error:', error.message)
    throw error
  }

  return (data || []).map(r => ({
    id:          r.id,
    name:        r.name        || '',
    description: r.description || '',
    logo:        r.logo        || null,
    cta:         r.button      || 'Learn more',
    url:         r.button_link || null,
    ...categorise(r.name),
  }))
}