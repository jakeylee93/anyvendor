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
  'What is anyOS?',
  'How anyOS Works',
  'Integrations',
  'Live Demo',
  'The Results',
]

const INTEGRATIONS: Record<string, { name: string; desc: string; how: string; category: string }> = {
  openai: { name: 'OpenAI', desc: 'AI language models (GPT-4o, DALL-E)', how: 'Powers natural language tasks, content generation, code writing, and image creation.', category: 'AI' },
  anthropic: { name: 'Anthropic', desc: 'AI assistant (Claude)', how: 'Handles complex reasoning, document analysis, strategy, and long-form writing.', category: 'AI' },
  googlegemini: { name: 'Google Gemini', desc: 'Multimodal AI model', how: 'Processes text, images, and video. Cross-references data across formats.', category: 'AI' },
  perplexity: { name: 'Perplexity', desc: 'AI-powered search engine', how: 'Real-time research with cited sources. Replaces hours of manual Googling.', category: 'AI' },
  huggingface: { name: 'Hugging Face', desc: 'Open-source AI model hub', how: 'Access to thousands of specialised models for niche tasks.', category: 'AI' },
  ollama: { name: 'Ollama', desc: 'Local AI model runner', how: 'Runs AI models privately on your hardware. No data leaves your office.', category: 'AI' },
  replicate: { name: 'Replicate', desc: 'Cloud AI model hosting', how: 'Run specialised AI models on-demand — image generation, audio, video.', category: 'AI' },
  discord: { name: 'Discord', desc: 'Team messaging platform', how: 'AI agents respond to messages, manage channels, send updates to your team.', category: 'Comms' },
  telegram: { name: 'Telegram', desc: 'Secure messaging', how: 'Send/receive messages, alerts, and files through AI-powered bots.', category: 'Comms' },
  whatsapp: { name: 'WhatsApp', desc: 'Business messaging', how: 'AI reads and responds to client messages. Automates customer communication.', category: 'Comms' },
  slack: { name: 'Slack', desc: 'Workplace messaging', how: 'AI agents join channels, answer questions, post updates, manage workflows.', category: 'Comms' },
  gmail: { name: 'Gmail', desc: 'Email', how: 'Reads, drafts, sends, and organises emails. Flags urgent items automatically.', category: 'Comms' },
  signal: { name: 'Signal', desc: 'Encrypted messaging', how: 'Secure communication channel for sensitive business discussions.', category: 'Comms' },
  zoom: { name: 'Zoom', desc: 'Video conferencing', how: 'Schedule meetings, send invites, generate summaries from transcripts.', category: 'Comms' },
  intercom: { name: 'Intercom', desc: 'Customer support platform', how: 'AI handles first-line customer queries. Escalates complex issues to humans.', category: 'Comms' },
  googlemeet: { name: 'Google Meet', desc: 'Video meetings', how: 'Schedule and manage video calls through calendar integration.', category: 'Comms' },
  github: { name: 'GitHub', desc: 'Code hosting & collaboration', how: 'AI writes, commits, and deploys code. Manages repositories and pull requests.', category: 'Dev' },
  vercel: { name: 'Vercel', desc: 'Web hosting platform', how: 'One-click deployment. Every code change goes live automatically.', category: 'Dev' },
  docker: { name: 'Docker', desc: 'Container platform', how: 'Packages applications for consistent deployment across any environment.', category: 'Dev' },
  supabase: { name: 'Supabase', desc: 'Database & auth platform', how: 'Stores data, handles user authentication, real-time subscriptions.', category: 'Dev' },
  postgresql: { name: 'PostgreSQL', desc: 'Relational database', how: 'Enterprise-grade data storage. Handles complex queries and relationships.', category: 'Dev' },
  redis: { name: 'Redis', desc: 'In-memory data store', how: 'Ultra-fast caching and real-time data processing.', category: 'Dev' },
  mongodb: { name: 'MongoDB', desc: 'Document database', how: 'Flexible data storage for unstructured content and rapid prototyping.', category: 'Dev' },
  cloudflare: { name: 'Cloudflare', desc: 'Web security & CDN', how: 'Protects websites, accelerates loading, manages DNS and SSL.', category: 'Dev' },
  firebase: { name: 'Firebase', desc: 'Google app platform', how: 'Real-time databases, push notifications, analytics, and hosting.', category: 'Dev' },
  netlify: { name: 'Netlify', desc: 'Web hosting', how: 'Alternative deployment platform with serverless functions.', category: 'Dev' },
  digitalocean: { name: 'DigitalOcean', desc: 'Cloud infrastructure', how: 'Scalable servers and databases for production workloads.', category: 'Dev' },
  render: { name: 'Render', desc: 'Cloud hosting', how: 'Simple deployment for web services, databases, and background jobs.', category: 'Dev' },
  prisma: { name: 'Prisma', desc: 'Database toolkit', how: 'Type-safe database access. AI generates queries automatically.', category: 'Dev' },
  kubernetes: { name: 'Kubernetes', desc: 'Container orchestration', how: 'Manages complex multi-service deployments at scale.', category: 'Dev' },
  nginx: { name: 'NGINX', desc: 'Web server', how: 'High-performance routing, load balancing, and reverse proxy.', category: 'Dev' },
  python: { name: 'Python', desc: 'Programming language', how: 'AI writes Python for data analysis, automation, scripting, and AI/ML tasks.', category: 'Code' },
  javascript: { name: 'JavaScript', desc: 'Web programming language', how: 'AI builds interactive web applications and browser-based tools.', category: 'Code' },
  typescript: { name: 'TypeScript', desc: 'Typed JavaScript', how: 'AI writes type-safe code for reliable, maintainable applications.', category: 'Code' },
  react: { name: 'React', desc: 'UI framework', how: 'AI builds modern, responsive user interfaces and web apps.', category: 'Code' },
  nextdotjs: { name: 'Next.js', desc: 'Full-stack React framework', how: 'AI builds complete websites — frontend, backend, API, and deployment.', category: 'Code' },
  nodedotjs: { name: 'Node.js', desc: 'Server-side JavaScript', how: 'Powers backend services, APIs, and real-time applications.', category: 'Code' },
  tailwindcss: { name: 'Tailwind CSS', desc: 'Utility CSS framework', how: 'AI designs beautiful, responsive layouts without custom CSS.', category: 'Code' },
  html5: { name: 'HTML5', desc: 'Web markup', how: 'Foundation of every web page. AI generates semantic, accessible markup.', category: 'Code' },
  sass: { name: 'Sass', desc: 'CSS preprocessor', how: 'Advanced styling with variables, nesting, and mixins.', category: 'Code' },
  swift: { name: 'Swift', desc: 'Apple programming language', how: 'AI writes iOS and macOS applications.', category: 'Code' },
  rust: { name: 'Rust', desc: 'Systems programming language', how: 'High-performance, memory-safe code for critical systems.', category: 'Code' },
  stripe: { name: 'Stripe', desc: 'Payment processing', how: 'Accepts payments, manages subscriptions, generates invoices automatically.', category: 'Business' },
  shopify: { name: 'Shopify', desc: 'E-commerce platform', how: 'Manages products, inventory, orders, and storefront — all via AI.', category: 'Business' },
  paypal: { name: 'PayPal', desc: 'Payment gateway', how: 'Alternative payment processing for customers who prefer PayPal.', category: 'Business' },
  square: { name: 'Square', desc: 'Point of sale & payments', how: 'In-person and online payment processing with inventory management.', category: 'Business' },
  xero: { name: 'Xero', desc: 'Accounting software', how: 'AI categorises expenses, reconciles accounts, generates financial reports.', category: 'Business' },
  quickbooks: { name: 'QuickBooks', desc: 'Accounting software', how: 'Automated bookkeeping, invoicing, and tax preparation.', category: 'Business' },
  wise: { name: 'Wise', desc: 'International transfers', how: 'Low-cost international payments and multi-currency accounts.', category: 'Business' },
  woocommerce: { name: 'WooCommerce', desc: 'WordPress e-commerce', how: 'Product management, order processing, and store customisation.', category: 'Business' },
  googlecalendar: { name: 'Google Calendar', desc: 'Scheduling', how: 'AI manages your diary — books meetings, sends reminders, resolves conflicts.', category: 'Productivity' },
  googledrive: { name: 'Google Drive', desc: 'Cloud storage', how: 'Organises files, shares documents, manages team access.', category: 'Productivity' },
  googlesheets: { name: 'Google Sheets', desc: 'Spreadsheets', how: 'AI reads, writes, and analyses spreadsheet data. Generates reports.', category: 'Productivity' },
  googledocs: { name: 'Google Docs', desc: 'Documents', how: 'AI creates, edits, and formats documents collaboratively.', category: 'Productivity' },
  notion: { name: 'Notion', desc: 'Workspace & wiki', how: 'AI manages knowledge bases, project documentation, and team wikis.', category: 'Productivity' },
  trello: { name: 'Trello', desc: 'Project boards', how: 'AI creates cards, moves tasks, updates boards based on project progress.', category: 'Productivity' },
  asana: { name: 'Asana', desc: 'Project management', how: 'Task assignment, progress tracking, and deadline management.', category: 'Productivity' },
  airtable: { name: 'Airtable', desc: 'Database/spreadsheet hybrid', how: 'Structured data management with custom views and automations.', category: 'Productivity' },
  todoist: { name: 'Todoist', desc: 'Task management', how: 'AI creates, prioritises, and tracks tasks across projects.', category: 'Productivity' },
  clickup: { name: 'ClickUp', desc: 'Project management', how: 'All-in-one workspace for tasks, docs, goals, and time tracking.', category: 'Productivity' },
  coda: { name: 'Coda', desc: 'All-in-one doc', how: 'Combines documents, spreadsheets, and apps in one platform.', category: 'Productivity' },
  brave: { name: 'Brave Search', desc: 'Private search engine', how: 'AI searches the web without tracking. Returns clean, ad-free results.', category: 'Search' },
  googlechrome: { name: 'Google Chrome', desc: 'Web browser', how: 'AI controls browser sessions — navigates, fills forms, extracts data.', category: 'Search' },
  duckduckgo: { name: 'DuckDuckGo', desc: 'Private search', how: 'Anonymous web search for sensitive research tasks.', category: 'Search' },
  algolia: { name: 'Algolia', desc: 'Search API', how: 'Lightning-fast search for websites, apps, and internal tools.', category: 'Search' },
  figma: { name: 'Figma', desc: 'Design tool', how: 'AI extracts designs and converts them into working code.', category: 'Creative' },
  cloudinary: { name: 'Cloudinary', desc: 'Image/video management', how: 'Automatic image optimisation, resizing, and format conversion.', category: 'Creative' },
  unsplash: { name: 'Unsplash', desc: 'Stock photography', how: 'AI selects relevant, high-quality images for any project.', category: 'Creative' },
  ffmpeg: { name: 'FFmpeg', desc: 'Media processing', how: 'Converts, compresses, and edits audio/video files automatically.', category: 'Creative' },
  hubspot: { name: 'HubSpot', desc: 'CRM & marketing', how: 'AI manages contacts, tracks deals, automates marketing campaigns.', category: 'Marketing' },
  mailchimp: { name: 'Mailchimp', desc: 'Email marketing', how: 'AI creates campaigns, segments audiences, analyses performance.', category: 'Marketing' },
  zapier: { name: 'Zapier', desc: 'Automation platform', how: 'Connects 5,000+ apps. AI triggers workflows across your entire stack.', category: 'Tools' },
  wordpress: { name: 'WordPress', desc: 'Content management', how: 'AI manages content, updates pages, and maintains existing WordPress sites.', category: 'Tools' },
  dropbox: { name: 'Dropbox', desc: 'File storage', how: 'Cloud file management, sharing, and synchronisation.', category: 'Tools' },
  linear: { name: 'Linear', desc: 'Issue tracking', how: 'AI creates tickets, tracks bugs, manages product development cycles.', category: 'Tools' },
  npm: { name: 'npm', desc: 'Package manager', how: 'AI installs and manages software dependencies automatically.', category: 'Tools' },
  apple: { name: 'Apple', desc: 'macOS ecosystem', how: 'anyOS runs natively on Apple hardware — Mac Studio, MacBook, Mac Mini.', category: 'Tools' },
  linux: { name: 'Linux', desc: 'Open-source OS', how: 'Full compatibility with Linux servers and cloud deployments.', category: 'Tools' },
  git: { name: 'Git', desc: 'Version control', how: 'AI tracks all changes, creates branches, manages code history.', category: 'Tools' },
  visualstudiocode: { name: 'VS Code', desc: 'Code editor', how: 'AI writes and edits code directly in the development environment.', category: 'Tools' },
  elevenlabs: { name: 'ElevenLabs', desc: 'AI voice synthesis', how: 'Generates natural-sounding speech from text. Multiple voices and languages.', category: 'AI' },
  pnpm: { name: 'pnpm', desc: 'Fast package manager', how: 'Efficient dependency management for faster builds.', category: 'Tools' },
  markdown: { name: 'Markdown', desc: 'Text formatting', how: 'AI reads and writes formatted documents, READMEs, and documentation.', category: 'Tools' },
  json: { name: 'JSON', desc: 'Data format', how: 'AI processes structured data, APIs, and configuration files.', category: 'Tools' },
  yaml: { name: 'YAML', desc: 'Configuration format', how: 'AI manages deployment configs, CI/CD pipelines, and settings.', category: 'Tools' },
  sqlite: { name: 'SQLite', desc: 'Lightweight database', how: 'Local data storage for apps, prototypes, and edge computing.', category: 'Dev' },
  elastic: { name: 'Elasticsearch', desc: 'Search & analytics engine', how: 'Full-text search, log analysis, and real-time data exploration.', category: 'Dev' },
  grafana: { name: 'Grafana', desc: 'Monitoring dashboards', how: 'Visualises system metrics, performance data, and business KPIs.', category: 'Dev' },
  googleanalytics: { name: 'Google Analytics', desc: 'Web analytics', how: 'AI analyses traffic patterns, user behaviour, and conversion data.', category: 'Marketing' },
  postman: { name: 'Postman', desc: 'API testing', how: 'AI tests and debugs API connections between services.', category: 'Dev' },
  sentry: { name: 'Sentry', desc: 'Error tracking', how: 'Monitors applications for errors and performance issues in real-time.', category: 'Dev' },
  auth0: { name: 'Auth0', desc: 'Authentication', how: 'Secure user login, SSO, and access management for applications.', category: 'Dev' },
  letsencrypt: { name: "Let's Encrypt", desc: 'SSL certificates', how: 'Automatic HTTPS security for all websites and services.', category: 'Dev' },
  cypress: { name: 'Cypress', desc: 'Testing framework', how: 'AI writes and runs automated tests to ensure code quality.', category: 'Dev' },
  jest: { name: 'Jest', desc: 'JavaScript testing', how: 'Automated unit and integration tests for reliable software.', category: 'Dev' },
  prettier: { name: 'Prettier', desc: 'Code formatter', how: 'Ensures consistent, clean code style across all projects.', category: 'Dev' },
  eslint: { name: 'ESLint', desc: 'Code linter', how: 'Catches errors and enforces best practices automatically.', category: 'Dev' },
  contentful: { name: 'Contentful', desc: 'Headless CMS', how: 'AI manages content across websites, apps, and digital channels.', category: 'Tools' },
  imgur: { name: 'Imgur', desc: 'Image hosting', how: 'Quick image uploads and sharing for projects and documentation.', category: 'Creative' },
}

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
function Progress({ page, total }: { page: number; total: number }) {
  return (
    <div className="progress-bar">
      <div className="progress-dots">
        {Array.from({length:total}).map((_,i) => (
          <div key={i} className={`progress-dot ${i < page-1 ? 'done' : ''} ${i === page-1 ? 'current' : ''}`} />
        ))}
      </div>
      <div className="progress-labels">Page <span>{page}</span> of {total}</div>
    </div>
  )
}

