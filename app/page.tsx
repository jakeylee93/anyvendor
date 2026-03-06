export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎪</span>
          <span className="text-xl font-bold tracking-tight">AnyVendor</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#about" className="hover:text-white transition">About</a>
          <a href="#services" className="hover:text-white transition">Services</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8">
          <span>🎪</span> Events Industry, Connected
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
          The platform that brings the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            events industry
          </span>{' '}
          together
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl">
          Connect with suppliers, find opportunities, and grow your events business — 
          without the commission-heavy agencies.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="#contact"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition"
          >
            Get Early Access
          </a>
          <a
            href="#about"
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 transition"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-20 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: '🤝', title: 'Fair & Direct', desc: 'Connect directly with suppliers and clients. No middleman fees eating into your margins.' },
            { icon: '⚡', title: 'Fast & Simple', desc: 'Find what you need in seconds. Post opportunities, get matched, done.' },
            { icon: '🌍', title: 'Industry-Wide', desc: 'Bars, catering, AV, staffing, décor — every corner of the events world in one place.' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-6 py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Built for the events industry</h2>
          <p className="mt-4 text-gray-400">
            Whether you&apos;re a supplier looking for gigs or a client planning an event, 
            AnyVendor makes the connection simple.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 gap-6 text-left">
            {[
              { title: 'Supplier Directory', desc: 'Browse verified suppliers across every category.' },
              { title: 'Opportunity Board', desc: 'Post events and get matched with the right people.' },
              { title: 'Digital Services', desc: 'Websites, branding, and digital tools for your business.' },
              { title: 'No Commission', desc: 'Connect directly. Keep 100% of what you earn.' },
            ].map((s) => (
              <div key={s.title} className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                <h4 className="font-semibold">{s.title}</h4>
                <p className="mt-1 text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 py-20 border-t border-white/10">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Get in touch</h2>
          <p className="mt-3 text-gray-400">Interested in joining AnyVendor? Drop us a line.</p>
          <div className="mt-8 flex flex-col gap-4">
            <a
              href="mailto:jake@anyvendor.co.uk"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition inline-block"
            >
              jake@anyvendor.co.uk
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AnyVendor. All rights reserved.
      </footer>
    </main>
  )
}
