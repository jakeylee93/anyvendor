'use client'

import { useState, useEffect } from 'react'

const WORDS = ['life', 'business', 'projects', 'teams', 'creativity', 'health', 'family', 'everything']

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0)
  const [fade, setFade] = useState(true)

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

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        </div>
        <span className="text-2xl font-semibold tracking-tight text-gray-900">anyOS</span>
      </div>

      {/* Rotating tagline */}
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-gray-900 text-center leading-snug mb-16">
        An operating system for{' '}
        <span
          className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 inline-block transition-all duration-400"
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            minWidth: '180px',
          }}
        >
          {WORDS[wordIndex]}
        </span>
      </h1>

      {/* Search box */}
      <div className="w-full max-w-lg">
        <div className="relative">
          <input
            type="text"
            placeholder="What shall we do today?"
            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition shadow-sm"
          />
        </div>
      </div>

      {/* Subtle footer */}
      <p className="mt-16 text-xs text-gray-300">© {new Date().getFullYear()} anyOS</p>
    </main>
  )
}
