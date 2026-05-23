// services/nestaApi.js

// ✅ import.meta.env.PROD is true only for `npm run build` production builds.
// In dev (`npm run dev`), it's false — so /api/nesta goes through the Vite proxy
// regardless of whether the browser accesses via localhost OR 192.168.x.x.
const API_URL = import.meta.env.PROD
  ? 'https://nesta-backend-944231955606.us-central1.run.app/api/nesta'
  : '/api/nesta'

/**
 * Streams a response from the Nesta backend.
 * Safari-safe: handles partial chunks and falls back to non-streaming
 * if response.body / ReadableStream is unavailable.
 */
export async function sendMessageStream(
  message,
  sessionId = 'default',
  consentGiven = false,
  onChunk,
  onDone,
) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        session_id:    sessionId,
        consent_given: consentGiven,
      }),
    })

    if (!response.ok) {
      console.error('Nesta API error:', response.status, response.statusText)
      onChunk("I'm having trouble connecting right now. Please try again.")
      onDone()
      return
    }

    // ── Safari fallback: no ReadableStream support ────────────────────────────
    if (!response.body || typeof response.body.getReader !== 'function') {
      const text  = await response.text()
      const lines = text.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) onChunk(data.text)
          } catch { /* ignore malformed JSON */ }
        }
      }
      onDone()
      return
    }

    // ── Streaming path ────────────────────────────────────────────────────────
    const reader  = response.body.getReader()
    const decoder = new TextDecoder('utf-8', { fatal: false })
    let   buffer  = ''
    let   doneReceived = false

    while (true) {
      let result
      try {
        result = await reader.read()
      } catch (readErr) {
        console.warn('Stream read error:', readErr)
        break
      }

      const { done, value } = result
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process only complete lines; keep partial line in buffer
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.done) {
            doneReceived = true
            onDone()
          } else if (data.text) {
            onChunk(data.text)
          }
        } catch { /* ignore */ }
      }
    }

    // Flush remaining decoder buffer
    const remaining = decoder.decode()
    if (remaining) {
      const lines = (buffer + remaining).split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.done) { doneReceived = true; onDone() }
          else if (data.text) onChunk(data.text)
        } catch { /* ignore */ }
      }
    }

    if (!doneReceived) onDone()

  } catch (error) {
    console.error('Nesta stream error:', error)
    onDone()
  }
}