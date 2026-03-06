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
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!query.trim() || loading) return
    const userMsg = query.trim()
    setQuery('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] }),
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
    <main className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-10 md:mb-14">
        <h2 className="text-sm md:text-base font-semibold tracking-[0.35em] uppercase text-black/40">
          anyOS
        </h2>
      </div>

      {/* Rotating tagline */}
      <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-semibold tracking-tight text-black text-center leading-[1.2] mb-12 md:mb-16">
        An operating system for{' '}
        <span
          className="inline-block relative font-bold"
          style={{
            color: word.color,
            opacity: fade ? 1 : 0,
            transform: fade ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease, color 0.4s ease',
            textShadow: fade ? `0 0 30px ${word.color}40, 0 0 60px ${word.color}20` : 'none',
          }}
        >
          {word.text}
        </span>
      </h1>

      {/* Chat area */}
      {messages.length > 0 && (
        <div
          ref={chatRef}
          className="w-full max-w-xl mb-6 max-h-[40vh] overflow-y-auto space-y-4 px-1"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-br-md'
                    : 'bg-gray-100 text-black rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-black px-5 py-3 rounded-2xl rounded-bl-md text-[15px]">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input box */}
      <div className="w-full max-w-xl">
        <div
          className="relative flex items-center bg-gray-50 border border-black/[0.08] rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)' }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="What shall we do today?"
            className="flex-1 px-6 py-5 bg-transparent text-black placeholder:text-black/25 text-base font-medium focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !query.trim()}
            className="mr-3 w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-black/80 transition disabled:opacity-20 disabled:hover:bg-black shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['What can anyOS do?', 'How does setup work?', 'Can you run my business?'].map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); }}
                className="px-4 py-2 text-xs font-medium text-black/30 bg-black/[0.03] rounded-lg hover:bg-black/[0.06] hover:text-black/50 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-auto pt-12 text-[11px] font-medium tracking-wide text-black/15">
        © {new Date().getFullYear()} anyOS
      </p>
    </main>
  )
}
