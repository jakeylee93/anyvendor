'use client'

interface Widget {
  title: string
  value: string
  sub?: string
  color: string
  span?: number
}

interface Activity {
  time: string
  text: string
  agent: string
  agentColor: string
}

interface DashboardProps {
  industry: string
  accentColor: string
  widgets: Widget[]
  activities: Activity[]
  agentNames: string[]
}

export default function DashboardMock({ industry, accentColor, widgets, activities, agentNames }: DashboardProps) {
  return (
    <div style={{
      background: '#0c0c0f', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      maxWidth: '900px', margin: '0 auto',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            anyOS — {industry}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {agentNames.map(a => (
            <span key={a} style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem',
              background: `${accentColor}20`, color: accentColor, fontWeight: 700,
            }}>{a}</span>
          ))}
        </div>
      </div>

      {/* Dashboard content */}
      <div style={{ padding: '1.25rem' }}>
        {/* Widgets grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {widgets.map((w, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px', padding: '1rem',
              gridColumn: w.span ? `span ${w.span}` : 'span 1',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{w.title}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: w.color, fontFamily: "'Space Grotesk', sans-serif" }}>{w.value}</div>
              {w.sub && <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.2rem' }}>{w.sub}</div>}
            </div>
          ))}
        </div>

        {/* Activity feed + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0.75rem' }}>
          {/* Activity feed */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
            padding: '1rem', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Recent Activity</div>
            {activities.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.5rem 0',
                borderBottom: i < activities.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.agentColor, marginTop: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                    {a.agent} · {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agent status sidebar */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
            padding: '1rem', border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Agents Online</div>
            {agentNames.map((a, i) => (
              <div key={a} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.6rem', marginBottom: '0.4rem',
                background: 'rgba(255,255,255,0.03)', borderRadius: '6px',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'white', fontWeight: 700 }}>{a}</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>Active</div>
                </div>
              </div>
            ))}
            <div style={{
              marginTop: '0.75rem', padding: '0.6rem',
              background: `${accentColor}10`, borderRadius: '6px',
              border: `1px solid ${accentColor}20`,
            }}>
              <div style={{ fontSize: '0.6rem', color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Tasks Today</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', fontFamily: "'Space Grotesk', sans-serif", marginTop: '0.2rem' }}>47</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
