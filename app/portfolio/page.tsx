'use client'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const SITES = [
  { name: 'The Bar People', desc: 'Mobile bar & hospitality hire', url: 'https://thebarpeople-website.vercel.app', color: '#c8956b', logo: '/case-studies/bar-people.png' },
  { name: 'Butler & Stag', desc: 'Independent estate agents', url: 'https://butlerandstag-website.vercel.app', color: '#d4628b', logo: '/case-studies/butler-stag.png' },
  { name: 'Queen Victoria', desc: 'Traditional McMullen pub since 1898', url: 'https://queenvictoria-website.vercel.app', color: '#c5a55a', logo: '/case-studies/queen-vic.png' },
  { name: 'T&L Executive Cars', desc: 'Luxury chauffeur service', url: 'https://tl-executive.vercel.app', color: '#c8956c', logo: '/case-studies/tl-exec.jpg' },
  { name: 'NotAPrint', desc: 'Custom print & merchandise', url: 'https://notaprint-website.vercel.app', color: '#06b6d4', logo: '/case-studies/notaprint.png' },
  { name: 'JHD Builders', desc: 'Construction & property maintenance', url: 'https://jhd-website.vercel.app', color: '#6db44c', logo: '/case-studies/jhd.png' },
  { name: 'Conectados', desc: 'Community events for expats in Madrid', url: 'https://connect-cardos.vercel.app', color: '#F5B731' },
  { name: 'Left Hand Lucy', desc: 'Freelance services', url: 'https://lefthandlucy-website.vercel.app', color: '#7B9E87' },
  { name: 'Vishal Mayo', desc: 'Personal portfolio', url: 'https://vishalmayo-website.vercel.app', color: '#6366f1', logo: '/case-studies/vishal.jpg' },
  { name: 'Richway', desc: 'Property development', url: 'https://richway-website.vercel.app', color: '#c8956c', logo: '/case-studies/richway.png' },
  { name: 'N2 Acoustics', desc: 'Premium acoustic panels & solutions', url: 'https://n2-acoustics.vercel.app', color: '#c8956c' },
]

export default function Portfolio() {
  return (
    <>
      <Nav />
      <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
        <section style={{ padding: '8rem 2rem 3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, marginBottom: '0.75rem' }}>Portfolio</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'white', fontWeight: 800, lineHeight: 1.05, marginBottom: '1rem' }}>
            Built with anyOS
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            {SITES.length} real websites for real businesses. Each built by AI in hours, not weeks.
          </p>
        </section>

        <section style={{ padding: '0 2rem 6rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {SITES.map((site, i) => (
              <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.25rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '10px', flexShrink: 0,
                  background: site.logo ? '#fff' : `${site.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  {site.logo ? (
                    <img src={site.logo} alt={site.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                  ) : (
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: site.color }}>{site.name.charAt(0)}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px' }}>{site.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{site.desc}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ opacity: 0.2, flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
