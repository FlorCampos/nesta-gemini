// pages/NestaChatPage.jsx
import { useState, useRef, useEffect } from 'react'
import MessageBubble from '../components/MessageBubble'
import TypingIndicator from '../components/TypingIndicator'
import { sendMessageStream } from '../services/nestaApi'

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'nesta',
    text: "Hi! I'm AAtI 😊. I can help you navigate today's sessions, explore career paths, or learn about programs designed for women like you.",
  },
]

export default function NestaChatPage({ consentGiven }) {
  const [messages,  setMessages]  = useState(INITIAL_MESSAGES)
  const [input,     setInput]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const chatEndRef   = useRef(null)
  const textareaRef  = useRef(null)
  const bufferRef    = useRef('')
  const displayedRef = useRef('')
  const nestaIdRef   = useRef(null)
  const intervalRef  = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startTyping = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      if (displayedRef.current.length < bufferRef.current.length) {
        const next = bufferRef.current.slice(displayedRef.current.length, displayedRef.current.length + 2)
        displayedRef.current += next
        const text = displayedRef.current
        const id   = nestaIdRef.current
        setMessages(prev => prev.map(m => m.id === id ? { ...m, text } : m))
      } else if (!isLoading) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, 20)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = { id: Date.now(), sender: 'user', text: input }
    const nestaId = Date.now() + 1
    nestaIdRef.current   = nestaId
    bufferRef.current    = ''
    displayedRef.current = ''

    setMessages(prev => [...prev, userMsg, { id: nestaId, sender: 'nesta', text: '' }])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    try {
      await sendMessageStream(
        input, 'default', consentGiven === true,
        chunk => { bufferRef.current += chunk; startTyping() },
        ()    => { setIsLoading(false) },
      )
    } catch (err) {
      console.error('AAtI stream error:', err)
      setMessages(prev =>
        prev.map(m =>
          m.id === nestaId
            ? { ...m, text: "I'm having trouble connecting right now. Please try again." }
            : m
        )
      )
      setIsLoading(false)
    }
  }

  const hasInput = input.trim().length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* Messages */}
      <div className="chat-scroll" style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        background: '#faf7f5',
        padding: '18px 0 12px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

        {isLoading && bufferRef.current === '' && (
          <div style={{ paddingLeft: 4 }}><TypingIndicator /></div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: '8px 12px 10px',
        borderTop: '0.5px solid rgba(182,144,136,0.2)',
        background: '#ffffff',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onFocus={() => {
            setTimeout(() => { window.scrollTo(0, 0); document.body.scrollTop = 0 }, 50)
            setTimeout(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 300)
          }}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder="Ask AAtI anything..."
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 18,
            border: '0.5px solid rgba(182,144,136,0.3)',
            background: '#faf7f5',
            fontSize: '16px',   // prevents iOS Safari auto-zoom
            color: '#2d2420',
            resize: 'none', outline: 'none', fontFamily: 'inherit',
            lineHeight: 1.45, maxHeight: 100, overflowY: 'auto',
            opacity: isLoading ? 0.5 : 1, transition: 'border 0.15s',
          }}
          onFocus={e => (e.target.style.border = '0.5px solid #b69088')}
          onBlur={e  => (e.target.style.border = '0.5px solid rgba(182,144,136,0.3)')}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !hasInput}
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: hasInput && !isLoading ? '#b69088' : '#d4c0bc',
            border: 'none', cursor: hasInput && !isLoading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.18s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}