const ALL_LOGOS = [
  'openai','anthropic','googlegemini','perplexity','huggingface','ollama','replicate',
  'discord','telegram','whatsapp','slack','gmail','signal','zoom','intercom','googlemeet',
  'github','vercel','docker','supabase','postgresql','redis','mongodb','cloudflare',
  'firebase','netlify','digitalocean','render','prisma','kubernetes','nginx',
  'python','javascript','typescript','react','nextdotjs','nodedotjs','tailwindcss','html5',
  'sass','swift','rust',
  'stripe','shopify','paypal','square','xero','quickbooks','wise','woocommerce',
  'googlecalendar','googledrive','googlesheets','googledocs','notion','trello',
  'asana','airtable','todoist','clickup','coda',
  'brave','googlechrome','duckduckgo','algolia',
  'figma','cloudinary','unsplash','ffmpeg',
  'hubspot','mailchimp',
  'zapier','wordpress','dropbox','linear','npm','apple','linux','git',
  'visualstudiocode','elevenlabs','pnpm','markdown','json','yaml',
  'sqlite','elastic','grafana','googleanalytics',
  'postman','sentry','auth0','letsencrypt','cypress','jest','prettier','eslint',
  'contentful','imgur',
]

function FloatingLogos() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logosRef = useRef<{
    x: number; y: number; vx: number; vy: number;
    logoIdx: number; el: HTMLImageElement | null
  }[]>([])
  const poolRef = useRef<number[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const W = container.offsetWidth
    const H = container.offsetHeight
    const SIZE = 44
    const MIN_DIST = SIZE * 1.8 // minimum distance between logos
    const COUNT = 20
    const SPEED = 0.3 // pixels per frame upward

    // Shuffle pool
    const pool = ALL_LOGOS.map((_, i) => i).sort(() => Math.random() - 0.5)
    poolRef.current = [...pool]
    let poolIdx = 0
    const nextLogo = () => { poolIdx = (poolIdx + 1) % ALL_LOGOS.length; return poolRef.current[poolIdx] }

    // Create initial logos spread across the screen
    const items: typeof logosRef.current = []
    for (let i = 0; i < COUNT; i++) {
      items.push({
        x: SIZE + Math.random() * (W - SIZE * 2),
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(SPEED + Math.random() * 0.2),
        logoIdx: nextLogo(),
        el: null,
      })
    }
    logosRef.current = items

    // Create DOM elements
    items.forEach((item, i) => {
      const img = document.createElement('img')
      img.src = `/logos/icon-${ALL_LOGOS[item.logoIdx]}.svg`
      img.style.cssText = `position:absolute;width:${SIZE}px;height:${SIZE}px;opacity:0.45;object-fit:contain;pointer-events:none;will-change:transform;`
      img.alt = ''
      container.appendChild(img)
      item.el = img
    })

    // Animation loop
    const animate = () => {
      const items = logosRef.current
      // Move + gentle collision
      for (let i = 0; i < items.length; i++) {
        const a = items[i]
        // Apply velocity
        a.x += a.vx
        a.y += a.vy

        // Bounce off walls gently
        if (a.x < SIZE / 2) { a.x = SIZE / 2; a.vx = Math.abs(a.vx) * 0.5 + 0.05 }
        if (a.x > W - SIZE / 2) { a.x = W - SIZE / 2; a.vx = -Math.abs(a.vx) * 0.5 - 0.05 }

        // Collision with other logos
        for (let j = i + 1; j < items.length; j++) {
          const b = items[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MIN_DIST && dist > 0) {
            const force = (MIN_DIST - dist) * 0.003
            const nx = dx / dist
            const ny = dy / dist
            a.vx -= nx * force
            a.vy -= ny * force
            b.vx += nx * force
            b.vy += ny * force
          }
        }

        // Dampen horizontal velocity
        a.vx *= 0.995
        // Keep upward drift
        a.vy = a.vy * 0.99 - 0.005

        // Respawn at bottom when off top
        if (a.y < -SIZE) {
          a.y = H + SIZE
          a.x = SIZE + Math.random() * (W - SIZE * 2)
          a.vx = (Math.random() - 0.5) * 0.15
          a.vy = -(SPEED + Math.random() * 0.2)
          a.logoIdx = nextLogo()
          if (a.el) a.el.src = `/logos/icon-${ALL_LOGOS[a.logoIdx]}.svg`
        }

        // Update DOM
        if (a.el) {
          a.el.style.transform = `translate(${a.x - SIZE/2}px, ${a.y - SIZE/2}px)`
        }
      }
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      // Clean up DOM
      items.forEach(item => { if (item.el) item.el.remove() })
    }
  }, [])

  return <div ref={containerRef} style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}} />
}

