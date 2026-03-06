export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F8FAFF] via-white to-[#F0F4FF] relative overflow-hidden">
      {/* Subtle background orbs */}
      <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none" />
      <div className="absolute top-[200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-purple-100/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[30%] w-[400px] h-[400px] rounded-full bg-blue-100/30 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-900">anyOS</span>
        </div>
        <a href="#waitlist" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
          Join Waitlist →
        </a>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-gray-200/60 text-sm text-gray-500 shadow-xs backdrop-blur-md mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Coming Soon
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight max-w-4xl leading-[1.05] text-gray-900">
          The last setup
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600">
            you&apos;ll ever need
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed">
          An operating system for life, work, and AI.
          <br className="hidden md:block" />
          One workspace. Infinite possibility.
        </p>

        <div id="waitlist" className="mt-12 flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-5 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition text-sm"
          />
          <button className="px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 transition-all text-sm whitespace-nowrap">
            Get Early Access
          </button>
        </div>
      </section>

      {/* Glass App Grid */}
      <section className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📸', name: 'Capture', desc: 'Voice, photos, thoughts — sorted by AI' },
              { icon: '📅', name: 'Calendar', desc: 'Time intelligence, not just dates' },
              { icon: '📋', name: 'Projects', desc: 'Teams, milestones, decisions' },
              { icon: '🤖', name: 'Agents', desc: 'Your digital workforce' },
              { icon: '🔨', name: 'Builder', desc: 'Websites & tools, instantly' },
              { icon: '📁', name: 'Docs', desc: 'Files, drives, everything' },
              { icon: '💰', name: 'Finance', desc: 'Invoices, costs, clarity' },
              { icon: '💊', name: 'Wellness', desc: 'Check-ins, mood, balance' },
            ].map((app) => (
              <div
                key={app.name}
                className="group p-5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-xs hover:shadow-md hover:bg-white/80 transition-all duration-300 cursor-default"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {app.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{app.name}</h3>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{app.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tagline strip */}
      <section className="relative z-10 px-6 py-20 text-center">
        <p className="text-2xl md:text-3xl font-semibold text-gray-900 max-w-2xl mx-auto leading-snug">
          We set it up. You take control.
          <br />
          <span className="text-gray-400">AI won&apos;t control you. You control it.</span>
        </p>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: '🖥️', title: 'Installed for you', desc: 'We come to you, set up your machine, and bring your personal AI online. No technical knowledge needed.' },
            { icon: '🔒', title: 'Your data, your device', desc: 'Everything runs on your own hardware. No cloud dependency. No one else sees your data. Ever.' },
            { icon: '✨', title: 'Modular by design', desc: 'Start with what you need. Add apps as you grow. Personal, business, or both — it adapts to you.' },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">anyOS</span>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} anyOS. All rights reserved.</p>
      </footer>
    </main>
  )
}
