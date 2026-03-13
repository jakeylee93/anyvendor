'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const SLIDE_TITLES = [
  'anyOS',
  'Web 1.0 — The Read-Only Web',
  'Web 2.0 — The Social Web',
  'Web 3.0 — The Decentralised Web',
  'Web 4.0 — The Agentic Web',
  'Web 5.0 — The Autonomous Web',
  'The World Is Moving. Are You?',
  'How I Got Here',
  'What I Built — anyOS',
  'Let Me Show You',
  'What Just Happened',
]

/* ===== TOP NAV BAR ===== */
function TopNav({ current, total, title, onPrev, onNext }: { current: number; total: number; title: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="top-nav">
      <button className="nav-arrow" onClick={onPrev} disabled={current === 1} aria-label="Previous slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div className="nav-info">
        <span className="nav-count">{current} <span className="nav-of">of</span> {total}</span>
        <span className="nav-title">{title}</span>
      </div>
      <button className="nav-arrow" onClick={onNext} disabled={current === total} aria-label="Next slide">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <span className="nav-hint">← →</span>
    </div>
  )
}

/* ===== TIMELINE (slides 1-6) ===== */
function Timeline({ active }: { active: number }) {
  return (
    <div className="timeline">
      <div className="timeline-track">
        {[1,2,3,4,5].map((n, i) => (
          <span key={n} style={{display:'contents'}}>
            {i > 0 && <div className={`timeline-segment ${active >= n ? 'filled' : ''}`} />}
            <div className={`timeline-node ${active >= n ? 'active' : ''}`} />
          </span>
        ))}
      </div>
      <div className="timeline-labels">
        {['1.0','2.0','3.0','4.0','5.0'].map((label, i) => (
          <span key={label} className={active === i+1 ? 'active' : ''}>
            {active === 6 && i === 4 ? 'YOU ARE HERE' : label}{active === i+1 && i === 4 ? ' — ?' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ===== PROGRESS BAR (slides 7-10) ===== */
function Progress({ page }: { page: number }) {
  return (
    <div className="progress-bar">
      <div className="progress-dots">
        {Array.from({length:10}).map((_,i) => (
          <div key={i} className={`progress-dot ${i < page-1 ? 'done' : ''} ${i === page-1 ? 'current' : ''}`} />
        ))}
      </div>
      <div className="progress-labels">Page <span>{page}</span> of 10</div>
    </div>
  )
}

const ALL_LOGOS = [
  'openai','anthropic','googlegemini','perplexity','huggingface','ollama',
  'discord','telegram','whatsapp','slack','gmail','signal','zoom',
  'github','vercel','docker','supabase','postgresql','redis','mongodb','cloudflare',
  'python','javascript','typescript','react','nextdotjs','nodedotjs','tailwindcss','html5',
  'stripe','googlecalendar','googledrive','googlesheets','notion','trello','zapier','airtable',
  'brave','googlechrome','elevenlabs','figma',
  'npm','apple','linux','git','sass','wordpress','shopify','xero','dropbox','visualstudiocode',
]

function FloatingLogos() {
  // Randomize on mount — shuffle logos and assign random positions
  const [items] = useState(() => {
    // Shuffle all logos
    const shuffled = [...ALL_LOGOS].sort(() => Math.random() - 0.5)
    // 30 logo slots — ensures ~15 always visible with no gaps
    const count = 30
    const colWidth = 92 / count
    return Array.from({ length: count }, (_, i) => {
      const baseLeft = 2 + i * colWidth
      const jitter = (Math.random() - 0.5) * colWidth * 0.5
      return {
        src: `/logos/icon-${shuffled[i % shuffled.length]}.svg`,
        left: `${Math.max(1, Math.min(95, baseLeft + jitter))}%`,
        delay: `${-(Math.random() * 14)}s`, // spread across 14s of a ~14s cycle
        duration: `${12 + Math.random() * 4}s`, // faster: 12-16s
      }
    })
  })

  return (
    <>
      {items.map((l, i) => (
        <img
          key={i}
          src={l.src}
          alt=""
          className="float-up-logo"
          style={{
            left: l.left,
            animationDuration: l.duration,
            animationDelay: l.delay,
          }}
        />
      ))}
    </>
  )
}

const ROTATING_WORDS = [
  'Life',
  'Business',
  'Family',
  'Everything',
  'Creativity',
  'Events',
  'Growth',
  'Your Team',
  'Anything',
  'The Future',
]

function RotatingWord() {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_WORDS.length)
        setFade(true)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={`rotating-word ${fade ? 'visible' : ''}`}>
      {ROTATING_WORDS[index]}
    </span>
  )
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [expandedCompany, setExpandedCompany] = useState<string|null>(null)

  const companies = [
    { name: 'Spotify', detail: '— Music streaming giant', number: '1,500 jobs cut', info: 'Spotify announced workforce reductions during its AI and efficiency push, while expanding internal tooling for personalization, ad optimization, and automated workflows.' },
    { name: 'Ocado', detail: '— UK grocery tech (AI improved engineering productivity)', number: '1,500 jobs cut', info: 'Ocado has increasingly automated logistics and engineering processes, using AI and robotics to improve throughput and reduce manual overhead in core operations.' },
    { name: 'Duolingo', detail: '— 10% contractors replaced, AI graded in reviews', number: 'AI-first policy', info: 'Duolingo publicly framed itself as AI-first, expanded AI-generated lesson workflows, and changed hiring and contractor strategy around AI-assisted production.' },
    { name: 'Meta', detail: '— Restructured entire teams around AI capabilities', number: 'Thousands cut', info: 'Meta consolidated teams, shifted investment into AI infrastructure and models, and prioritized AI-powered product features across consumer and enterprise lines.' },
    { name: 'Google', detail: '— Shifted capital from headcount to AI infrastructure', number: 'Thousands cut', info: 'Google redirected spend into AI compute, TPU/GPU infrastructure, and model development while streamlining org structures in adjacent functions.' },
    { name: 'Amazon', detail: '— Automated warehouse ops, reduced logistics staff', number: 'Thousands cut', info: 'Amazon expanded robotics and AI planning in fulfillment and logistics, reducing reliance on manual task routing and repetitive warehouse functions.' },
  ]

  const goPrev = useCallback(() => {
    setActiveSlide(s => Math.max(0, s - 1))
    window.scrollTo(0, 0)
  }, [])
  const goNext = useCallback(() => {
    setActiveSlide(s => Math.min(10, s + 1))
    window.scrollTo(0, 0)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goPrev, goNext])

  // Touch swipe (horizontal only)
  const touchStart = useRef<{x:number;y:number}|null>(null)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStart.current = null
  }, [goNext, goPrev])

  return (
    <div className="presentation-root">
      <TopNav
        current={activeSlide + 1}
        total={11}
        title={SLIDE_TITLES[activeSlide] || ''}
        onPrev={goPrev}
        onNext={goNext}
      />
      <div className="bottom-bar">
        {activeSlide === 0 ? (
          <div style={{textAlign:'center',fontSize:'11px',color:'#999',fontWeight:500}}>Swipe or press → to begin</div>
        ) : activeSlide < 7 ? (
          <Timeline active={activeSlide < 6 ? activeSlide : 6} />
        ) : (
          <Progress page={activeSlide + 1} />
        )}
      </div>
      <div className="slides-container" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>


      {/* ===== SLIDE 0: TITLE ===== */}
      <div className={`slide-snap ${activeSlide === 0 ? "active" : ""}`}>
        <div className="slide-page title-slide">
          <div className="title-logos-bg">
            <FloatingLogos />
          </div>
          <div className="title-content">
            <div className="title-logo">
              any<span>OS</span>
            </div>
            <div className="title-divider" />
            <div className="title-subtitle">
              an operating system for <span className="rotating-word-wrapper"><RotatingWord /></span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 1: WEB 1.0 ===== */}
      <div className={`slide-snap ${activeSlide === 1 ? "active" : ""}`}>
        <div className="slide-page web1">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Evolution of the Web</div>
              <div className="position-label past">WHERE IT ALL STARTED</div>
            </div>
          </div>
          <div className="era-number">1.0</div>
          <div className="era-content">
            <div className="era-subtitle">The Read-Only Web</div>
            <h1 className="era-title">Web 1.0</h1>
            <div className="era-period">1990 — 2004</div>
            <p className="description">The internet&apos;s first chapter. Static HTML pages, dial-up connections, and one-way communication. Websites were digital brochures — you could read them but couldn&apos;t interact, post, or share. Building a website required technical knowledge of HTML. There were no templates, no editors, no social features. The web was a library, not a conversation.</p>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                  <h3>Static Pages</h3>
                </div>
                <p>No interactivity. Pages coded by hand in HTML. Updating content meant rewriting code and re-uploading via FTP. No databases, no dynamic content.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
                  <h3>Read-Only</h3>
                </div>
                <p>Users were consumers, not creators. No comments, no profiles, no uploads. The publisher controlled everything. One-directional communication.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                  <h3>Dial-Up Connections</h3>
                </div>
                <p>56kbps speeds. Pages took minutes to load. Images were rare and tiny. Video was impossible. Broadband didn&apos;t become mainstream until the early 2000s.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                  <h3>Web Directories</h3>
                </div>
                <p>Before Google (1998), websites were found via curated directories like Yahoo! and DMOZ. You browsed categories, not search results.</p>
              </div>
            </div>
            <div className="examples-bar">
              {['GeoCities','Yahoo!','AltaVista','Netscape','HTML','Dial-Up','FTP'].map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="key-stat">
              <p>By 2000, there were ~17 million websites worldwide. Today there are over 1.9 billion.</p>
              <p className="stat-sub">The entire internet had fewer websites than a single social platform has users today.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 2: WEB 2.0 ===== */}
      <div className={`slide-snap ${activeSlide === 2 ? "active" : ""}`}>
        <div className="slide-page web2">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Evolution of the Web</div>
              <div className="position-label grew">WHERE WE GREW UP</div>
            </div>
          </div>
          <div className="era-number">2.0</div>
          <div className="era-content">
            <div className="era-subtitle">The Social Web</div>
            <h1 className="era-title">Web 2.0</h1>
            <div className="era-period">2004 — 2018</div>
            <p className="description">The internet became a two-way conversation. Users could read AND write — post, share, comment, create. MySpace (2003) was one of the first platforms where users customised their own page. WordPress democratised website creation. The iPhone (2007) put the internet in everyone&apos;s pocket. This era created the &quot;creator economy&quot; and changed how businesses market, sell, and communicate.</p>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                  <h3>User-Generated Content</h3>
                </div>
                <p>Anyone could publish. Blogs, videos, photos, reviews. By 2010, 500 million Facebook users were creating content daily.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                  <h3>Social Networks</h3>
                </div>
                <p>MySpace (2003), Facebook (2004), Twitter (2006), Instagram (2010). Human relationships moved online. Marketing shifted from billboards to feeds.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>
                  <h3>Mobile Revolution</h3>
                </div>
                <p>iPhone launched 2007. By 2015, mobile overtook desktop traffic. Apps became the primary internet interface.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg></div>
                  <h3>Cloud &amp; SaaS</h3>
                </div>
                <p>Software moved online. Google Docs replaced Office for many. Dropbox replaced USB sticks. Monthly subscriptions replaced software boxes.</p>
              </div>
            </div>
            <div className="examples-bar">
              {['MySpace','Facebook','YouTube','WordPress','Twitter','Instagram','iPhone','Google Docs'].map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="key-stat">
              <p>Most businesses today still operate in Web 2.0. Manual emails, WordPress sites, social media managed by humans, one task at a time.</p>
              <p className="stat-sub">The tools changed, but the workflow didn&apos;t.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 3: WEB 3.0 ===== */}
      <div className={`slide-snap ${activeSlide === 3 ? "active" : ""}`}>
        <div className="slide-page web3">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Evolution of the Web</div>
              <div className="position-label recent">THE RECENT PAST</div>
            </div>
          </div>
          <div className="era-number">3.0</div>
          <div className="era-content">
            <div className="era-subtitle">The Decentralised Web</div>
            <h1 className="era-title">Web 3.0</h1>
            <div className="era-period">2018 — 2023</div>
            <p className="description">The ownership era. Blockchain promised to decentralise the internet — removing middlemen from finance, art, and digital ownership. Bitcoin went mainstream, NFTs exploded, and DeFi let people lend, borrow, and trade without banks. During 2020&apos;s lockdown, many entrepreneurs turned to crypto and automated trading to survive. This era taught a crucial lesson: <strong>software can work while you sleep.</strong></p>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
                  <h3>Blockchain Technology</h3>
                </div>
                <p>Decentralised ledgers recording transactions across thousands of computers. No single point of failure. Transparent, permanent, tamper-proof records.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                  <h3>Cryptocurrency</h3>
                </div>
                <p>Bitcoin launched 2009, went mainstream 2017-2021. Ethereum introduced smart contracts — programmable money that executes agreements automatically.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                  <h3>NFTs &amp; Digital Ownership</h3>
                </div>
                <p>Non-Fungible Tokens proved you could own digital assets. While the hype crashed, verifiable digital ownership remains important for future media and IP.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
                  <h3>Automated Trading &amp; DeFi</h3>
                </div>
                <p>Decentralised finance removed banks. Trading bots proved software could generate value 24/7 without humans. This planted the seed for what comes next.</p>
              </div>
            </div>
            <div className="examples-bar">
              {['Bitcoin','Ethereum','OpenSea','MetaMask','Uniswap','Smart Contracts','Trading Bots'].map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="key-stat">
              <p>Web 3.0 proved software could execute complex tasks autonomously. The next question was inevitable: what if AI could do the same for every business task?</p>
              <p className="stat-sub">That question led directly to Web 4.0.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 4: WEB 4.0 ===== */}
      <div className={`slide-snap ${activeSlide === 4 ? "active" : ""}`}>
        <div className="slide-page web4">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Evolution of the Web</div>
              <div className="position-label now">WHERE WE ARE NOW</div>
            </div>
          </div>
          <div className="era-number">4.0</div>
          <div className="era-content">
            <div className="era-subtitle">The Agentic Web</div>
            <h1 className="era-title">Web 4.0</h1>
            <div className="era-period">2023 — Present</div>
            <p className="description">The AI era. ChatGPT launched November 2022 and reached 100 million users in two months — the fastest adoption of any technology in history. Software no longer just displays information — it <strong>acts</strong>. AI agents write emails, build websites, manage projects, and make decisions. Natural language is the new interface.</p>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 14H5a2 2 0 0 0-2 2v2h18v-2a2 2 0 0 0-2-2z"/><line x1="12" y1="10" x2="12" y2="14"/></svg></div>
                  <h3>AI Agents</h3>
                </div>
                <p>Software that takes initiative. Reads emails, drafts responses, schedules meetings, updates databases, builds code. Not tools — assistants that think, learn, execute.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                  <h3>Natural Language Interface</h3>
                </div>
                <p>No coding required. No complex software to learn. Type in plain English: &quot;Build me a website&quot; → built. &quot;Email the client&quot; → sent. Conversation is the interface.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                  <h3>Autonomous Automation</h3>
                </div>
                <p>Repetitive tasks handled automatically. Invoice processing, email triage, report generation, file conversions — all running while your team focuses on creative work.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
                  <h3>Total Integration</h3>
                </div>
                <p>AI connects all your tools into one system. Email, calendar, project management, accounting, websites, social — unified under one intelligent layer.</p>
              </div>
            </div>
            <div className="examples-bar">
              {['ChatGPT','Claude','Gemini','anyOS','Copilot','Midjourney','AI Agents'].map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="key-stat">
              <p>The businesses that adopt Web 4.0 in 2025 will own 2030. The ones that wait will spend the next decade catching up — or won&apos;t survive at all.</p>
              <p className="stat-sub">anyOS brings Web 4.0 to your business — not to replace your team, but to make them unstoppable.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 5: WEB 5.0 ===== */}
      <div className={`slide-snap ${activeSlide === 5 ? "active" : ""}`}>
        <div className="slide-page web5">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Evolution of the Web</div>
              <div className="position-label future">WHAT COMES NEXT?</div>
            </div>
          </div>
          <div className="era-number">5.0</div>
          <div className="era-content">
            <div className="era-subtitle">The Autonomous Web</div>
            <h1 className="era-title">What Will Web 5.0 Be?</h1>
            <div className="era-period">The Next Frontier</div>
            <p className="description">Nobody knows exactly when Web 5.0 will arrive. But the trajectory is clear. Each era gave humans more power: reading, then creating, then owning, then automating. Web 5.0 will likely be the era where <strong>AI and humans become equals</strong> — not tools we direct, but partners we collaborate with.</p>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg></div>
                  <h3>Fully Autonomous Businesses</h3>
                </div>
                <p>Entire companies run by 2-3 humans and hundreds of AI agents. AI doesn&apos;t assist — it operates. Humans set strategy, AI executes everything else.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg></div>
                  <h3>AI-to-AI Communication</h3>
                </div>
                <p>Your system talks to your client&apos;s system directly. Quotes, approvals, scheduling — machines negotiating with machines. No emails, no phone tag.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                  <h3>Predictive Operations</h3>
                </div>
                <p>AI doesn&apos;t wait for problems — it prevents them. Knows you need stock before you run out. Knows a client is unhappy before they complain.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                  <h3>Digital Twins</h3>
                </div>
                <p>AI versions of your best employees that work 24/7, trained on their expertise. Your top salesperson&apos;s knowledge, available to every new hire instantly.</p>
              </div>
            </div>
            <div className="examples-bar">
              {['Autonomous Agents','Machine-to-Machine','Predictive AI','Voice-First','Zero-Code','Digital Twins','Hyper-Personalisation'].map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="key-stat">
              <p>If Web 4.0 is AI assisting humans, Web 5.0 is AI and humans as true partners. The question is — will your business have mastered Web 4.0 before Web 5.0 arrives?</p>
              <p className="stat-sub">The gap between early adopters and laggards will become unbridgeable. The time to start is now.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 6: BUSINESS CASE ===== */}
      <div className={`slide-snap ${activeSlide === 6 ? "active" : ""}`}>
        <div className="slide-page page6">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Business Case</div>
              <div className="position-label urgent">ACT NOW</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div style={{color:'#dc2626',fontSize:'clamp(10px,1.2vw,14px)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',marginBottom:'0.3vh'}}>Why This Can&apos;t Wait</div>
            <h1 className="era-title">The World Is Moving.<br/>Are You?</h1>
            <div className="era-period" style={{marginBottom:'1.5vh'}}>Companies already reshaping around AI — 2024/2025</div>

            <div className="stat-list">
              {companies.map(c => (
                <div key={c.name}>
                  <div className="stat-row" onClick={() => setExpandedCompany(expandedCompany === c.name ? null : c.name)}>
                    <div><span className="company">{c.name}</span> <span className="detail">{c.detail}</span></div>
                    <div className="number">{c.number}</div>
                  </div>
                  <div className={`company-detail ${expandedCompany === c.name ? 'open' : ''}`}>{c.info}</div>
                </div>
              ))}
              <div className="stat-row" style={{borderBottom:'none',background:'#fef2f2'}}>
                <div><span className="company" style={{color:'#dc2626'}}>Total tech layoffs 2025</span></div>
                <div className="number" style={{fontSize:'clamp(14px,1.6vw,20px)'}}>100,000+</div>
              </div>
            </div>

            <div className="features" style={{marginBottom:'1.5vh'}}>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                  <h3>The Window Is Closing</h3>
                </div>
                <p>Early adopters are already 2 years ahead. Every month without AI is a month your competitors gain ground.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
                  <h3>The Cost of Waiting</h3>
                </div>
                <p>If your average employee costs £35/hr and AI saves 10 hours/week, that&apos;s £14,000/month for a 10-person team — £168,000/year.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                  <h3>Enhance, Don&apos;t Replace</h3>
                </div>
                <p>Big tech is cutting. We&apos;re empowering. anyOS makes your existing team faster, smarter, and more productive.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <h3>First-Mover Advantage</h3>
                </div>
                <p>Be the first in your industry to adopt. While competitors are still debating, you&apos;re already delivering faster, cheaper, and smarter.</p>
              </div>
            </div>
            <div className="key-stat">
              <p>The question isn&apos;t whether AI will change your industry. It already is. The only question is whether you&apos;ll lead that change — or be left behind.</p>
              <p className="stat-sub">anyOS is your bridge into Web 4.0. One system. One partner. Zero excuses.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 7: HOW I GOT HERE ===== */}
      <div className={`slide-snap ${activeSlide === 7 ? "active" : ""}`}>
        <div className="slide-page page7">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The anyOS Story</div>
              <div className="position-label" style={{background:'#4338ca'}}>MY JOURNEY</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div className="era-subtitle">20 Years of Building, Learning &amp; Evolving</div>
            <h1 className="era-title">How I Got Here</h1>
            <div className="era-period" style={{marginBottom:'1.5vh'}}>From MySpace to AI — a self-taught path through every era of the web</div>
            <p className="description">I&apos;m not a developer by trade. I&apos;ve never had a computer science degree. But I&apos;ve spent 20 years understanding how the web works — building, breaking, learning. Every era taught me something. And when AI arrived, everything clicked.</p>
            <div className="journey-timeline">
              {[
                {year:'2005',text:<><strong>MySpace &amp; Freewebs.</strong> Taught myself HTML to customise profiles. Built free sites for friends. First taste of web building.</>},
                {year:'2010',text:<><strong>WordPress era.</strong> Building real websites for small businesses. Free. Learning by doing. Understood CMS, hosting, domains, SEO.</>},
                {year:'2014',text:<><strong>Founded The Bar People.</strong> Built the business from scratch — website, booking system, marketing. Tech isn&apos;t separate from business. It IS the business.</>},
                {year:'2017',text:<><strong>Cryptocurrency.</strong> Invested in Bitcoin and Ethereum. Learned blockchain, software integration, and that code can generate value autonomously.</>},
                {year:'2020',text:<><strong>Lockdown.</strong> Events industry collapsed overnight. Built automated trading systems to survive. Software + strategy can replace lost income.</>},
                {year:'2022',text:<><strong>ChatGPT Day 1.</strong> Subscribed within a week of launch (Nov 2022). Never cancelled. This wasn&apos;t a chatbot — this was a new operating system for work.</>},
                {year:'2023–24',text:<><strong>50+ AI models tested.</strong> GPT-4, Claude, Gemini, Moonshot, Llama, Mistral, Midjourney, DALL-E. Learned what each does best.</>},
                {year:'2025',text:<><strong>anyOS.</strong> The synthesis. Multiple AI models orchestrated through one system. Not a tool — an operating system that runs businesses.</>},
              ].map(r => (
                <div key={r.year} className="journey-row">
                  <div className="journey-year">{r.year}</div>
                  <div className="journey-text">{r.text}</div>
                </div>
              ))}
            </div>
            <div className="key-stat">
              <p>I can&apos;t fluently type code. But I understand every layer — how they connect, how they talk to each other. With AI, I can now build what I&apos;ve always understood.</p>
              <p className="stat-sub">20 years of understanding. 6 months of building. One system.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 8: WHAT I BUILT ===== */}
      <div className={`slide-snap ${activeSlide === 8 ? "active" : ""}`}>
        <div className="slide-page page8">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The anyOS Story</div>
              <div className="position-label" style={{background:'#0f766e'}}>THE SYSTEM</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div className="era-subtitle" style={{color:'#0f766e'}}>One System That Runs My Businesses</div>
            <h1 className="era-title">What I Built — anyOS</h1>
            <div className="era-period" style={{marginBottom:'1.5vh'}}>Hardware + Software + AI + Training = Everything</div>
            <p className="description">anyOS is an AI operating system. Not an app. Not a chatbot. A complete system — hardware delivered, software pre-configured, training included. You type what you need in plain English, and the system executes it.</p>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                  <h3>Hardware Delivered</h3>
                </div>
                <p>Mac Studio, MacBook Pro, or Mac Mini — pre-configured and ready to run. Arrives at your office, plugs in, and works.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 14H5a2 2 0 0 0-2 2v2h18v-2a2 2 0 0 0-2-2z"/><line x1="12" y1="10" x2="12" y2="14"/></svg></div>
                  <h3>Multiple AI Models</h3>
                </div>
                <p>Best tool for each job. Strategy, creative, coding, admin — different AI specialists working together under one roof.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                  <h3>Memory System</h3>
                </div>
                <p>Learns your business. Remembers context, preferences, history, past projects, client details. Gets smarter every single day.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
                  <h3>Full Integration</h3>
                </div>
                <p>Email, calendar, databases, websites, project tools, social media — all connected through one system.</p>
              </div>
            </div>
            <div className="examples-bar">
              {['Email Management','Website Builds','Client Comms','Reports','Scheduling','File Processing','Research','Quoting'].map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
                  <h3>Cost Control</h3>
                </div>
                <p>Every action logged. Compute tracked per user. Monthly caps set. Full transparency on costs.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <h3>Training Included</h3>
                </div>
                <p>I set it up. I train your team. I support you ongoing. You don&apos;t need to be technical.</p>
              </div>
            </div>
            <div className="key-stat">
              <p>Real results: websites built in under an hour for ~£25. Client emails processed in seconds. Reports generated automatically.</p>
              <p className="stat-sub">This isn&apos;t theoretical. It&apos;s running. Right now. On my desk.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 9: LIVE DEMO ===== */}
      <div className={`slide-snap ${activeSlide === 9 ? "active" : ""}`}>
        <div className="slide-page page9">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">Live Demonstration</div>
              <div className="position-label" style={{background:'#0891b2'}}>WATCH THIS</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div className="era-subtitle" style={{color:'#0891b2'}}>Three Tasks. Real Time. No Tricks.</div>
            <h1 className="era-title">Let Me Show You</h1>
            <div className="era-period" style={{marginBottom:'2vh'}}>Live demonstration — everything you&apos;re about to see happens in real time</div>
            {[
              {num:'01',title:'Build a Quote Calculator',prompt:'"Build a venue graphics quote calculator with material costs, labour rates, and a client-facing form"',result:'AI writes the code, builds the interface, calculates pricing logic, deploys to a live URL.',time:'~3 minutes',cost:'~£0.50 compute'},
              {num:'02',title:'Process a Client Email',prompt:'"Email arrived: \'Hi, can you change our phone number on the website to 020 7123 4567?\'"',result:'AI reads the email, understands the request, locates the phone number, queues the change, drafts a confirmation.',time:'~10 seconds',cost:'fractions of a penny'},
              {num:'03',title:'Rebuild a Website',prompt:'"Take this client\'s old website and rebuild it — modern design, mobile-first, fast loading, professional"',result:'AI analyses the existing site, extracts content, designs a new layout, writes all the code, deploys live.',time:'under 1 hour',cost:'~£25 compute'},
            ].map(d => (
              <div key={d.num} className="demo-card" style={{background:'#ecfeff',borderColor:'#a5f3fc'}}>
                <div className="demo-number" style={{color:'#a5f3fc'}}>{d.num}</div>
                <div className="demo-content">
                  <h3>{d.title}</h3>
                  <div className="demo-prompt">{d.prompt}</div>
                  <div className="demo-result"><strong>What happens:</strong> {d.result}<br/><strong>Time:</strong> {d.time} &nbsp;|&nbsp; <strong>Cost:</strong> {d.cost}</div>
                </div>
              </div>
            ))}
            <div className="key-stat">
              <p>Everything you&apos;re about to see is real. No pre-built templates. No pre-recorded demos. Just a prompt, a system, and results.</p>
              <p className="stat-sub">The same system. The same process. Available to every member of your team.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 10: WHAT JUST HAPPENED ===== */}
      <div className={`slide-snap ${activeSlide === 10 ? "active" : ""}`}>
        <div className="slide-page page10">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">Demo Results</div>
              <div className="position-label" style={{background:'#be123c'}}>THE NUMBERS</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div className="era-subtitle" style={{color:'#be123c'}}>Traditional vs anyOS — Side by Side</div>
            <h1 className="era-title">What Just Happened</h1>
            <div className="era-period" style={{marginBottom:'2vh'}}>The real cost of doing things the old way vs the new way</div>
            <div className="compare-grid">
              <div className="compare-header old">Traditional Approach</div>
              <div className="compare-header new">anyOS Approach</div>
              {[
                {old:'Website rebuild — Brief a developer → 2-4 weeks → £2,000–£5,000', nw:'Website rebuild — Describe in plain English → 1 hour → ~£25'},
                {old:'Client email change — Find developer → brief → wait → deploy → 1-2 days', nw:'Client email change — AI reads, understands, changes, confirms → under 1 minute'},
                {old:'Quote calculator — Spec → developer build → test → review → 1-2 weeks', nw:'Quote calculator — Described in plain English → built live → 3 minutes'},
                {old:'Asset resizing — Designer opens each file → manual resize → 4 hours', nw:'Asset resizing — "Resize for all platforms" → 4 minutes'},
                {old:'Monthly report — Gather data → compile → format → review → full day', nw:'Monthly report — Auto-generated from data → ready to review → minutes'},
                {old:'Client research — Google, LinkedIn, read articles → 3 hours', nw:'Client research — "Research this company" → comprehensive brief → 2 minutes'},
              ].map((row,i) => (
                <span key={i} style={{display:'contents'}}>
                  <div className="compare-cell old">{row.old}</div>
                  <div className="compare-cell new">{row.nw}</div>
                </span>
              ))}
            </div>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                  <h3>Time Saved</h3>
                </div>
                <p>Hours become minutes. Days become hours. Weeks become days. Your team reclaims the time they spend on repetitive, low-value work.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
                  <h3>Money Saved</h3>
                </div>
                <p>£25 vs £2,500. Pennies vs pounds. The cost difference isn&apos;t marginal — it&apos;s transformational. The ROI is measured in weeks, not years.</p>
              </div>
            </div>
            <div className="key-stat">
              <p>That website cost £25 in compute. Not £2,500. Not 2 weeks. Not a developer&apos;s salary. One hour. Twenty-five pounds. Same quality. Deployed live.</p>
              <p className="stat-sub">This is what Web 4.0 looks like in practice. Not theory. Practice.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
    </div>
  )
}
