'use client'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Link from 'next/link'

const TIERS = [
  { name: 'Personal', price: '5,000', hardware: ['MacBook Air'], agents: 1, color: '#6366f1', features: ['1 AI agent', 'Email & calendar integration', 'Basic automations', 'Discord/Telegram support', '30-day setup support'] },
  { name: 'Business', price: '10,000', hardware: ['MacBook Pro'], agents: 2, color: '#8b5cf6', popular: true, features: ['2 AI agents', 'Full email, calendar, CRM', 'Quote & invoice automation', 'Multi-channel comms', '90-day setup support'] },
  { name: 'Business Super', price: '20,000', hardware: ['Mac Studio'], agents: 3, color: '#a855f7', features: ['3 AI agents', 'Everything in Business', 'Accounting integration (Xero/Sage)', 'Custom dashboards', '6-month support'] },
  { name: 'Business Super+', price: '35,000', hardware: ['Mac Studio', 'MacBook Pro'], agents: 4, color: '#c084fc', features: ['4 AI agents', 'Everything in Super', 'Multi-device setup', 'Advanced workflow automation', '12-month support'] },
  { name: 'Super Premium', price: '50,000', hardware: ['Mac Studio', 'MacBook Pro', 'iPad Pro', 'iPad Mini'], agents: 5, color: '#e879f9', features: ['5 AI agents', 'Everything in Super+', 'Full mobile + desktop', 'Custom integrations', 'Ongoing support & updates'] },
]

export default function Pricing() {
  return (
    <>
      <Nav />
      <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
        <section style={{ padding: '8rem 2rem 3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, marginBottom: '0.75rem' }}>Pricing</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'white', fontWeight: 800, lineHeight: 1.05, marginBottom: '1rem' }}>
            One price. Everything included.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Hardware. Software. Setup. Training. No subscriptions, no per-seat fees, no hidden costs. You own it.
          </p>
        </section>

        <section style={{ padding: '0 2rem 6rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
            {TIERS.map(t => (
              <div key={t.name} style={{
                padding: '2rem 1.5rem', borderRadius: '12px',
                background: t.popular ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                border: t.popular ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)',
                position: 'relative', display: 'flex', flexDirection: 'column',
              }}>
                {t.popular && <div style={{ position: 'absolute', top: '-10px', right: '12px', padding: '3px 12px', borderRadius: '4px', background: '#6366f1', fontSize: '0.6rem', fontWeight: 800, color: 'white', textTransform: 'uppercase' }}>Most Popular</div>}
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{t.name}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>£{t.price}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>one-time payment</div>
                <div style={{ fontSize: '0.8rem', color: t.color, fontWeight: 700, marginBottom: '0.5rem' }}>{t.agents} Agent{t.agents > 1 ? 's' : ''}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>{t.hardware.join(' + ')}</div>
                <div style={{ flex: 1 }}>
                  {t.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link href="/contact" style={{
                  display: 'block', textAlign: 'center', marginTop: '1.5rem',
                  padding: '0.65rem', borderRadius: '6px',
                  background: t.popular ? 'white' : 'rgba(255,255,255,0.05)',
                  color: t.popular ? 'black' : 'rgba(255,255,255,0.5)',
                  textDecoration: 'none', fontSize: '0.75rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Get Started</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