/* ===== CLICKABLE TAG DATA ===== */
const TAG_INFO: Record<string, { title: string; desc: string }> = {
  // Web 1.0
  'GeoCities': { title: 'GeoCities (1994–2009)', desc: 'Free web hosting service where users built personal homepages organised by themed "neighbourhoods." At its peak, the third most-visited site on the internet.' },
  'Yahoo!': { title: 'Yahoo! (1994–present)', desc: 'One of the first major web portals and directories. Before search engines, Yahoo\'s human-curated directory was how most people found websites.' },
  'AltaVista': { title: 'AltaVista (1995–2013)', desc: 'One of the first comprehensive web search engines. Pioneered full-text search before Google made it obsolete.' },
  'Netscape': { title: 'Netscape Navigator (1994–2008)', desc: 'The first widely-used web browser. The "browser wars" with Internet Explorer defined the late 1990s internet.' },
  'HTML': { title: 'HTML (1993–present)', desc: 'HyperText Markup Language — the foundational language of every web page. In Web 1.0, hand-coded HTML was the only way to build a website.' },
  'Dial-Up': { title: 'Dial-Up Internet', desc: '56kbps connections over phone lines. The iconic screeching modem sound. A single image could take minutes to load.' },
  'FTP': { title: 'File Transfer Protocol', desc: 'The only way to upload a website in Web 1.0. Developers would code locally, then FTP files to a server manually.' },
  // Web 2.0
  'MySpace': { title: 'MySpace (2003–2012)', desc: 'The first social network to reach mainstream adoption. Users customised profiles with HTML/CSS — many developers started their careers here.' },
  'Facebook': { title: 'Facebook (2004–present)', desc: 'Launched from a Harvard dorm room, grew to 3 billion users. Transformed how businesses market and how humans communicate.' },
  'YouTube': { title: 'YouTube (2005–present)', desc: 'Made video publishing free and universal. Before YouTube, hosting video online cost thousands. Created the influencer economy.' },
  'WordPress': { title: 'WordPress (2003–present)', desc: 'Democratised website creation. Powers 43% of all websites today. Made it possible for non-developers to publish online.' },
  'Twitter': { title: 'Twitter/X (2006–present)', desc: 'Real-time microblogging that changed journalism, politics, and customer service. 280-character posts that shaped global conversations.' },
  'Instagram': { title: 'Instagram (2010–present)', desc: 'Photo-first social network that created visual marketing. Acquired by Facebook for $1 billion in 2012.' },
  'iPhone': { title: 'iPhone (2007)', desc: 'Apple\'s smartphone put the internet in everyone\'s pocket. By 2015, mobile traffic overtook desktop. Changed everything.' },
  'Google Docs': { title: 'Google Docs (2006–present)', desc: 'Moved document editing to the cloud. Real-time collaboration replaced emailing files back and forth.' },
  // Web 3.0
  'Bitcoin': { title: 'Bitcoin (2009–present)', desc: 'The first cryptocurrency. Decentralised digital money with no central bank. Hit an all-time high of $124,600 in December 2025. Currently trading around $72,000 (March 2026).' },
  'Ethereum': { title: 'Ethereum (2015–present)', desc: 'Blockchain platform that introduced smart contracts — programmable money that executes automatically when conditions are met. Powers DeFi, NFTs, and thousands of decentralised applications.' },
  'OpenSea': { title: 'OpenSea (2017–present)', desc: 'The largest NFT marketplace. Facilitated billions in digital art and collectible sales during the 2021-2022 NFT boom.' },
  'MetaMask': { title: 'MetaMask', desc: 'Crypto wallet browser extension. The gateway for millions of users to interact with blockchain applications.' },
  'Uniswap': { title: 'Uniswap', desc: 'Decentralised exchange protocol. Proved you could trade assets without a bank, broker, or middleman.' },
  'Smart Contracts': { title: 'Smart Contracts', desc: 'Self-executing code on the blockchain. When conditions are met, the contract runs automatically. No lawyers, no delays.' },
  'Trading Bots': { title: 'Automated Trading Bots', desc: 'Software that trades 24/7 based on algorithms. Proved that code could generate value while humans sleep.' },
  // Web 4.0
  'ChatGPT': { title: 'ChatGPT (OpenAI)', desc: 'Launched November 2022. Now has over 900 million weekly active users (Jan 2026). The fastest-growing consumer product in history. Conversational AI that writes, codes, analyses, and creates.' },
  'Claude': { title: 'Claude (Anthropic)', desc: 'AI assistant known for careful reasoning, long document analysis, and nuanced writing. Handles complex multi-step tasks with high accuracy.' },
  'Gemini': { title: 'Gemini (Google)', desc: 'Google\'s multimodal AI. Processes text, images, video, and code simultaneously. Integrated across Google\'s entire product suite.' },
  'anyOS': { title: 'anyOS', desc: 'AI operating system that connects multiple AI models, tools, and integrations into one natural language interface. Hardware delivered, pre-configured, with training and support.' },
  'Copilot': { title: 'Microsoft Copilot', desc: 'AI assistant integrated into Windows, Office 365, and GitHub. Helps write code, documents, emails, and presentations.' },
  'Midjourney': { title: 'Midjourney', desc: 'AI image generation tool. Creates photorealistic images, illustrations, and concept art from text descriptions in seconds.' },
  'AI Agents': { title: 'AI Agents', desc: 'Software that takes initiative — not just answering questions but proactively completing tasks. Reads emails, writes code, manages projects, makes decisions.' },
  // Web 5.0
  'Autonomous Agents': { title: 'Autonomous Agents', desc: 'AI systems that operate independently for extended periods. Set a goal, and the agent figures out the steps, executes them, and reports back.' },
  'Machine-to-Machine': { title: 'Machine-to-Machine Communication', desc: 'AI systems talking directly to other AI systems. Your business\'s AI negotiates with your supplier\'s AI — no humans in the loop for routine transactions.' },
  'Predictive AI': { title: 'Predictive AI', desc: 'AI that anticipates needs before they arise. Knows you\'ll run out of stock, that a client is unhappy, or that a project will miss its deadline — and acts preemptively.' },
  'Voice-First': { title: 'Voice-First Interfaces', desc: 'Speaking replaces typing as the primary way to interact with AI. Walk into your office and say "What\'s my day look like?" — the system responds instantly.' },
  'Zero-Code': { title: 'Zero-Code Development', desc: 'Building software entirely through natural language. Describe what you want, AI builds it. No programming knowledge required at any level.' },
  'Digital Twins': { title: 'Digital Twins', desc: 'AI replicas of your best employees, trained on their expertise. Your top salesperson\'s knowledge, available to every team member 24/7.' },
  'Hyper-Personalisation': { title: 'Hyper-Personalisation', desc: 'Every customer interaction tailored to their preferences, history, and behaviour. AI remembers everything and adapts in real-time.' },
  // Page 8 tags
  'Email Management': { title: 'Email Management', desc: 'AI reads, categorises, drafts responses, and sends emails. Flags urgent items. Handles routine correspondence automatically.' },
  'Website Builds': { title: 'Website Builds', desc: 'Describe what you want in plain English — AI designs, codes, and deploys a complete website. Typically under 1 hour, ~£25 in compute.' },
  'Client Comms': { title: 'Client Communications', desc: 'AI manages client correspondence across email, WhatsApp, Slack, and more. Consistent tone, instant responses, nothing falls through the cracks.' },
  'Reports': { title: 'Automated Reports', desc: 'AI pulls data from multiple sources, compiles analysis, formats professionally, and delivers — weekly, monthly, or on-demand.' },
  'Scheduling': { title: 'Intelligent Scheduling', desc: 'AI manages calendars, resolves conflicts, books meetings, sends reminders. Considers time zones, preferences, and priorities.' },
  'File Processing': { title: 'File Processing', desc: 'AI converts formats, resizes images, extracts data from PDFs, organises files, and processes documents at scale.' },
  'Research': { title: 'AI Research', desc: 'Comprehensive research briefs in minutes. AI searches the web, analyses sources, cross-references data, and delivers structured findings.' },
  'Quoting': { title: 'Automated Quoting', desc: 'AI generates quotes based on your pricing rules, client history, and project requirements. Professional, accurate, instant.' },
}

