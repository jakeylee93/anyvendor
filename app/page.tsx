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
    <main className="min-h-[100dvh] bg-white flex flex-col items-center justify-center px-6">
      {/* Logo mark */}
      <div className="mb-10 md:mb-14">
        <h2 className="text-sm md:text-base font-semibold tracking-[0.35em] uppercase text-black/40">
          anyOS
        </h2>
      </div>

      {/* Rotating tagline */}
      <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-semibold tracking-tight text-black text-center leading-[1.2]">
        An operating system for{' '}
        <span
          className="inline-block text-black/30"
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {WORDS[wordIndex]}
        </span>
      </h1>

      {/* Search box */}
      <div className="mt-10 md:mt-14 w-full max-w-md">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-black/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="What shall we do today?"
            className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-white border border-black/[0.08] text-black placeholder:text-black/25 text-[15px] font-medium focus:outline-none focus:border-black/20 transition"
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-[11px] font-medium tracking-wide text-black/15">
        © {new Date().getFullYear()} anyOS
      </p>
    </main>
  )
}
