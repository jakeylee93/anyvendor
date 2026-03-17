'use client'

import Link from 'next/link'
import Nav from './components/Nav'
import Footer from './components/Footer'

const INDUSTRIES = [
  { name: 'Print & Production', icon: '🖨️', color: '#f59e0b', href: '/use-cases#print' },
  { name: 'Construction', icon: '🏗️', color: '#22c55e', href: '/use-cases#construction' },
  { name: 'Care Homes', icon: '🏥', color: '#ec4899', href: '/use-cases#care' },
  { name: 'Hospitality', icon: '🍸', color: '#8b5cf6', href: '/use-cases#hospitality' },
  { name: 'Property', icon: '🏠', color: '#06b6d4', href: '/use-cases#property' },
  { name: 'Accounting', icon: '📊', color: '#10b981', href: '/use-cases#accounting' },
]

const TIERS = [
  { name: 'Personal', price: '5,000', hardware: 'MacBook Air', agents: 1, color: '#6366f1' },
  { name: 'Business', price: '10,000', hardware: 'MacBook Pro', agents: 2, color: '#8b5cf6', popular: true },
  { name: 'Business Super', price: '20,000', hardware: 'Mac Studio', agents: 3, color: '#a855f7' },
  { name: 'Business Super+', price: '35,000', hardware: 'Mac Studio + MacBook Pro', agents: 4, color: '#c084fc' },
  { name: 'Super Premium', price: '50,000', hardware: 'Mac Studio + MacBook Pro + iPad Pro + iPad Mini', agents: 5, color: '#e879f9' },
]

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ background: '#0a0a0a' }}>
        {/* ═══ HERO ═══ */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '6rem 2rem 4rem', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle grid background */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
            <div style={{
              display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '20px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              fontSize: '0.7rem', fontWeight: 700, color: '#6366f1',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem',
            }}>
              AI that actually does things
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(3rem, 7vw, 5rem)',
              fontWeight: 800, color: 'white', lineHeight: 1,
              letterSpacing: '-0.03em', marginBottom: '1.5rem',
            }}>
              Your business,<br />
              <span style={{ color: '#6366f1' }}>automated.</span>
            </h1>

            <p style={{
              fontSize: '1.15rem', color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.6, maxWidth: '550px', margin: '0 auto 2.5rem',
            }}>
              Hardware delivered. AI agents configured. Your emails, calendar, invoices,
              quotes, scheduling and communications — handled.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/use-cases" style={{
                display: 'inline-block', padding: '0.875rem 2.5rem',
                background: 'white', color: 'black', textDecoration: 'none',
                fontSize: '0.8rem', fontWeight: 800, borderRadius: '6px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                See Use Cases
              </Link>
              <Link href="/story" style={{
                display: 'inline-block', padding: '0.875rem 2.5rem',
                background: 'transparent', color: 'white', textDecoration: 'none',
                fontSize: '0.8rem', fontWeight: 800, borderRadius: '6px',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                The Story →
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Scroll to explore
          </div>
        </section>

        {/* ═══ INDUSTRY CARDS ═══ */}
        <section style={{ padding: '4rem 2rem', background: '#060608' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, marginBottom: '0.5rem' }}>Built For</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'white', fontWeight: 800, lineHeight: 1.05 }}>
                Every industry. Every workflow.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {INDUSTRIES.map(ind => (
                <Link key={ind.name} href={ind.href} style={{
                  padding: '2rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  textDecoration: 'none', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                }}>
                  <div style={{ fontSize: '2.5rem' }}>{ind.icon}</div>
                  <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800 }}>{ind.name}</div>
                  <div style={{ color: ind.color, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>View dashboard →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section style={{ padding: '6rem 2rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, marginBottom: '0.5rem' }}>How It Works</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'white', fontWeight: 800, lineHeight: 1.05 }}>
                Delivered. Configured. Done.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {[
                { step: '01', title: 'We deliver the hardware', desc: 'Brand new Mac, pre-configured with anyOS and your AI agents. Plug in and go.' },
                { step: '02', title: 'Agents learn your business', desc: 'We connect your email, calendar, accounting, CRM — everything your agents need.' },
                { step: '03', title: 'Your team starts asking', desc: 'Talk to your agents in plain English. They do the work. You review the results.' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: '2rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', fontWeight: 800, color: 'rgba(99,102,241,0.3)', marginBottom: '1rem' }}>{s.step}</div>
                  <div style={{ color: 'white', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{s.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING PREVIEW ═══ */}
        <section style={{ padding: '6rem 2rem', background: '#060608' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, marginBottom: '0.5rem' }}>Pricing</div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'white', fontWeight: 800, lineHeight: 1.05 }}>
                Hardware + AI. One price.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.95rem', maxWidth: '500px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
                No subscriptions. No per-seat fees. You own the hardware and the system.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
              {TIERS.map(t => (
                <div key={t.name} style={{
                  padding: '1.5rem', borderRadius: '12px',
                  background: t.popular ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                  border: t.popular ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                }}>
                  {t.popular && (
                    <div style={{ position: 'absolute', top: '-10px', right: '12px', padding: '2px 10px', borderRadius: '4px', background: '#6366f1', fontSize: '0.6rem', fontWeight: 800, color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Popular</div>
                  )}
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{t.name}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
                    £{t.price}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>{t.hardware}</div>
                  <div style={{ fontSize: '0.8rem', color: t.color, fontWeight: 700 }}>{t.agents} Agent{t.agents > 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/pricing" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>View full pricing details →</Link>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.05 }}>
            Ready to automate?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Book a discovery call. We&apos;ll show you exactly what anyOS looks like for your business.
          </p>
          <Link href="/contact" style={{
            display: 'inline-block', padding: '0.875rem 3rem',
            background: 'white', color: 'black', textDecoration: 'none',
            fontSize: '0.8rem', fontWeight: 800, borderRadius: '6px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Get Started
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
