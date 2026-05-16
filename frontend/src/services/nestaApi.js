const API_URL = window.location.hostname === 'localhost' 
  ? '/api/nesta' 
  : 'https://nesta-backend-944231955606.us-central1.run.app/api/nesta'

export async function sendMessageStream(message, sessionId = 'default', onChunk, onDone) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        session_id: sessionId,
        consent_given: true,
      }),
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let doneReceived = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.done) {
              doneReceived = true
              onDone()
            } else if (data.text) {
              onChunk(data.text)
            }
          } catch (e) {
            // Ignore malformed JSON
          }
        }
      }
    }

    // Safety net: if stream ended without done event
    if (!doneReceived) {
      onDone()
    }
  } catch (error) {
    console.error('Stream error:', error)
    onDone()
  }
}