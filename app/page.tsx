'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { type ReactNode, useMemo, useState } from 'react'
import { Keyboard, Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'

interface FeatureItem {
  title: string
  text: string
  icon: ReactNode
}

interface CompanyDetail {
  name: string
  short: string
  value: string
  detail: string
}

const iconDoc = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const iconEye = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const iconDesktop = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)
const iconSearch = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const iconUsers = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const iconMessage = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const iconMobile = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)
const iconCloud = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)
const iconLink = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)
const iconDollar = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
const iconStar = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const iconTrend = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)
const iconMic = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 14H5a2 2 0 0 0-2 2v2h18v-2a2 2 0 0 0-2-2z" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <line x1="9" y1="22" x2="15" y2="22" />
    <line x1="12" y1="18" x2="12" y2="22" />
  </svg>
)
const iconBolt = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const iconGlobe = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const iconPlus = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
)
const iconCheckUser = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
)
const iconBook = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)
const iconUser = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const iconShield = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const iconClock = (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

function FeatureBox({ title, text, icon, className = '' }: FeatureItem & { className?: string }) {
  return (
    <motion.div
      className={`feature-box ${className}`}
      whileHover={{ scale: 1.015, y: -2, boxShadow: '0 10px 24px rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="feature-top">
        <div className="icon-wrapper">{icon}</div>
        <h3>{title}</h3>
      </div>
      <p>{text}</p>
    </motion.div>
  )
}

function Timeline({ active }: { active: number }) {
  return (
    <div className="timeline">
      <div className="timeline-track">
        <div className={`timeline-node ${active >= 1 ? 'active' : ''}`} />
        <div className={`timeline-segment ${active >= 2 ? 'filled' : ''}`} />
        <div className={`timeline-node ${active >= 2 ? 'active' : ''}`} />
        <div className={`timeline-segment ${active >= 3 ? 'filled' : ''}`} />
        <div className={`timeline-node ${active >= 3 ? 'active' : ''}`} />
        <div className={`timeline-segment ${active >= 4 ? 'filled' : ''}`} />
        <div className={`timeline-node ${active >= 4 ? 'active' : ''}`} />
        <div className={`timeline-segment ${active >= 5 ? 'filled' : ''}`} />
        <div className={`timeline-node ${active >= 5 ? 'active' : ''}`} />
      </div>
      <div className="timeline-labels">
        <span className={active === 1 ? 'active' : ''}>1.0</span>
        <span className={active === 2 ? 'active' : ''}>2.0</span>
        <span className={active === 3 ? 'active' : ''}>3.0</span>
        <span className={active === 4 ? 'active' : ''}>4.0</span>
        <span className={active === 5 ? 'active' : ''}>5.0{active === 5 ? ' — ?' : ''}</span>
      </div>
    </div>
  )
}

function Progress({ page }: { page: number }) {
  return (
    <div className="progress-bar">
      <div className="progress-dots">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`progress-dot ${i < page - 1 ? 'done' : ''} ${i === page - 1 ? 'current' : ''}`} />
        ))}
      </div>
      <div className="progress-labels">
        Page <span>{page}</span> of 10
      </div>
    </div>
  )
}