const DEMO_SERVICES = [
  // AI Models
  {model:'Claude Opus 4',logo:'/logos/icon-anthropic.svg',desc:'Most capable reasoning model',cost:'££££',prompts:[
    'Rebuild this client\'s website — analyse existing site, extract content, design modern layout, write all code, deploy live',
    'Summarise this 80-page contract and highlight the 5 clauses that need immediate client attention',
    'Write a full business plan with financials, market analysis, competitor positioning, and 3-year growth strategy',
    'Build a CRM dashboard from scratch — lead tracking, deal pipeline, client interactions, automated follow-ups',
    'Architect a multi-tenant SaaS platform with user roles, billing, API access, and audit logging',
  ]},
  {model:'Claude Sonnet 4',logo:'/logos/icon-anthropic.svg',desc:'Fast + intelligent balance',cost:'££',prompts:[
    'Draft personalised outreach messages for 25 LinkedIn candidates based on their profiles',
    'Write 12 SEO-optimised blog posts targeting our primary keywords in our brand voice',
    'Build a comprehensive employee handbook covering policies, procedures, benefits, and values',
    'Create a 30-page training manual for new staff with screenshots and step-by-step guides',
    'Draft terms and conditions for our e-commerce site based on UK consumer law',
  ]},
  {model:'GPT-4o',logo:'/logos/icon-openai.svg',desc:'Fastest general-purpose model',cost:'££',prompts:[
    'Read this morning\'s emails, draft responses to the 3 urgent ones, flag anything needing personal attention',
    'Screen 150 CVs for the senior developer role and rank the top 10 with reasoning',
    'Translate our product catalogue into French, German, Spanish, Italian, and Japanese',
    'Transcribe this 45-minute client call and extract all action items with owners and deadlines',
    'Generate personalised thank-you emails for all 200 event attendees based on their registration data',
  ]},
  {model:'GPT-4o Mini',logo:'/logos/icon-openai.svg',desc:'Quick lightweight tasks',cost:'£',prompts:[
    'Categorise these 500 support tickets by type, urgency, and department',
    'Clean up this CSV — fix formatting, remove duplicates, standardise phone numbers and postcodes',
    'Generate meta descriptions for all 80 pages on our website',
    'Convert these meeting notes into a formatted action list with deadlines',
    'Auto-tag all 2,000 products in our catalogue with relevant search keywords',
  ]},
  {model:'Codex',logo:'/logos/icon-openai.svg',desc:'Autonomous coding agent',cost:'£££',prompts:[
    'Build an online booking system with table management, time slots, capacity limits, and confirmation emails',
    'Build a staff rota system with shift swapping, availability management, and conflict detection',
    'Migrate this WordPress site to Next.js — extract content, rebuild design, deploy to Vercel',
    'Create a ticket booking system with seat selection, dynamic pricing, and e-ticket generation',
    'Build a real-time shipment tracking dashboard with status updates and delivery ETAs',
  ]},
  {model:'Gemini 2.5 Pro',logo:'/logos/icon-googlegemini.svg',desc:'Research + data analysis',cost:'££',prompts:[
    'Analyse our Google reviews from the last 6 months — patterns, complaints, praise, and action points',
    'Research the client\'s 5 closest competitors — pricing, positioning, web traffic, social following',
    'Audit this website for technical SEO — broken links, missing tags, slow pages, prioritised fixes',
    'Analyse last quarter\'s sales data and recommend products to promote or discount for spring',
    'Research trending AW26 colours and styles from Vogue, WGSN, and Pantone — produce a visual report',
  ]},
  {model:'Gemini 2.5 Flash',logo:'/logos/icon-googlegemini.svg',desc:'Fast multimodal processing',cost:'£',prompts:[
    'Extract text and data from these 50 scanned invoices into a structured spreadsheet',
    'Describe all images in our product catalogue for accessibility alt-text compliance',
    'Read this handwritten meeting whiteboard photo and convert to typed notes with action items',
    'Process these 100 business cards — extract names, emails, companies into a contact list',
    'Identify and tag all brand assets in our Google Drive by file type, dimensions, and usage',
  ]},
  {model:'Kimi k2.5',logo:'/logos/icon-moonrepo.svg',desc:'Best value long-context model',cost:'£',prompts:[
    'Read this 200-page employee manual and create a condensed 10-page quick reference guide',
    'Process 500 expense receipts — extract amounts, categorise by type, produce a summary spreadsheet',
    'Analyse 3 insurance quotes side-by-side — coverage, exclusions, excess amounts, and value rating',
    'Review this entire year\'s email correspondence with the client and produce a relationship timeline',
    'Compare these 5 vendor contracts and create a matrix of terms, SLAs, pricing, and exit clauses',
  ]},
  {model:'Mistral Large',logo:'/logos/icon-json.svg',desc:'European open-weight model',cost:'££',prompts:[
    'Draft GDPR-compliant privacy policies for our UK and EU websites with data processing schedules',
    'Create multi-language customer service templates in English, French, German, and Spanish',
    'Build a risk assessment framework for our supply chain with scoring criteria and mitigations',
    'Analyse EU regulatory requirements for our new product line and flag compliance gaps',
    'Generate a data protection impact assessment for our new customer analytics platform',
  ]},
  {model:'DALL·E 3',logo:'/logos/icon-openai.svg',desc:'Image generation',cost:'££',prompts:[
    'Create product mockup images — our logo on mugs, t-shirts, tote bags, and phone cases',
    'Generate social media graphics for a 30-day campaign with consistent brand styling',
    'Design 10 variations of a hero image for our website landing page A/B test',
    'Create a series of seasonal promotional banners for our online shop',
    'Generate step-by-step visual instructions for our product assembly guide',
  ]},
  // Core APIs
  {model:'Stripe',logo:'/logos/icon-stripe.svg',desc:'Payments + invoicing',cost:'—',prompts:[
    'Generate invoices for all 30 regular clients and email them with payment links',
    'Build a donation page with Gift Aid, recurring options, and automated thank-you emails',
    'Set up a subscription billing system where customers choose products and get billed monthly',
    'Create a loan comparison calculator showing monthly payments, total interest, and APR',
    'Process refunds for the 12 cancelled orders and send confirmation receipts automatically',
  ]},
  {model:'Gmail',logo:'/logos/icon-gmail.svg',desc:'Email automation',cost:'—',prompts:[
    'Send appointment reminders to all patients booked for next week with prep instructions',
    'Email all registered buyers whose criteria match this new property listing',
    'A/B test two email subject lines across our subscriber list and report which wins',
    'Set up automated birthday emails to all clients with a personalised discount code',
    'Forward all emails from @important-client.com to the project manager with a summary',
  ]},
  {model:'Google Calendar',logo:'/logos/icon-googlecalendar.svg',desc:'Scheduling + planning',cost:'—',prompts:[
    'Schedule next week\'s 8 jobs, optimise the route between addresses, send ETAs to each client',
    'Create volunteer shift schedules for 60 people across 3 locations for the summer festival',
    'Schedule gas safety inspections for all 12 properties and send confirmations to tenants',
    'Block out preparation time before every client meeting and add travel time between locations',
    'Set up recurring team standups with agenda templates and automatic notes distribution',
  ]},
  {model:'Google Sheets',logo:'/logos/icon-googlesheets.svg',desc:'Data + spreadsheets',cost:'—',prompts:[
    'Generate a monthly P&L report from accounting data and email it to the directors',
    'Calculate food costs for the new menu — flag any items below 65% gross margin',
    'Generate a cash flow forecast for the next 12 months based on income and committed costs',
    'Build a dynamic pricing model that adjusts based on demand, season, and competitor rates',
    'Create a KPI dashboard tracking sales, customer acquisition cost, and churn rate weekly',
  ]},
  {model:'Google Docs',logo:'/logos/icon-googledocs.svg',desc:'Document generation',cost:'—',prompts:[
    'Create a welcome pack PDF for conference delegates — hotel info, transport, maps, agenda',
    'Generate CPD certificates for all 45 attendees of today\'s fire safety training',
    'Build a proposal template that auto-fills from client data, scope, and pricing tables',
    'Compile the quarterly board report from department submissions into a single formatted document',
    'Create branded case studies from client testimonials with before/after metrics',
  ]},
  {model:'Xero',logo:'/logos/icon-xero.svg',desc:'Accounting + tax',cost:'—',prompts:[
    'Reconcile the bank statement against Xero and flag every discrepancy with corrections',
    'Calculate corporation tax liability for FY25 and flag reliefs we might be missing',
    'Generate quarterly VAT return calculations and prepare the submission summary',
    'Create aged debtor reports and automatically chase invoices overdue by 30, 60, and 90 days',
    'Produce year-end accounts summary with profit, expenses, and tax position for the accountant',
  ]},
  {model:'QuickBooks',logo:'/logos/icon-quickbooks.svg',desc:'Accounting + invoicing',cost:'—',prompts:[
    'Generate rent statements for all 12 properties with income and expense breakdowns',
    'Categorise all uncategorised transactions from the last 3 months using our chart of accounts',
    'Create a contractor payment schedule with tax deduction calculations and remittance advice',
    'Build a project profitability report comparing quoted vs actual costs for each client',
    'Set up automated expense rules to categorise recurring payments from known suppliers',
  ]},
  {model:'WhatsApp',logo:'/logos/icon-whatsapp.svg',desc:'Client messaging',cost:'—',prompts:[
    'Send order confirmations with estimated delivery times and a tracking link',
    'Message all weekend staff their shift times, locations, and dress code for the festival',
    'Send all clients their quote PDFs with a click-to-approve link for instant sign-off',
    'Broadcast a flash sale notification to all opted-in customers with a discount code',
    'Send post-service feedback requests with a quick 1-5 star rating link',
  ]},
  {model:'Slack',logo:'/logos/icon-slack.svg',desc:'Team communication',cost:'—',prompts:[
    'Post the daily standup summary to #general with task updates from Trello and GitHub',
    'Automate weekly status reports — pull data from Trello, Slack, and Sheets into one doc',
    'Alert #urgent whenever a high-priority support ticket is created',
    'Create a #wins channel bot that celebrates when deals close or milestones are hit',
    'Send project deadline reminders to relevant channels 48 hours before due dates',
  ]},
  {model:'Shopify',logo:'/logos/icon-shopify.svg',desc:'E-commerce platform',cost:'—',prompts:[
    'Build an online store with 50 products, variants, size guides, and integrated payments',
    'Set up automated reorder alerts when any product drops below 10 units in stock',
    'Write product descriptions for 100 items in our brand voice with SEO titles',
    'Create a wholesale portal with tiered pricing for trade customers',
    'Build an abandoned cart recovery flow — email, then WhatsApp, then discount offer',
  ]},
  {model:'Notion',logo:'/logos/icon-notion.svg',desc:'Knowledge management',cost:'—',prompts:[
    'Create a searchable knowledge base with FAQs, how-to guides, and troubleshooting steps',
    'Build an onboarding checklist for new employees — tasks, deadlines, and sign-offs',
    'Set up a project wiki with meeting notes, decisions, timelines, and responsibilities',
    'Create a content calendar with drafts, approval workflows, and publish schedules',
    'Build a client database with contact details, project history, and relationship notes',
  ]},
  {model:'Figma',logo:'/logos/icon-figma.svg',desc:'Design + prototyping',cost:'—',prompts:[
    'Create product mockups from flat artwork — mugs, t-shirts, tote bags, phone cases',
    'Design business cards, letterheads, and email signatures matching brand guidelines',
    'Design tap badges and pump clip artwork for our 4 core beers in consistent style',
    'Build a component library with buttons, cards, forms, and navigation for our design system',
    'Create responsive wireframes for the new customer portal — desktop, tablet, and mobile',
  ]},
  {model:'GitHub',logo:'/logos/icon-github.svg',desc:'Code management',cost:'—',prompts:[
    'Review this pull request — check for security issues, performance, suggest improvements',
    'Set up branch protection, code review requirements, and automated deployment workflows',
    'Scan all repositories for exposed API keys, outdated dependencies, and vulnerabilities',
    'Generate release notes from merged PRs for the v2.0 launch announcement',
    'Create issue templates for bug reports, feature requests, and support tickets',
  ]},
  {model:'Mailchimp',logo:'/logos/icon-mailchimp.svg',desc:'Email marketing',cost:'—',prompts:[
    'Segment our mailing list by purchase history and send targeted seasonal offers',
    'Write a 30-day email drip campaign for new subscribers — welcome, educate, convert',
    'Design and code a branded HTML email template for our monthly newsletter',
    'Clean our email list — remove bounces, unengaged subscribers, and duplicate entries',
    'Create a re-engagement campaign for subscribers who haven\'t opened in 90 days',
  ]},
  {model:'Zoom',logo:'/logos/icon-zoom.svg',desc:'Video meetings',cost:'—',prompts:[
    'Transcribe today\'s client meeting, extract action items, and email a summary to attendees',
    'Set up a webinar registration page with calendar invites and reminder sequences',
    'Record the training session, generate chapters, and upload to our learning portal',
    'Schedule recurring 1:1s with all direct reports with rotating agenda templates',
    'Create meeting highlights from this week\'s 5 client calls — key decisions and next steps',
  ]},
  {model:'Trello',logo:'/logos/icon-trello.svg',desc:'Project management',cost:'—',prompts:[
    'Create a project board for the website rebuild with stages, tasks, and deadlines',
    'Move all overdue cards to a "Needs Attention" list and notify the assigned team members',
    'Generate a weekly progress report from all boards — completed, in progress, blocked',
    'Set up automation rules: when card moves to Done, notify client and log billable hours',
    'Build a content pipeline board with writing, editing, design, and publish stages',
  ]},
  {model:'Twilio',logo:'/logos/icon-auth0.svg',desc:'SMS + voice automation',cost:'—',prompts:[
    'Build an SMS booking confirmation system with appointment details and cancellation links',
    'Set up a phone IVR system: press 1 for sales, 2 for support, 3 for accounts',
    'Send bulk SMS reminders to all clients with appointments in the next 48 hours',
    'Create a missed call follow-up — auto-text saying "Sorry we missed you, here\'s a booking link"',
    'Build a two-factor authentication system for our client portal login',
  ]},
  {model:'Google Drive',logo:'/logos/icon-googledrive.svg',desc:'File management',cost:'—',prompts:[
    'Organise our shared drive — sort by project, archive old files, set permissions per team',
    'Resize all 47 campaign assets to Instagram, Facebook, LinkedIn, and Twitter dimensions',
    'Back up all client folders to a dated archive with a manifest of what\'s included',
    'Find and remove all duplicate files across the team drive — recover 2GB of storage',
    'Create a file naming convention and automatically rename all existing files to match',
  ]},
  {model:'anyOS',logo:'/logos/icon-anyos.svg',desc:'Auto-selects the best model',cost:'Smart',prompts:[
    'Build a quote calculator for mobile bar packages with staffing, equipment, and pricing',
    'Create a cocktail menu PDF with photos, descriptions, allergen info, and pricing',
    'Optimise delivery routes for 25 drops across London — minimise mileage and fuel costs',
    'Build a quality checklist app with photo evidence, GPS stamps, and client sign-off',
    'Generate a full network audit — devices, security status, vulnerabilities, and fixes',
  ]},
]

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

