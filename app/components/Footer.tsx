import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#050505', padding: '4rem 2rem 2rem', color: 'rgba(255,255,255,0.3)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
            any<span style={{ color: '#6366f1' }}>OS</span>
          </div>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.6, maxWidth: '280px' }}>
            AI that actually does things. Hardware delivered, agents configured, your business transformed.
          </p>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Product</div>
          <Link href="/use-cases" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Use Cases</Link>
          <Link href="/pricing" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Pricing</Link>
          <Link href="/story" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.4rem' }}>The Story</Link>
          <Link href="/portfolio" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem' }}>Portfolio</Link>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Use Cases</div>
          <Link href="/use-cases#print" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Print & Production</Link>
          <Link href="/use-cases#construction" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Construction</Link>
          <Link href="/use-cases#care" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Care Homes</Link>
          <Link href="/use-cases#hospitality" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem' }}>Hospitality</Link>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Contact</div>
          <a href="mailto:jake@anyvendor.co.uk" style={{ display: 'block', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.4rem' }}>jake@anyvendor.co.uk</a>
          <p style={{ fontSize: '0.8rem' }}>Essex, UK</p>
        </div>
      </div>
      <div style={{ maxWidth: '1100px', margin: '3rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
        <span>© 2026 anyOS</span>
        <span>Powered by OpenClaw</span>
      </div>
    </footer>
  )
}
