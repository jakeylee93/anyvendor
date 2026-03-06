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

/* Margarita avatar — pulsating glowing orb */
function MargaritaAvatar() {
  return (
    <div className="w-8 h-8 rounded-full shrink-0 relative">
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #c084fc, #818cf8, #6366f1, #4f46e5)',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.5), 0 0 24px rgba(99, 102, 241, 0.3)',
        }}
      />
      <div
        className="absolute inset-[2px] rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)',
        }}
      />
    </div>
  )
}

/* User avatar — generic person */
function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0 shadow-sm">
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>
  )
}

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const [wordWidth, setWordWidth] = useState<number | null>(null)

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
    if (wordRef.current) {
      const inner = wordRef.current.querySelector('span')
      if (inner) {
        setWordWidth(inner.getBoundingClientRect().width)
      }
    }
  }, [wordIndex, fade])

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

      <div className="flex flex-col items-center w-full max-w-xl" style={{ gap: '1.25rem' }}>

        {/* Logo */}
        <h2
          className="text-4xl md:text-5xl text-black text-center"
          style={{ fontFamily: "'Poiret One', sans-serif", letterSpacing: '0.12em' }}
        >
          anyOS
        </h2>

        {/* Headline — one line, word in fixed-width slot so nothing shifts */}
        <h1
          className="text-center whitespace-nowrap overflow-hidden"
          style={{
            fontSize: 'min(5vw, 3rem)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
          }}
        >
          <span className="font-semibold tracking-tight text-black shrink-0">An operating system for&nbsp;</span>
          <span
            ref={wordRef}
            className="font-bold inline-block overflow-hidden"
            style={{
              width: wordWidth ? `${wordWidth}px` : 'auto',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <span
              className="inline-block whitespace-nowrap"
              style={{
                color: word.color,
                opacity: fade ? 1 : 0,
                transform: fade ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease, color 0.3s ease',
                textShadow: fade ? `0 0 40px ${word.color}35, 0 0 80px ${word.color}15` : 'none',
              }}
            >
              {word.text}
            </span>
          </span>
        </h1>

        {/* Chat area — Discord-style, contained box */}
        {messages.length > 0 && (
          <div
            className="w-full rounded-2xl border border-black/[0.06] bg-gray-50/50 overflow-hidden mx-auto"
            style={{ maxWidth: '460px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', margin: '0 1.5rem' }}
          >
            <div
              ref={chatRef}
              className="overflow-y-auto px-5 py-5"
              style={{ maxHeight: '280px' }}
            >
              <div className="space-y-5">
                {messages.map((msg, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    {msg.role === 'assistant' ? <MargaritaAvatar /> : <UserAvatar />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-black">
                          {msg.role === 'assistant' ? 'Margarita' : 'You'}
                        </span>
                        <span className="text-[11px] text-black/25">just now</span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-black/80">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-start gap-3.5">
                    <MargaritaAvatar />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-black">Margarita</span>
                      </div>
                      <span className="inline-flex gap-1.5 items-center h-5">
                        <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input box — floating */}
        <div className="w-full" style={{ maxWidth: '440px', padding: '0 0.5rem' }}>
          <div
            className="flex items-center bg-white border border-black/[0.08] rounded-2xl"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="pl-6 flex items-center shrink-0">
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
              className="flex-1 px-4 py-6 bg-transparent text-black placeholder:text-black/25 text-[15px] font-medium focus:outline-none min-w-0"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="mr-3.5 w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-black/80 transition disabled:opacity-15 shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Suggestion chips */}
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {['What can anyOS do?', 'How does setup work?', 'Can you run my business?'].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-4 py-2 text-[11px] font-medium text-black/30 bg-black/[0.02] border border-black/[0.04] rounded-lg hover:bg-black/[0.05] hover:text-black/45 transition"
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