function SlideMotion({ active, index, children }: { active: number; index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={active === index ? { opacity: 1, y: 0 } : { opacity: 0.9, y: 8 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="h-full flex flex-col"
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeCompany, setActiveCompany] = useState<string | null>(null)

  const companies = useMemo<CompanyDetail[]>(
    () => [
      {
        name: 'Spotify',
        short: 'Music streaming giant',
        value: '1,500 jobs cut',
        detail:
          'Spotify announced workforce reductions during its AI and efficiency push, while expanding internal tooling for personalization, ad optimization, and automated workflows.',
      },
      {
        name: 'Ocado',
        short: 'UK grocery tech (AI improved engineering productivity)',
        value: '1,500 jobs cut',
        detail:
          'Ocado has increasingly automated logistics and engineering processes, using AI and robotics to improve throughput and reduce manual overhead in core operations.',
      },
      {
        name: 'Duolingo',
        short: '10% contractors replaced, AI graded in reviews',
        value: 'AI-first policy',
        detail:
          'Duolingo publicly framed itself as AI-first, expanded AI-generated lesson workflows, and changed hiring and contractor strategy around AI-assisted production.',
      },
      {
        name: 'Meta',
        short: 'Restructured entire teams around AI capabilities',
        value: 'Thousands cut',
        detail:
          'Meta consolidated teams, shifted investment into AI infrastructure and models, and prioritized AI-powered product features across consumer and enterprise lines.',
      },
      {
        name: 'Google',
        short: 'Shifted capital from headcount to AI infrastructure',
        value: 'Thousands cut',
        detail:
          'Google redirected spend into AI compute, TPU/GPU infrastructure, and model development while streamlining org structures in adjacent functions.',
      },
      {
        name: 'Amazon',
        short: 'Automated warehouse ops, reduced logistics staff',
        value: 'Thousands cut',
        detail:
          'Amazon expanded robotics and AI planning in fulfillment and logistics, reducing reliance on manual task routing and repetitive warehouse functions.',
      },
    ],
    [],
  )

  return (
    <main className="presentation-root">
      <section className="slider-shell">
        <Swiper
          modules={[Pagination, Mousewheel, Keyboard]}
          direction="horizontal"
          slidesPerView={1}
          speed={700}
          keyboard={{ enabled: true }}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          pagination={{ clickable: true }}
          className="presentation-swiper"
          onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
        >
          <SwiperSlide>
            <div className="slide-page web1">
              <SlideMotion active={activeSlide} index={0}>
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
                    <FeatureBox title="Static Pages" text="No interactivity. Pages coded by hand in HTML. Updating content meant rewriting code and re-uploading via FTP. No databases, no dynamic content." icon={iconDoc} />
                    <FeatureBox title="Read-Only" text="Users were consumers, not creators. No comments, no profiles, no uploads. The publisher controlled everything. One-directional communication." icon={iconEye} />
                    <FeatureBox title="Dial-Up Connections" text="56kbps speeds. Pages took minutes to load. Images were rare and tiny. Video was impossible. Broadband didn&apos;t become mainstream until the early 2000s." icon={iconDesktop} />
                    <FeatureBox title="Web Directories" text="Before Google (1998), websites were found via curated directories like Yahoo! and DMOZ. You browsed categories, not search results. Discovery was manual." icon={iconSearch} />
                  </div>
                  <div className="examples-bar">
                    {['GeoCities', 'Yahoo!', 'AltaVista', 'Netscape', 'HTML', 'Dial-Up', 'FTP'].map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="key-stat">
                    <p>By 2000, there were ~17 million websites worldwide. Today there are over 1.9 billion.</p>
                    <p className="stat-sub">The entire internet had fewer websites than a single social platform has users today.</p>
                  </div>
                </div>
                <Timeline active={1} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page web2">
              <SlideMotion active={activeSlide} index={1}>
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
                  <p className="description">The internet became a two-way conversation. Users could read AND write — post, share, comment, create. MySpace (2003) was one of the first platforms where users customised their own page. WordPress democratised website creation. The iPhone (2007) put the internet in everyone&apos;s pocket. This era created the "creator economy" and changed how businesses market, sell, and communicate.</p>
                  <div className="features">
                    <FeatureBox title="User-Generated Content" text="Anyone could publish. Blogs, videos, photos, reviews. By 2010, 500 million Facebook users were creating content daily. Businesses had to listen, not just broadcast." icon={iconUsers} />
                    <FeatureBox title="Social Networks" text="MySpace (2003), Facebook (2004), Twitter (2006), Instagram (2010). Human relationships moved online. Marketing shifted from billboards to feeds." icon={iconMessage} />
                    <FeatureBox title="Mobile Revolution" text={'iPhone launched 2007. By 2015, mobile overtook desktop traffic. Apps became the primary internet interface. "There\'s an app for that" became reality.'} icon={iconMobile} />
                    <FeatureBox title="Cloud & SaaS" text="Software moved online. Google Docs replaced Office for many. Dropbox replaced USB sticks. Monthly subscriptions replaced software boxes." icon={iconCloud} />
                  </div>
                  <div className="examples-bar">
                    {['MySpace', 'Facebook', 'YouTube', 'WordPress', 'Twitter', 'Instagram', 'iPhone', 'Google Docs'].map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="key-stat">
                    <p>Most businesses today still operate in Web 2.0. Manual emails, WordPress sites, social media managed by humans, one task at a time.</p>
                    <p className="stat-sub">The tools changed, but the workflow didn&apos;t. People are still the bottleneck.</p>
                  </div>
                </div>
                <Timeline active={2} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page web3">
              <SlideMotion active={activeSlide} index={2}>
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
                    <FeatureBox title="Blockchain Technology" text="Decentralised ledgers recording transactions across thousands of computers. No single point of failure. Transparent, permanent, tamper-proof records without banks or governments." icon={iconLink} />
                    <FeatureBox title="Cryptocurrency" text="Bitcoin launched 2009, went mainstream 2017-2021. Ethereum introduced smart contracts — programmable money that executes agreements automatically when conditions are met." icon={iconDollar} />
                    <FeatureBox title="NFTs & Digital Ownership" text="Non-Fungible Tokens proved you could own digital assets. While the hype crashed, verifiable digital ownership remains important for the future of media and IP." icon={iconStar} />
                    <FeatureBox title="Automated Trading & DeFi" text="Decentralised finance removed banks. Trading bots proved software could generate value 24/7 without humans. This planted the seed: if software can trade, what else can it do?" icon={iconTrend} />
                  </div>
                  <div className="examples-bar">
                    {['Bitcoin', 'Ethereum', 'OpenSea', 'MetaMask', 'Uniswap', 'Smart Contracts', 'Trading Bots'].map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="key-stat">
                    <p>Web 3.0 proved software could execute complex tasks autonomously. The next question was inevitable: what if AI could do the same for every business task?</p>
                    <p className="stat-sub">That question led directly to Web 4.0.</p>
                  </div>
                </div>
                <Timeline active={3} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page web4">
              <SlideMotion active={activeSlide} index={3}>
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
                  <p className="description">The AI era. ChatGPT launched November 2022 and reached 100 million users in two months — the fastest adoption of any technology in history. Software no longer just displays information — it <strong>acts</strong>. AI agents write emails, build websites, manage projects, and make decisions. Natural language is the new interface. You say what you want, the system executes it.</p>
                  <div className="features">
                    <FeatureBox title="AI Agents" text="Software that takes initiative. Reads emails, drafts responses, schedules meetings, updates databases, builds code. Not tools you use — assistants that think, learn, execute." icon={iconMic} />
                    <FeatureBox title="Natural Language Interface" text={'No coding required. No complex software to learn. Type in plain English: "Build me a website" -> built. "Email the client" -> sent. Conversation is the interface.'} icon={iconMessage} />
                    <FeatureBox title="Autonomous Automation" text="Repetitive tasks handled automatically. Invoice processing, email triage, report generation, file conversions, scheduling — all running while your team focuses on creative work." icon={iconBolt} />
                    <FeatureBox title="Total Integration" text="AI connects all your tools into one system. Email, calendar, project management, accounting, websites, social — unified under one intelligent layer. No more switching between 12 apps." icon={iconGlobe} />
                  </div>
                  <div className="examples-bar">
                    {['ChatGPT', 'Claude', 'Gemini', 'anyOS', 'Copilot', 'Midjourney', 'AI Agents'].map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="key-stat">
                    <p>The businesses that adopt Web 4.0 in 2025 will own 2030. The ones that wait will spend the next decade catching up — or won&apos;t survive at all.</p>
                    <p className="stat-sub">anyOS brings Web 4.0 to your business — not to replace your team, but to make them unstoppable.</p>
                  </div>
                </div>
                <Timeline active={4} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page web5">
              <SlideMotion active={activeSlide} index={4}>
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
                  <p className="description">Nobody knows exactly when Web 5.0 will arrive or what it will look like. But the trajectory is clear. Each era gave humans more power: reading, then creating, then owning, then automating. Web 5.0 will likely be the era where <strong>AI and humans become equals</strong> — not tools we direct, but partners we collaborate with. Here&apos;s what&apos;s coming:</p>
                  <div className="features">
                    <FeatureBox title="Fully Autonomous Businesses" text="Entire companies run by 2-3 humans and hundreds of AI agents. AI doesn&apos;t assist — it operates. Humans set strategy, AI executes everything else end-to-end." icon={iconPlus} />
                    <FeatureBox title="AI-to-AI Communication" text="Your system talks to your client&apos;s system directly. Quotes, approvals, scheduling — machines negotiating with machines. No emails, no phone tag, no waiting." icon={iconCheckUser} />
                    <FeatureBox title="Predictive Operations" text="AI doesn&apos;t wait for problems — it prevents them. Knows you need stock before you run out. Knows a client is unhappy before they complain. Prevention over reaction." icon={iconBook} />
                    <FeatureBox title="Digital Twins" text="AI versions of your best employees that work 24/7, trained on their expertise. Your top salesperson&apos;s knowledge, available to every new hire instantly." icon={iconUser} />
                  </div>
                  <div className="examples-bar">
                    {['Autonomous Agents', 'Machine-to-Machine', 'Predictive AI', 'Voice-First', 'Zero-Code', 'Digital Twins', 'Hyper-Personalisation'].map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="key-stat">
                    <p>If Web 4.0 is AI assisting humans, Web 5.0 is AI and humans as true partners. The question is — will your business have mastered Web 4.0 before Web 5.0 arrives?</p>
                    <p className="stat-sub">The gap between early adopters and laggards will become unbridgeable. The time to start is now.</p>
                  </div>
                </div>
                <Timeline active={5} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page page6">
              <SlideMotion active={activeSlide} index={5}>
                <div className="brand-header">
                  <div className="logo">any<span>OS</span></div>
                  <div className="header-right">
                    <div className="era-badge">The Business Case</div>
                    <div className="position-label urgent">ACT NOW</div>
                  </div>
                </div>
                <div className="era-content">
                  <div className="era-subtitle" style={{ color: '#dc2626' }}>Why This Can&apos;t Wait</div>
                  <h1 className="era-title">The World Is Moving.<br />Are You?</h1>
                  <div className="era-period">Companies already reshaping around AI — 2024/2025</div>
                  <div className="stat-list">
                    {companies.map((company) => (
                      <button key={company.name} type="button" className="stat-row stat-click" onClick={() => setActiveCompany(activeCompany === company.name ? null : company.name)}>
                        <div>
                          <span className="company">{company.name}</span> <span className="detail">— {company.short}</span>
                        </div>
                        <div className="number">{company.value}</div>
                      </button>
                    ))}
                    <div className="stat-row total-row">
                      <div><span className="company" style={{ color: '#dc2626' }}>Total tech layoffs 2025</span></div>
                      <div className="number" style={{ fontSize: '1.1rem' }}>100,000+</div>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {activeCompany && (
                      <motion.div
                        key={activeCompany}
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="company-detail"
                      >
                        <p>
                          <strong>{activeCompany}:</strong> {companies.find((c) => c.name === activeCompany)?.detail}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="features">
                    <FeatureBox title="The Window Is Closing" text="Early adopters are already 2 years ahead. Every month without AI is a month your competitors gain ground. The learning curve is real — start now or start behind." icon={iconClock} />
                    <FeatureBox title="The Cost of Waiting" text="If your average employee costs £35/hr and AI saves them 10 hours/week, that&apos;s £350/week per person. For a 10-person team: £14,000/month in recovered time — or £168,000/year." icon={iconTrend} />
                    <FeatureBox title="Enhance, Don&apos;t Replace" text="Big tech is cutting. We&apos;re empowering. anyOS makes your existing team faster, smarter, and more productive. Same people, better tools, bigger output." icon={iconUsers} />
                    <FeatureBox title="First-Mover Advantage" text="Be the first in your industry to adopt. While competitors are still debating, you&apos;re already delivering faster, cheaper, and smarter. Reputation compounds." icon={iconShield} />
                  </div>
                  <div className="key-stat">
                    <p>The question isn&apos;t whether AI will change your industry. It already is. The only question is whether you&apos;ll lead that change — or be left behind by it.</p>
                    <p className="stat-sub">anyOS is your bridge into Web 4.0. One system. One partner. Zero excuses.</p>
                  </div>
                </div>
                <div className="timeline">
                  <div className="timeline-track">
                    <div className="timeline-node active" /><div className="timeline-segment filled" />
                    <div className="timeline-node active" /><div className="timeline-segment filled" />
                    <div className="timeline-node active" /><div className="timeline-segment filled" />
                    <div className="timeline-node active" /><div className="timeline-segment filled" />
                    <div className="timeline-node active" />
                  </div>
                  <div className="timeline-labels">
                    <span>1.0</span><span>2.0</span><span>3.0</span><span>4.0</span><span className="active" style={{ color: '#dc2626' }}>YOU ARE HERE</span>
                  </div>
                </div>
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page page7">
              <SlideMotion active={activeSlide} index={6}>
                <div className="brand-header">
                  <div className="logo">any<span>OS</span></div>
                  <div className="header-right">
                    <div className="era-badge">The anyOS Story</div>
                    <div className="position-label" style={{ background: '#4338ca' }}>MY JOURNEY</div>
                  </div>
                </div>
                <div className="era-content">
                  <div className="era-subtitle">20 Years of Building, Learning & Evolving</div>
                  <h1 className="era-title">How I Got Here</h1>
                  <div className="era-period">From MySpace to AI — a self-taught path through every era of the web</div>
                  <p className="description">I&apos;m not a developer by trade. I&apos;ve never had a computer science degree. But I&apos;ve spent 20 years understanding how the web works — building, breaking, learning. Every era taught me something. And when AI arrived, everything clicked.</p>
                  <div className="journey-timeline">
                    <div className="journey-row"><div className="journey-year">2005</div><div className="journey-text"><strong>MySpace & Freewebs.</strong> Taught myself HTML to customise profiles. Built free sites for friends. First taste of web building — before WordPress, before templates, before drag-and-drop.</div></div>
                    <div className="journey-row"><div className="journey-year">2010</div><div className="journey-text"><strong>WordPress era.</strong> Building real websites for small businesses. Free. Learning by doing. Understood CMS, hosting, domains, SEO — the full stack through experience.</div></div>
                    <div className="journey-row"><div className="journey-year">2014</div><div className="journey-text"><strong>Founded The Bar People.</strong> Built the business from scratch — website, booking system, marketing. Learned that tech isn&apos;t separate from business. It IS the business.</div></div>
                    <div className="journey-row"><div className="journey-year">2017</div><div className="journey-text"><strong>Cryptocurrency.</strong> Invested in Bitcoin and Ethereum. Learned blockchain, software integration, and that code can generate value autonomously — 24 hours a day.</div></div>
                    <div className="journey-row"><div className="journey-year">2020</div><div className="journey-text"><strong>Lockdown.</strong> Events industry collapsed overnight. Built automated trading systems to survive. Proved that software + strategy can replace lost income when everything else fails.</div></div>
                    <div className="journey-row"><div className="journey-year">2022</div><div className="journey-text"><strong>ChatGPT Day 1.</strong> Subscribed within a week of launch (Nov 2022). Never cancelled. Immediately saw the potential — this wasn&apos;t a chatbot. This was a new operating system for work.</div></div>
                    <div className="journey-row"><div className="journey-year">2023–24</div><div className="journey-text"><strong>50+ AI models tested.</strong> GPT-4, Claude, Gemini, Moonshot, Llama, Mistral, Midjourney, DALL-E, Stable Diffusion. Chat models, code models, image models. Learned what each does best.</div></div>
                    <div className="journey-row"><div className="journey-year">2025</div><div className="journey-text"><strong>anyOS.</strong> The synthesis. Multiple AI models orchestrated through one system. Not a tool — an operating system that runs businesses. 6 months of building, testing, refining.</div></div>
                  </div>
                  <div className="key-stat">
                    <p>I can&apos;t fluently type code. But I understand every layer — how they connect, how they talk to each other. With AI, I can now build what I&apos;ve always understood. That&apos;s the power.</p>
                    <p className="stat-sub">20 years of understanding. 6 months of building. One system.</p>
                  </div>
                </div>
                <Progress page={7} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page page8">
              <SlideMotion active={activeSlide} index={7}>
                <div className="brand-header">
                  <div className="logo">any<span>OS</span></div>
                  <div className="header-right">
                    <div className="era-badge">The anyOS Story</div>
                    <div className="position-label" style={{ background: '#0f766e' }}>THE SYSTEM</div>
                  </div>
                </div>
                <div className="era-content">
                  <div className="era-subtitle" style={{ color: '#0f766e' }}>One System That Runs My Businesses</div>
                  <h1 className="era-title">What I Built — anyOS</h1>
                  <div className="era-period">Hardware + Software + AI + Training = Everything</div>
                  <p className="description">anyOS is an AI operating system. Not an app. Not a chatbot. A complete system — hardware delivered, software pre-configured, training included. You type what you need in plain English, and the system executes it. It manages email, builds websites, handles client comms, generates reports, and learns your business over time.</p>
                  <div className="features">
                    <FeatureBox title="Hardware Delivered" text="Mac Studio, MacBook Pro, or Mac Mini — pre-configured and ready to run. Arrives at your office, plugs in, and works. No IT department needed." icon={iconDesktop} />
                    <FeatureBox title="Multiple AI Models" text="Best tool for each job. Strategy, creative, coding, admin — different AI specialists working together under one roof. Like a team that never sleeps." icon={iconMic} />
                    <FeatureBox title="Memory System" text="Learns your business. Remembers context, preferences, history, past projects, client details. Gets smarter and more useful every single day." icon={iconBook} />
                    <FeatureBox title="Full Integration" text="Email, calendar, databases, websites, project tools, social media — all connected through one system. No more switching between 12 apps." icon={iconGlobe} />
                  </div>
                  <div className="examples-bar">
                    {['Email Management', 'Website Builds', 'Client Comms', 'Reports', 'Scheduling', 'File Processing', 'Research', 'Quoting'].map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="features">
                    <FeatureBox title="Cost Control" text="Every action logged. Compute tracked per user. Monthly caps set. Full transparency on what&apos;s being used and what it costs." icon={iconTrend} />
                    <FeatureBox title="Training Included" text="I set it up. I train your team. I support you ongoing. You don&apos;t need to be technical — just know how to type what you need." icon={iconShield} />
                  </div>
                  <div className="key-stat">
                    <p>Real results from my businesses: websites built in under an hour for ~£25. Client emails processed in seconds. Reports generated automatically. Logos designed, quotes calculated, schedules managed.</p>
                    <p className="stat-sub">This isn&apos;t theoretical. It&apos;s running. Right now. On my desk.</p>
                  </div>
                </div>
                <Progress page={8} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page page9">
              <SlideMotion active={activeSlide} index={8}>
                <div className="brand-header">
                  <div className="logo">any<span>OS</span></div>
                  <div className="header-right">
                    <div className="era-badge">Live Demonstration</div>
                    <div className="position-label" style={{ background: '#0891b2' }}>WATCH THIS</div>
                  </div>
                </div>
                <div className="era-content">
                  <div className="era-subtitle" style={{ color: '#0891b2' }}>Three Tasks. Real Time. No Tricks.</div>
                  <h1 className="era-title">Let Me Show You</h1>
                  <div className="era-period">Live demonstration — everything you&apos;re about to see happens in real time</div>
                  <div className="demo-card" style={{ background: '#ecfeff', borderColor: '#a5f3fc' }}>
                    <div className="demo-number" style={{ color: '#a5f3fc' }}>01</div>
                    <div className="demo-content">
                      <h3>Build a Quote Calculator</h3>
                      <div className="demo-prompt">&quot;Build a venue graphics quote calculator with material costs, labour rates, and a client-facing form&quot;</div>
                      <div className="demo-result"><strong>What happens:</strong> AI writes the code, builds the interface, calculates pricing logic, deploys to a live URL. Functional. Tested. Ready to use.<br /><strong>Time:</strong> ~3 minutes &nbsp; | &nbsp; <strong>Cost:</strong> ~£0.50 compute</div>
                    </div>
                    <div style={{ clear: 'both' }} />
                  </div>
                  <div className="demo-card" style={{ background: '#ecfeff', borderColor: '#a5f3fc' }}>
                    <div className="demo-number" style={{ color: '#a5f3fc' }}>02</div>
                    <div className="demo-content">
                      <h3>Process a Client Email</h3>
                      <div className="demo-prompt">&quot;Email arrived: &apos;Hi, can you change our phone number on the website to 020 7123 4567?&apos;&quot;</div>
                      <div className="demo-result"><strong>What happens:</strong> AI reads the email, understands the request, locates the phone number on the website, queues the change, and drafts a confirmation email to the client.<br /><strong>Time:</strong> ~10 seconds &nbsp; | &nbsp; <strong>Cost:</strong> fractions of a penny</div>
                    </div>
                    <div style={{ clear: 'both' }} />
                  </div>
                  <div className="demo-card" style={{ background: '#ecfeff', borderColor: '#a5f3fc' }}>
                    <div className="demo-number" style={{ color: '#a5f3fc' }}>03</div>
                    <div className="demo-content">
                      <h3>Rebuild a Website</h3>
                      <div className="demo-prompt">&quot;Take this client&apos;s old website and rebuild it — modern design, mobile-first, fast loading, professional&quot;</div>
                      <div className="demo-result"><strong>What happens:</strong> AI analyses the existing site, extracts content, designs a new layout, writes all the code, and deploys a fully working website to a live URL.<br /><strong>Time:</strong> under 1 hour &nbsp; | &nbsp; <strong>Cost:</strong> ~£25 compute</div>
                    </div>
                    <div style={{ clear: 'both' }} />
                  </div>
                  <div className="key-stat">
                    <p>Everything you&apos;re about to see is real. No pre-built templates. No pre-recorded demos. Just a prompt, a system, and results.</p>
                    <p className="stat-sub">The same system. The same process. Available to every member of your team.</p>
                  </div>
                </div>
                <Progress page={9} />
              </SlideMotion>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="slide-page page10">
              <SlideMotion active={activeSlide} index={9}>
                <div className="brand-header">
                  <div className="logo">any<span>OS</span></div>
                  <div className="header-right">
                    <div className="era-badge">Demo Results</div>
                    <div className="position-label" style={{ background: '#be123c' }}>THE NUMBERS</div>
                  </div>
                </div>
                <div className="era-content">
                  <div className="era-subtitle" style={{ color: '#be123c' }}>Traditional vs anyOS — Side by Side</div>
                  <h1 className="era-title">What Just Happened</h1>
                  <div className="era-period">The real cost of doing things the old way vs the new way</div>
                  <div className="compare-grid">
                    <div className="compare-header old">Traditional Approach</div>
                    <div className="compare-header new">anyOS Approach</div>
                    <div className="compare-cell old compare-right"><strong>Website rebuild</strong><br />Brief a developer → 2-4 weeks → £2,000–£5,000</div>
                    <div className="compare-cell new"><strong>Website rebuild</strong><br />Describe in plain English → 1 hour → ~£25</div>
                    <div className="compare-cell old compare-right"><strong>Client email change</strong><br />Find developer → brief → wait → deploy → 1-2 days</div>
                    <div className="compare-cell new"><strong>Client email change</strong><br />AI reads, understands, changes, confirms → under 1 minute</div>
                    <div className="compare-cell old compare-right"><strong>Quote calculator</strong><br />Spec → developer build → test → review → 1-2 weeks</div>
                    <div className="compare-cell new"><strong>Quote calculator</strong><br />Described in plain English → built live → 3 minutes</div>
                    <div className="compare-cell old compare-right"><strong>Asset resizing</strong><br />Designer opens each file → manual resize → 4 hours</div>
                    <div className="compare-cell new"><strong>Asset resizing</strong><br />&quot;Resize for all platforms&quot; → 4 minutes</div>
                    <div className="compare-cell old compare-right"><strong>Monthly report</strong><br />Gather data → compile → format → review → full day</div>
                    <div className="compare-cell new"><strong>Monthly report</strong><br />Auto-generated from data → ready to review → minutes</div>
                    <div className="compare-cell old compare-right"><strong>Client research</strong><br />Google, LinkedIn, read articles → 3 hours</div>
                    <div className="compare-cell new"><strong>Client research</strong><br />&quot;Research this company&quot; → comprehensive brief → 2 minutes</div>
                  </div>
                  <div className="features two-col">
                    <FeatureBox title="Time Saved" text="Hours become minutes. Days become hours. Weeks become days. Your team reclaims the time they spend on repetitive, low-value work." icon={iconClock} />
                    <FeatureBox title="Money Saved" text="£25 vs £2,500. Pennies vs pounds. The cost difference isn&apos;t marginal — it&apos;s transformational. The ROI is measured in weeks, not years." icon={iconDollar} />
                  </div>
                  <div className="key-stat">
                    <p>That website cost £25 in compute. Not £2,500. Not 2 weeks. Not a developer&apos;s salary. One hour. Twenty-five pounds. Same quality. Deployed live.</p>
                    <p className="stat-sub">This is what Web 4.0 looks like in practice. Not theory. Practice.</p>
                  </div>
                </div>
                <Progress page={10} />
              </SlideMotion>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      <section className="below-slider">
        <div className="powered-box">
          <h2>Powered by anyOS</h2>
          <p>One operating system for modern businesses: AI, automation, and execution in one unified workflow.</p>
        </div>
        <div className="cta-box">
          <h3>Ready to bring Web 4.0 to your business?</h3>
          <a href="mailto:jake@anyvendor.co.uk" className="cta-button">Contact anyOS</a>
        </div>
        <footer className="site-footer">
          <div className="logo">any<span>OS</span></div>
          <p>jake@anyvendor.co.uk</p>
          <p>anyos.co.uk</p>
        </footer>
      </section>
    </main>
  )
}