/* ===== CLICKABLE TAG + POPUP ===== */
function TagPopup({ tag, onClose }: { tag: string; onClose: () => void }) {
  const info = TAG_INFO[tag]
  if (!info) return null
  return (
    <div className="tag-popup-overlay" onClick={onClose}>
      <div className="tag-popup" onClick={e => e.stopPropagation()}>
        <div className="tag-popup-title">{info.title}</div>
        <p className="tag-popup-desc">{info.desc}</p>
        <button className="tag-popup-close" onClick={onClose}>✕</button>
      </div>
    </div>
  )
}

const PIN_CODE = '2203'

function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState<string[]>([])
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleDigit = useCallback((d: string) => {
    setDigits(prev => {
      if (prev.length >= 4) return prev
      const next = [...prev, d]
      if (next.length === 4) {
        if (next.join('') === PIN_CODE) {
          setTimeout(() => setSuccess(true), 150)
          setTimeout(() => {
            sessionStorage.setItem('anyos-unlocked', '1')
            onUnlock()
          }, 800)
        } else {
          setTimeout(() => {
            setShake(true)
            setTimeout(() => { setShake(false); setDigits([]) }, 500)
          }, 200)
        }
      }
      return next
    })
  }, [onUnlock])

  const handleDelete = useCallback(() => {
    setDigits(prev => prev.slice(0, -1))
  }, [])

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div className={`pin-overlay ${success ? 'pin-unlocked' : ''}`}>
      <div className="pin-container">
        <div className="pin-logo">any<span>OS</span></div>
        <p className="pin-subtitle">Enter access code</p>
        <div className={`pin-dots ${shake ? 'pin-shake' : ''}`}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${i < digits.length ? 'filled' : ''} ${shake ? 'error' : ''}`} />
          ))}
        </div>
        <div className="pin-keypad">
          {keys.map((k, i) => (
            k === '' ? <div key={i} className="pin-key empty" /> :
            k === '⌫' ? (
              <button key={i} className="pin-key delete" onClick={handleDelete}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
              </button>
            ) : (
              <button key={i} className="pin-key" onClick={() => handleDigit(k)}>{k}</button>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [expandedCompany, setExpandedCompany] = useState<string|null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<string|null>(null)
  const [selectedTag, setSelectedTag] = useState<string|null>(null)
  const [expandedService, setExpandedService] = useState<string|null>(null)

  useEffect(() => {
    if (sessionStorage.getItem('anyos-unlocked') === '1') setUnlocked(true)
  }, [])

  const companies = [
    { name: 'Spotify', detail: '— Music streaming giant, 3 rounds of layoffs', number: '1,700+ jobs cut', info: '1,500 employees (17% of workforce) in Dec 2023, plus 200+ more in 2024. Now using AI for personalisation, ad optimisation, and automated code generation. Senior engineers act as "architects and editors" while AI handles routine development.' },
    { name: 'Ocado', detail: '— UK grocery tech, £150m cost-cutting drive', number: '1,000 jobs cut', info: 'Announced Feb 2026: cutting 1,000 roles (5% of global workforce), mostly R&D in the UK. Using AI and robotics to automate warehouse logistics. Saving £150m in technology and support costs.' },
    { name: 'Duolingo', detail: '— Declared "AI-first", replaced contractors', number: 'AI-first policy', info: 'Declared AI-first in April 2025. Cut 10% of contractors whose work AI now handles. CEO memo: "gradually stop using contractors to do work that AI can handle." AI now creates lessons across 100+ languages.' },
    { name: 'Meta', detail: '— 1,500 cut from Reality Labs (Jan 2026)', number: '11,000+ total', info: 'Laid off 11,000 in 2022, 10,000 in 2023, then 1,500 from Reality Labs in Jan 2026. Restructured entire teams around AI capabilities. Shifted investment into AI infrastructure and models.' },
    { name: 'Amazon', detail: '— 16,000 jobs cut in early 2026 alone', number: '16,000 jobs cut', info: 'The largest single-company layoffs of 2026 so far. Expanding robotics and AI in fulfilment, logistics, and customer service. Despite continued revenue growth, AI is replacing manual roles at scale.' },
    { name: 'Klarna', detail: '— AI chatbot replaced 700 customer service agents', number: '700 roles replaced', info: 'Deployed AI assistant handling 2.3 million conversations — equivalent to 700 agents. Saved $40m. CEO plans to shrink from 3,000 to under 2,000 employees by 2030. Then quietly re-hired humans when quality dropped.' },
    { name: 'IBM', detail: '— Paused hiring for AI-replaceable roles', number: '7,800 roles frozen', info: 'IBM announced a hiring freeze for any role that could be performed by AI, affecting roughly 7,800 back-office positions. Redirecting investment into AI infrastructure and Watson successors.' },
  ]

  const goPrev = useCallback(() => {
    setActiveSlide(s => Math.max(0, s - 1))
    window.scrollTo(0, 0)
  }, [])
  const goNext = useCallback(() => {
    setActiveSlide(s => Math.min(11, s + 1))
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

  if (!unlocked) return <PinLock onUnlock={() => setUnlocked(true)} />

  return (
    <div className="presentation-root">
      <TopNav
        current={activeSlide + 1}
        total={12}
        title={SLIDE_TITLES[activeSlide] || ''}
        onPrev={goPrev}
        onNext={goNext}
      />
      <div className="bottom-bar">
        {activeSlide === 0 ? (
          <div style={{textAlign:'center',fontSize:'11px',color:'#999',fontWeight:500}}>Swipe or press → to begin</div>
        ) : activeSlide <= 6 ? (
          <Timeline active={activeSlide < 6 ? activeSlide : 6} />
        ) : (
          <Progress page={activeSlide + 1} total={12} />
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
              {['GeoCities','Yahoo!','AltaVista','Netscape','HTML','Dial-Up','FTP'].map(t => <span key={t} className={`tag ${TAG_INFO[t] ? "clickable" : ""}`} onClick={() => TAG_INFO[t] && setSelectedTag(t)}>{t}</span>)}
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
              {['MySpace','Facebook','YouTube','WordPress','Twitter','Instagram','iPhone','Google Docs'].map(t => <span key={t} className={`tag ${TAG_INFO[t] ? "clickable" : ""}`} onClick={() => TAG_INFO[t] && setSelectedTag(t)}>{t}</span>)}
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
              {['Bitcoin','Ethereum','OpenSea','MetaMask','Uniswap','Smart Contracts','Trading Bots'].map(t => <span key={t} className={`tag ${TAG_INFO[t] ? "clickable" : ""}`} onClick={() => TAG_INFO[t] && setSelectedTag(t)}>{t}</span>)}
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
            <p className="description">The AI era. ChatGPT launched November 2022 and now has over 900 million weekly active users. Software no longer just displays information — it <strong>acts</strong>. AI agents write emails, build websites, manage projects, and make decisions. Natural language is the new interface. In 2025–2026, over 250,000 tech workers were laid off as companies restructured around AI.</p>
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
              {['ChatGPT','Claude','Gemini','anyOS','Copilot','Midjourney','AI Agents'].map(t => <span key={t} className={`tag ${TAG_INFO[t] ? "clickable" : ""}`} onClick={() => TAG_INFO[t] && setSelectedTag(t)}>{t}</span>)}
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
              {['Autonomous Agents','Machine-to-Machine','Predictive AI','Voice-First','Zero-Code','Digital Twins','Hyper-Personalisation'].map(t => <span key={t} className={`tag ${TAG_INFO[t] ? "clickable" : ""}`} onClick={() => TAG_INFO[t] && setSelectedTag(t)}>{t}</span>)}
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
                <div><span className="company" style={{color:'#dc2626'}}>Total tech layoffs 2025–2026</span></div>
                <div className="number" style={{fontSize:'clamp(14px,1.6vw,20px)'}}>250,000+</div>
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

      {/* ===== SLIDE 7: WHAT IS anyOS ===== */}
      <div className={`slide-snap ${activeSlide === 7 ? "active" : ""}`}>
        <div className="slide-page page7">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Product</div>
              <div className="position-label" style={{background:'#4338ca'}}>OVERVIEW</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div className="era-subtitle">An AI Operating System for Business</div>
            <h1 className="era-title">What is anyOS?</h1>
            <div className="era-period" style={{marginBottom:'1.5vh'}}>Hardware + Software + AI + Support — delivered as one system</div>
            <p className="description">anyOS is a complete AI operating system. Not an app. Not a chatbot. Pre-configured hardware arrives at your office, plugs in, and connects your entire business — email, calendar, websites, databases, project management, customer communications — through one natural language interface.</p>
            <div className="features">
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                  <h3>Hardware Delivered</h3>
                </div>
                <p>Mac Studio, MacBook Pro, or Mac Mini — pre-configured and ready to run. Arrives at your office, plugs in, works.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                  <h3>Natural Language Interface</h3>
                </div>
                <p>No coding required. No complex software to learn. Type what you need in plain English and the system executes it.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 14H5a2 2 0 0 0-2 2v2h18v-2a2 2 0 0 0-2-2z"/><line x1="12" y1="10" x2="12" y2="14"/></svg></div>
                  <h3>Multiple AI Models</h3>
                </div>
                <p>The right AI for each task. Strategy, creative, coding, admin — different specialists working together under one roof.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
                  <h3>Memory System</h3>
                </div>
                <p>Learns the business. Remembers context, preferences, history, client details. Gets smarter every day it runs.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
                  <h3>100+ Integrations</h3>
                </div>
                <p>Email, calendar, databases, websites, Slack, WhatsApp, accounting, CRM — all connected through one system.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
                  <h3>Full Cost Transparency</h3>
                </div>
                <p>Every action logged. Compute tracked per user. Monthly caps available. No hidden fees.</p>
              </div>
            </div>
            <div className="key-stat">
              <p>anyOS replaces fragmented tools with one unified system. One interface. One subscription. Everything connected.</p>
              <p className="stat-sub">Setup, training, and ongoing support included as standard.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 8: HOW anyOS WORKS ===== */}
      <div className={`slide-snap ${activeSlide === 8 ? "active" : ""}`}>
        <div className="slide-page page8">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Product</div>
              <div className="position-label" style={{background:'#0f766e'}}>ARCHITECTURE</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div className="era-subtitle" style={{color:'#0f766e'}}>From Request to Result in Seconds</div>
            <h1 className="era-title">How anyOS Works</h1>
            <div className="era-period" style={{marginBottom:'1.5vh'}}>Four layers working together to execute any business task</div>
            <div className="journey-timeline">
              {[
                {year:'01',text:<><strong>User sends a request.</strong> Plain English via chat, voice, email, or any connected channel. &quot;Rebuild the client&apos;s website&quot; or &quot;Send the invoice to Sarah.&quot;</>},
                {year:'02',text:<><strong>anyOS selects the right AI model.</strong> Different models excel at different tasks. The system routes each request to the best available model automatically.</>},
                {year:'03',text:<><strong>The system accesses connected tools.</strong> Email, calendar, databases, code repositories, file storage, payment platforms — whatever the task requires.</>},
                {year:'04',text:<><strong>The task is executed.</strong> Code is written. Emails are sent. Reports are generated. Files are processed. Websites go live. All logged and auditable.</>},
                {year:'05',text:<><strong>Memory is updated.</strong> The system records what it learned — client preferences, project context, past decisions. Every task makes the next one faster.</>},
              ].map(r => (
                <div key={r.year} className="journey-row">
                  <div className="journey-year">{r.year}</div>
                  <div className="journey-text">{r.text}</div>
                </div>
              ))}
            </div>
            <div className="features" style={{marginTop:'1.5vh'}}>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <h3>Security First</h3>
                </div>
                <p>Data stays on your hardware. Local AI models available for sensitive work. Full control over what leaves your network.</p>
              </div>
              <div className="feature-box">
                <div className="feature-top">
                  <div className="icon-wrapper"><svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                  <h3>Multi-User</h3>
                </div>
                <p>Every team member gets access. Individual usage tracked. Permissions configurable per role.</p>
              </div>
            </div>
            <div className="key-stat">
              <p>A website that costs £2,500 from an agency is built for ~£25 in compute. A 3-hour research task takes 2 minutes.</p>
              <p className="stat-sub">Same quality. Fraction of the cost. Fraction of the time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 9: INTEGRATIONS ===== */}
      <div className={`slide-snap ${activeSlide === 9 ? "active" : ""}`}>
        <div className="slide-page page9">
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">The Ecosystem</div>
              <div className="position-label" style={{background:'#0891b2'}}>100+ INTEGRATIONS</div>
            </div>
          </div>
          <div className="era-content" style={{flex:1,display:'flex',flexDirection:'column'}}>
            <div className="era-subtitle" style={{color:'#0891b2'}}>Tap any logo to see how it connects</div>
            <h1 className="era-title">Integrations</h1>
            <div className="era-period" style={{marginBottom:'1vh'}}>Every tool your business uses — connected through one system</div>
            {selectedIntegration && INTEGRATIONS[selectedIntegration] && (
              <div className="integration-detail" onClick={() => setSelectedIntegration(null)}>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
                  <img src={`/logos/icon-${selectedIntegration}.svg`} alt="" style={{width:'36px',height:'36px'}} />
                  <div>
                    <h3 style={{fontSize:'16px',fontWeight:700,color:'#1a1a1a',margin:0}}>{INTEGRATIONS[selectedIntegration].name}</h3>
                    <p style={{fontSize:'12px',color:'#666',margin:0}}>{INTEGRATIONS[selectedIntegration].desc}</p>
                  </div>
                </div>
                <p style={{fontSize:'13px',color:'#333',lineHeight:1.5,margin:0}}><strong>anyOS integration:</strong> {INTEGRATIONS[selectedIntegration].how}</p>
                <p style={{fontSize:'10px',color:'#999',marginTop:'6px'}}>Tap to close</p>
              </div>
            )}
            <div className="integrations-grid">
              {Object.keys(INTEGRATIONS).map(key => (
                <button key={key} className="integration-logo-btn" onClick={() => setSelectedIntegration(selectedIntegration === key ? null : key)}>
                  <img src={`/logos/icon-${key}.svg`} alt={INTEGRATIONS[key].name} />
                </button>
              ))}
            </div>
            <div className="key-stat">
              <p>100+ integrations. One system. Every tool your team already uses — now connected and automated.</p>
              <p className="stat-sub">New integrations added continuously. Custom connections available on request.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 10: LIVE DEMO ===== */}
      <div className={`slide-snap ${activeSlide === 10 ? "active" : ""}`}>
        <div className="slide-page page9" style={{display:'flex',flexDirection:'column',height:'100%'}}>
          <div className="brand-header">
            <div className="logo">any<span>OS</span></div>
            <div className="header-right">
              <div className="era-badge">Live Demonstration</div>
              <div className="position-label" style={{background:'#0891b2'}}>WATCH THIS</div>
            </div>
          </div>
          <div className="era-subtitle" style={{color:'#0891b2'}}>What Can You Ask anyOS?</div>
          <h1 className="era-title">Live Demo</h1>
          <div className="era-period" style={{marginBottom:'1vh'}}>Real prompts. Real businesses. Everything below works today.</div>

          <div className="prompt-scroller">
            {DEMO_SERVICES.map((s) => (
              <div key={s.model} className="service-accordion">
                <div className="service-header" onClick={() => setExpandedService(expandedService === s.model ? null : s.model)}>
                  <img src={s.logo} alt="" className="service-logo" />
                  <div className="service-info">
                    <span className="service-name">{s.model}</span>
                    <span className="service-desc">{s.desc}</span>
                  </div>
                  <span className="service-cost">{s.cost}</span>
                  <span className="service-count">{s.prompts.length}</span>
                  <span className={`service-chevron ${expandedService === s.model ? 'open' : ''}`}>▾</span>
                </div>
                <div className={`service-prompts ${expandedService === s.model ? 'open' : ''}`}>
                  {s.prompts.map((p, i) => (
                    <div key={i} className="service-prompt-row">
                      <span className="service-prompt-num">{String(i+1).padStart(2,'0')}</span>
                      <span className="service-prompt-text">&ldquo;{p}&rdquo;</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="demo-summary-fixed">
            <div className="features" style={{marginBottom:'0.8vh'}}>
              <div className="feature-box" style={{borderColor:'#a5f3fc',background:'#ecfeff'}}>
                <div className="feature-top"><span className="feature-icon">⏱</span><h3>Time Saved</h3></div>
                <p>Hours become minutes. Days become hours. Your team focuses on high-value work while AI handles the rest.</p>
              </div>
              <div className="feature-box" style={{borderColor:'#a5f3fc',background:'#ecfeff'}}>
                <div className="feature-top"><span className="feature-icon">💷</span><h3>Money Saved</h3></div>
                <p>£25 vs £2,500. Pennies vs pounds. The cost difference isn&apos;t marginal — it&apos;s transformational.</p>
              </div>
            </div>
            <div className="key-stat" style={{background:'#0891b2'}}>
              <p>Everything you&apos;re about to see is real. No pre-built templates. No pre-recorded demos. Just a prompt, a system, and results.</p>
              <p className="stat-sub">The same system. The same process. Available to every member of your team.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SLIDE 11: THE RESULTS ===== */}
      <div className={`slide-snap ${activeSlide === 11 ? "active" : ""}`}>
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
            <h1 className="era-title">The Results</h1>
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
      {selectedTag && <TagPopup tag={selectedTag} onClose={() => setSelectedTag(null)} />}
    </div>
  )
}
