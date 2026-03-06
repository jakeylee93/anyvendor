'use client'

import { useState, useEffect, useRef } from 'react'

const WORDS = [
  { text: 'life', color: '#F59E0B' },
  { text: 'business', color: '#6366F1' },
  { text: 'projects', color: '#10B981' },
  { text: 'teams', color: '#3B82F6' },
  { text: 'creativity', color: '#EC4899' },
  { text: 'health', color: '#14B8A6' },
  { text: 'family', color: '#F97316' },
  { text: 'everything', color: '#8B5CF6' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length)
        setFade(true)
      }, 300)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const msg = (text || query).trim()
    if (!msg || loading) return
    setQuery('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: msg }] }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'Something went wrong.' }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const word = WORDS[wordIndex]

  return (
    <main className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-8 md:px-12">

      <div className="flex flex-col items-center w-full max-w-xl" style={{ gap: '3rem' }}>

        {/* Logo */}
        <h2 className="text-sm md:text-base font-semibold tracking-[0.35em] uppercase text-black/40 text-center">
          anyOS
        </h2>

        {/* Headline — always one line, scales down on mobile */}
        <h1 className="text-center whitespace-nowrap" style={{ fontSize: 'min(5.5vw, 3.2rem)' }}>
          <span className="font-semibold tracking-tight text-black">An operating system for </span>
          <span
            className="font-bold inline-block"
            style={{
              color: word.color,
              opacity: fade ? 1 : 0,
              transform: fade ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease, color 0.3s ease',
              textShadow: fade ? `0 0 40px ${word.color}35, 0 0 80px ${word.color}15` : 'none',
            }}
          >
            {word.text}
          </span>
        </h1>

        {/* Chat messages */}
        {messages.length > 0 && (
          <div
            ref={chatRef}
            className="w-full max-h-[35vh] overflow-y-auto space-y-4"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3.5 text-[15px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-black text-white rounded-2xl rounded-br-md'
                      : 'bg-gray-100 text-black rounded-2xl rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black px-5 py-3.5 rounded-2xl rounded-bl-md">
                  <span className="inline-flex gap-1.5 items-center h-5">
                    <span className="w-2 h-2 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input box — floating with shadow */}
        <div className="w-full" style={{ maxWidth: '480px' }}>
          <div
            className="flex items-center bg-white border border-black/[0.08] rounded-2xl"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="pl-5 flex items-center shrink-0">
              <svg className="w-[18px] h-[18px] text-black/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What shall we do today?"
              className="flex-1 px-4 py-5 bg-transparent text-black placeholder:text-black/25 text-[15px] font-medium focus:outline-none min-w-0"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="mr-3 w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-black/80 transition disabled:opacity-15 shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {['What can anyOS do?', 'How does setup work?', 'Can you run my business?'].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-5 py-2.5 text-xs font-medium text-black/35 bg-black/[0.03] border border-black/[0.04] rounded-xl hover:bg-black/[0.06] hover:text-black/50 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-[11px] font-medium tracking-wide text-black/15">
          © {new Date().getFullYear()} anyOS
        </p>

      </div>
    </main>
  )
}
