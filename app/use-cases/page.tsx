'use client'

import Nav from '../components/Nav'
import Footer from '../components/Footer'
import DashboardMock from '../components/DashboardMock'

const USE_CASES = [
  {
    id: 'print',
    name: 'anyOS Print',
    headline: 'For Print & Production Companies',
    desc: 'Job management, proofing workflows, client communications, production scheduling and invoicing — all handled by AI agents that understand print.',
    color: '#f59e0b',
    icon: '🖨️',
    features: ['Auto-generate job tickets from client emails', 'Proof approval tracking & follow-ups', 'Production scheduling & capacity planning', 'Supplier PO automation', 'Client quote builder', 'Delivery tracking & dispatch alerts'],
    dashboard: {
      widgets: [
        { title: 'Active Jobs', value: '34', color: '#f59e0b', sub: '12 in production' },
        { title: 'Proofs Pending', value: '8', color: '#ef4444', sub: '3 overdue' },
        { title: 'Revenue MTD', value: '£47.2K', color: '#22c55e' },
        { title: 'On-Time Delivery', value: '96%', color: '#6366f1' },
      ],
      activities: [
        { time: '2 min ago', text: 'Generated quote for Acme Corp — 5,000 A3 brochures, matt laminate', agent: 'Agent 1', agentColor: '#f59e0b' },
        { time: '8 min ago', text: 'Sent proof approval reminder to Henderson & Co (3rd chase)', agent: 'Agent 2', agentColor: '#22c55e' },
        { time: '15 min ago', text: 'Updated production schedule — Heidelberg press available Thursday AM', agent: 'Agent 1', agentColor: '#f59e0b' },
        { time: '22 min ago', text: 'Raised PO to GF Smith for 200gsm Colorplan stock', agent: 'Agent 2', agentColor: '#22c55e' },
        { time: '1 hr ago', text: 'Invoice #4821 sent to MediaCorp — £3,240 + VAT', agent: 'Agent 1', agentColor: '#f59e0b' },
      ],
      agents: ['Print Manager', 'Client Liaison'],
    },
  },
  {
    id: 'construction',
    name: 'anyOS Builder',
    headline: 'For Construction & Building Companies',
    desc: 'Project tracking, compliance documents, subcontractor management, quoting and health & safety — managed by AI that knows construction.',
    color: '#22c55e',
    icon: '🏗️',
    features: ['Project timeline & milestone tracking', 'Subcontractor scheduling & comms', 'H&S documentation & compliance alerts', 'Material ordering & cost tracking', 'Client progress reports (auto-generated)', 'Planning application document management'],
    dashboard: {
      widgets: [
        { title: 'Active Projects', value: '7', color: '#22c55e', sub: '3 on schedule' },
        { title: 'Overdue Tasks', value: '4', color: '#ef4444', sub: '2 critical' },
        { title: 'Monthly Spend', value: '£186K', color: '#f59e0b' },
        { title: 'H&S Score', value: '98%', color: '#6366f1' },
      ],
      activities: [
        { time: '5 min ago', text: 'Updated project timeline for 14 Elm Street — plastering delayed 2 days', agent: 'Site Manager', agentColor: '#22c55e' },
        { time: '12 min ago', text: 'Sent progress report to client with photos from today\'s inspection', agent: 'Admin Agent', agentColor: '#6366f1' },
        { time: '30 min ago', text: 'Flagged expired CSCS card for Dave Mitchell — renewal reminder sent', agent: 'H&S Agent', agentColor: '#ef4444' },
        { time: '1 hr ago', text: 'Ordered 40m³ ready-mix concrete from Hanson — delivery Thursday 7am', agent: 'Site Manager', agentColor: '#22c55e' },
        { time: '2 hr ago', text: 'Generated quote for new kitchen extension — £34,500 inc. VAT', agent: 'Admin Agent', agentColor: '#6366f1' },
      ],
      agents: ['Site Manager', 'Admin Agent', 'H&S Agent'],
    },
  },
  {
    id: 'care',
    name: 'anyOS Care',
    headline: 'For Care Homes & Healthcare',
    desc: 'Patient monitoring, medication schedules, family updates, staff rota management and CQC compliance — AI that cares about care.',
    color: '#ec4899',
    icon: '🏥',
    features: ['Medication schedule tracking & alerts', 'Family update emails (daily/weekly)', 'Staff rota generation & shift swaps', 'CQC compliance document management', 'Incident reporting & escalation', 'Meal planning & dietary requirement tracking'],
    dashboard: {
      widgets: [
        { title: 'Residents', value: '42', color: '#ec4899', sub: '3 high-priority' },
        { title: 'Meds Due Today', value: '128', color: '#f59e0b', sub: '4 overdue' },
        { title: 'Staff On Shift', value: '12', color: '#22c55e' },
        { title: 'CQC Compliance', value: '100%', color: '#6366f1' },
      ],
      activities: [
        { time: '3 min ago', text: 'Medication administered to Room 14 (Margaret H.) — Amlodipine 5mg confirmed', agent: 'Med Agent', agentColor: '#ec4899' },
        { time: '10 min ago', text: 'Sent weekly update email to family of John P. — including activity photos', agent: 'Family Liaison', agentColor: '#6366f1' },
        { time: '25 min ago', text: 'Shift swap approved: Sarah → Tuesday AM, James → Wednesday PM', agent: 'Rota Agent', agentColor: '#22c55e' },
        { time: '45 min ago', text: 'Incident report filed: minor fall in corridor B — no injury, family notified', agent: 'Med Agent', agentColor: '#ec4899' },
        { time: '1 hr ago', text: 'CQC inspection checklist updated — all 14 categories compliant', agent: 'Compliance Agent', agentColor: '#f59e0b' },
      ],
      agents: ['Med Agent', 'Family Liaison', 'Rota Agent'],
    },
  },
  {
    id: 'hospitality',
    name: 'anyOS Hospitality',
    headline: 'For Hospitality & Events',
    desc: 'Booking management, supplier coordination, staff scheduling, client communications and on-the-day logistics — AI that runs your events.',
    color: '#8b5cf6',
    icon: '🍸',
    features: ['Event booking pipeline & CRM', 'Supplier quote requests & POs', 'Staff scheduling & availability tracking', 'Equipment inventory management', 'Client proposals (auto-generated)', 'Post-event invoicing & follow-ups'],
    dashboard: {
      widgets: [
        { title: 'Upcoming Events', value: '12', color: '#8b5cf6', sub: 'Next: Friday 8pm' },
        { title: 'Open Quotes', value: '6', color: '#f59e0b', sub: '£28K pipeline' },
        { title: 'Revenue MTD', value: '£18.4K', color: '#22c55e' },
        { title: 'Staff Available', value: '24', color: '#6366f1' },
      ],
      activities: [
        { time: '5 min ago', text: 'New enquiry from Sarah M. — 150-person wedding, July 19th, Oxfordshire', agent: 'Bookings Agent', agentColor: '#8b5cf6' },
        { time: '15 min ago', text: 'Sent equipment list to supplier — 3x mobile bars, 200 glasses, 4 fridges', agent: 'Logistics Agent', agentColor: '#22c55e' },
        { time: '30 min ago', text: 'Generated proposal for corporate event — Deloitte Summer Party, £4,200', agent: 'Bookings Agent', agentColor: '#8b5cf6' },
        { time: '1 hr ago', text: 'Staff confirmed for Saturday: 6 bartenders, 2 managers, 1 barback', agent: 'Rota Agent', agentColor: '#f59e0b' },
        { time: '2 hr ago', text: 'Post-event invoice sent to Williams & Hart — £2,800 + VAT', agent: 'Bookings Agent', agentColor: '#8b5cf6' },
      ],
      agents: ['Bookings Agent', 'Logistics Agent', 'Rota Agent'],
    },
  },
  {
    id: 'property',
    name: 'anyOS Property',
    headline: 'For Estate Agents & Property',
    desc: 'Listing management, viewing scheduling, buyer/seller comms, market reports and compliance — AI that sells homes.',
    color: '#06b6d4',
    icon: '🏠',
    features: ['Property listing creation & syndication', 'Automated viewing scheduling', 'Buyer/seller email management', 'Market report generation', 'Chain progression tracking', 'AML compliance checks'],
    dashboard: {
      widgets: [
        { title: 'Active Listings', value: '48', color: '#06b6d4', sub: '6 new this week' },
        { title: 'Viewings Today', value: '9', color: '#f59e0b' },
        { title: 'Under Offer', value: '14', color: '#22c55e', sub: '£4.2M total' },
        { title: 'Avg Days to Sell', value: '23', color: '#6366f1' },
      ],
      activities: [
        { time: '3 min ago', text: 'New valuation request — 42 Oak Lane, Chingford. Booked for Thursday 2pm', agent: 'Listings Agent', agentColor: '#06b6d4' },
        { time: '12 min ago', text: 'Viewing feedback collected from Mr & Mrs Patel — positive, second viewing requested', agent: 'Sales Agent', agentColor: '#22c55e' },
        { time: '25 min ago', text: 'Chain update: 14 Elm Road — buyer\'s mortgage approved, exchange next week', agent: 'Progression Agent', agentColor: '#f59e0b' },
        { time: '1 hr ago', text: 'Market report generated for E11 postcode — avg price £485K, up 3.2% QoQ', agent: 'Listings Agent', agentColor: '#06b6d4' },
        { time: '2 hr ago', text: 'AML check completed for new vendor — Sarah Hughes, ID verified', agent: 'Compliance Agent', agentColor: '#ec4899' },
      ],
      agents: ['Listings Agent', 'Sales Agent', 'Progression Agent'],
    },
  },
  {
    id: 'accounting',
    name: 'anyOS Accounts',
    headline: 'For Accounting & Finance',
    desc: 'Invoicing, reconciliation, expense tracking, payroll, tax prep and client reporting — AI that balances the books.',
    color: '#10b981',
    icon: '📊',
    features: ['Automated bank reconciliation', 'Invoice generation & chasing', 'Expense categorisation & receipt matching', 'VAT return preparation', 'Client month-end reports', 'Cash flow forecasting'],
    dashboard: {
      widgets: [
        { title: 'Invoices Due', value: '23', color: '#ef4444', sub: '£34K outstanding' },
        { title: 'Reconciled', value: '94%', color: '#10b981' },
        { title: 'Revenue MTD', value: '£128K', color: '#22c55e' },
        { title: 'VAT Due', value: '£8.4K', color: '#f59e0b', sub: 'Due 7th April' },
      ],
      activities: [
        { time: '1 min ago', text: 'Auto-reconciled 12 bank transactions — 3 flagged for review', agent: 'Bookkeeper', agentColor: '#10b981' },
        { time: '10 min ago', text: 'Payment reminder sent to Apex Industries — Invoice #3847, 14 days overdue', agent: 'Collections Agent', agentColor: '#ef4444' },
        { time: '20 min ago', text: 'Monthly P&L report generated for March — emailed to client', agent: 'Bookkeeper', agentColor: '#10b981' },
        { time: '45 min ago', text: 'Categorised 28 expenses from company card — 2 need receipts', agent: 'Expense Agent', agentColor: '#f59e0b' },
        { time: '1 hr ago', text: 'VAT return draft prepared for Q4 — £8,412 payable, ready for review', agent: 'Bookkeeper', agentColor: '#10b981' },
      ],
      agents: ['Bookkeeper', 'Collections Agent', 'Expense Agent'],
    },
  },
]

