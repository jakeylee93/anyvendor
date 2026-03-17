'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: scrolled ? '0.6rem 2rem' : '1rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(0,0,0,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'all 0.3s',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
          any<span style={{ color: '#6366f1' }}>OS</span>
        </span>
      </Link>

      {/* Desktop */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
        <Link href="/use-cases" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Use Cases</Link>
        <Link href="/story" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>The Story</Link>
        <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pricing</Link>
        <Link href="/portfolio" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portfolio</Link>
        <Link href="/contact" style={{ background: 'white', color: 'black', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Get Started</Link>
      </div>

      {/* Mobile hamburger */}
      <button onClick={() => setOpen(!open)} className="mobile-nav-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </nav>
  )
}
