'use client'

import { useState } from 'react'

const PRODUCTS = [
  { id: 1, name: 'Vintage Brass Lamp', price: '£85', category: 'Lighting', image: '/product-1.jpg' },
  { id: 2, name: 'Handwoven Turkish Rug', price: '£240', category: 'Textiles', image: '/product-2.jpg' },
  { id: 3, name: 'Ceramic Vase Set', price: '£45', category: 'Homeware', image: '/product-3.jpg' },
  { id: 4, name: 'Art Deco Mirror', price: '£120', category: 'Mirrors', image: '/product-4.jpg' },
  { id: 5, name: 'Linen Throw', price: '£65', category: 'Textiles', image: '/product-5.jpg' },
  { id: 6, name: 'Brass Candlesticks', price: '£35', category: 'Decor', image: '/product-6.jpg' },
]

export default function Home() {
  const [email, setEmail] = useState('')

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <h1 
          className="text-2xl md:text-3xl text-black"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: '0.1em' }}
        >
          Bohemia
        </h1>
        <div className="flex items-center gap-6 text-sm text-black/60">
          <a href="#collection" className="hover:text-black transition">Collection</a>
          <a href="#about" className="hover:text-black transition">About</a>
          <a href="#contact" className="hover:text-black transition">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-4xl">
          <p 
            className="text-sm uppercase tracking-[0.2em] text-black/40 mb-6"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            Curated Finds
          </p>
          <h2 
            className="text-4xl md:text-6xl lg:text-7xl text-black leading-[1.1] mb-8"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
          >
            Beautiful things,<br />
            <span className="italic">discovered</span>
          </h2>
          <p className="text-lg text-black/60 max-w-lg leading-relaxed">
            A collection of unique pieces sourced from artisans, vintage markets, and unexpected places. 
            Each item tells a story.
          </p>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="px-6 md:px-12 py-16 border-t border-black/5">
        <div className="flex items-center justify-between mb-12">
          <h3 
            className="text-2xl text-black"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Latest Arrivals
          </h3>
          <span className="text-sm text-black/40">{PRODUCTS.length} items</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div 
                className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-black/40 uppercase tracking-wider mb-1">{product.category}</p>
              <h4 className="text-base text-black mb-1 group-hover:text-black/70 transition">{product.name}</h4>
              <p className="text-sm text-black/60">{product.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 md:px-12 py-16 border-t border-black/5">
        <div className="max-w-2xl">
          <h3 
            className="text-2xl text-black mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            About Bohemia
          </h3>
          <p className="text-black/60 leading-relaxed mb-4">
            Every piece in our collection has been hand-selected. We work directly with artisans 
            and scour vintage markets to find items that bring character and warmth to your space.
          </p>
          <p className="text-black/60 leading-relaxed">
            New arrivals weekly. Each item is one-of-a-kind — when it&apos;s gone, it&apos;s gone.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 md:px-12 py-16 border-t border-black/5">
        <div className="max-w-md mx-auto text-center">
          <h3 
            className="text-xl text-black mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            New Arrivals
          </h3>
          <p className="text-sm text-black/50 mb-6">
            Be the first to know when we add new pieces to the collection.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-gray-50 border border-black/10 rounded-lg text-sm focus:outline-none focus:border-black/30 transition"
            />
            <button className="px-6 py-3 bg-black text-white text-sm rounded-lg hover:bg-black/80 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="px-6 md:px-12 py-12 border-t border-black/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-black/40">
            Bohemia — Curated Finds
          </p>
          <div className="flex items-center gap-6 text-sm text-black/40">
            <a href="mailto:hello@bohemia.shop" className="hover:text-black transition">hello@bohemia.shop</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