export default function UseCases() {
  return (
    <>
      <Nav />
      <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: '8rem 2rem 4rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, marginBottom: '1rem' }}>Use Cases</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: 'white', fontWeight: 800, lineHeight: 1.05, marginBottom: '1rem' }}>
              One system.<br />Every industry.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              anyOS adapts to your business. Same hardware, same agents — configured for how you actually work.
            </p>
          </div>
        </section>

        {/* Industry cards */}
        <section style={{ padding: '0 2rem 4rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {USE_CASES.map(uc => (
              <a key={uc.id} href={`#${uc.id}`} style={{
                padding: '1.5rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{uc.icon}</div>
                <div style={{ color: uc.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{uc.name}</div>
                <div style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>{uc.headline}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Individual use case sections */}
        {USE_CASES.map((uc, idx) => (
          <section key={uc.id} id={uc.id} style={{
            padding: '6rem 2rem',
            background: idx % 2 === 0 ? '#0a0a0a' : '#060608',
          }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: uc.color, fontWeight: 700, marginBottom: '0.5rem' }}>{uc.name}</div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'white', fontWeight: 800, marginBottom: '0.75rem' }}>{uc.headline}</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '550px', margin: '0 auto' }}>{uc.desc}</p>
              </div>

              {/* Dashboard mockup */}
              <DashboardMock
                industry={uc.name}
                accentColor={uc.color}
                widgets={uc.dashboard.widgets}
                activities={uc.dashboard.activities}
                agentNames={uc.dashboard.agents}
              />

              {/* Features */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '2.5rem', maxWidth: '900px', margin: '2.5rem auto 0' }}>
                {uc.features.map((f, i) => (
                  <div key={i} style={{
                    padding: '0.75rem 1rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: uc.color, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
