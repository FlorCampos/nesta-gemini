import { useState, useRef, useEffect } from 'react'
import MessageBubble from '../components/MessageBubble'
import { sendMessageStream } from '../services/nestaApi'

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'nesta',
    text: "Hi! I'm Nesta 😊. I can help you navigate today's sessions, explore career paths, or learn about programs designed for women like you.",
  },
]

export default function NestaChatPage({ consentGiven }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)
  const bufferRef = useRef('')
  const displayedRef = useRef('')
  const nestaIdRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startTyping = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      if (displayedRef.current.length < bufferRef.current.length) {
        const nextChunk = bufferRef.current.slice(
          displayedRef.current.length,
          displayedRef.current.length + 2
        )
        displayedRef.current += nextChunk
        const currentText = displayedRef.current
        const id = nestaIdRef.current
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, text: currentText } : msg))
        )
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
    nestaIdRef.current = nestaId
    bufferRef.current = ''
    displayedRef.current = ''

    setMessages((prev) => [...prev, userMsg, { id: nestaId, sender: 'nesta', text: '' }])
    setInput('')
    setIsLoading(true)

    try {
      await sendMessageStream(
        input,
        'default',
        consentGiven === true,
        (chunk) => {
          bufferRef.current += chunk
          startTyping()
        },
        () => {
          setIsLoading(false)
        }
      )
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === nestaId
            ? { ...msg, text: "I'm having trouble connecting right now. Please try again." }
            : msg
        )
      )
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-2 chat-scroll">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && bufferRef.current === '' && (
          <div className="flex items-center px-1">
            <div className="w-7 h-7 rounded-full bg-[#b69088] flex items-center justify-center text-white text-xs font-medium mr-2 shrink-0">
              N
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-[#b69088] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#b69088] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#b69088] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-[#b69088] italic ml-1">Nesta is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex gap-2 items-end bg-white w-full overflow-hidden box-border">
        <textarea
          value={input}
          onFocus={() => {
            setTimeout(() => {
              window.scrollTo(0, 0)
              document.body.scrollTop = 0
              document.documentElement.scrollTop = 0
            }, 50)
            setTimeout(() => {
              window.scrollTo(0, 0)
              chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 300)
          }}
          onChange={(e) => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Ask Nesta anything..."
          disabled={isLoading}
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-base text-gray-900 outline-none focus:border-[#b69088] disabled:opacity-50 resize-none overflow-hidden"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-[#b69088] flex items-center justify-center disabled:opacity-50 shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}