'use client'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Contact() {
  return (
    <>
      <Nav />
      <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
        <section style={{ padding: '8rem 2rem 6rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, marginBottom: '0.75rem' }}>Get Started</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: 'white', fontWeight: 800, lineHeight: 1.05, marginBottom: '1rem' }}>
              Let&apos;s talk about your business
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6 }}>
              Book a discovery call or drop us an email. We&apos;ll show you exactly what anyOS looks like for your industry.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <a href="mailto:jake@anyvendor.co.uk" style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.5rem', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              textDecoration: 'none',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Email</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>jake@anyvendor.co.uk</div>
              </div>
            </a>

            <div style={{
              padding: '1.5rem', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Location</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Essex, United Kingdom</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
