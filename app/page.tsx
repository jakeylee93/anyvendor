'use client'

import { useState } from 'react'

const PRODUCTS = [
  { id: 1, name: 'Vintage Ceramic Vase', price: 12, category: 'Homeware' },
  { id: 2, name: 'Brass Candle Holder', price: 8, category: 'Decor' },
  { id: 3, name: 'Embroidered Linen Napkins', price: 15, category: 'Textiles' },
  { id: 4, name: 'Art Deco Photo Frame', price: 10, category: 'Decor' },
  { id: 5, name: 'Hand-thrown Pottery Bowl', price: 14, category: 'Homeware' },
  { id: 6, name: 'Vintage Glass Decanter', price: 11, category: 'Glassware' },
  { id: 7, name: 'Woven Storage Basket', price: 9, category: 'Storage' },
  { id: 8, name: 'Terracotta Plant Pot', price: 7, category: 'Garden' },
]

export default function Home() {
  const [email, setEmail] = useState('')

  return (
    <main className="min-h-screen bg-white">
      {/* Logo Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-black/5">
        <div className="flex items-center justify-center px-6 py-5">
          <a href="/" className="text-center">
            <h1 
              className="text-3xl md:text-4xl tracking-wide text-black"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, letterSpacing: '0.15em' }}
            >
              Bohemia
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/40 mt-1">Roman Road</p>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-32 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Image */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <p className="text-xs uppercase tracking-[0.4em] text-black/40 mb-4">Est. 2024</p>
                <h2 
                  className="text-4xl md:text-6xl lg:text-7xl text-black leading-[1.1] mb-6"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  Small Store.<br />
                  <span className="italic">Big Character.</span>
                </h2>
                <p className="text-base md:text-lg text-black/50 max-w-md mx-auto leading-relaxed">
                  Curated second-hand treasures on Roman Road. Every piece tells a story.
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between text-[10px] uppercase tracking-widest text-black/30">
              <span>Bow, London</span>
              <span>Curated Finds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="px-6 py-16 md:py-20 border-t border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-3">Latest Arrivals</p>
              <h3 
                className="text-2xl md:text-3xl text-black"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                This Week&apos;s Finds
              </h3>
            </div>
            <span className="text-sm text-black/40 pb-1">£5 — £15</span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                {/* Product Image Placeholder */}
                <div 
                  className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden relative"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-black/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-black/30">Photo coming</p>
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
                
                {/* Product Info */}
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-1.5">{product.category}</p>
                <h4 className="text-sm md:text-base text-black mb-1.5 group-hover:text-black/70 transition leading-snug">
                  {product.name}
                </h4>
                <p className="text-sm font-medium text-black/80">£{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-16 md:py-24 border-t border-black/5 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-4">Our Story</p>
          <h3 
            className="text-2xl md:text-3xl text-black mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Good Things Come in<br />Small Packages
          </h3>
          <p className="text-black/60 leading-relaxed mb-4">
            Bohemia might not be the biggest second-hand store in London, but we make good use of 
            what space we have — filling it with bargains of all kinds.
          </p>
          <p className="text-black/60 leading-relaxed">
            Every piece is hand-selected. Vintage ceramics, brassware, textiles, and curious finds 
            from estate sales and private collections. When it&apos;s gone, it&apos;s gone.
          </p>
        </div>
      </section>

      {/* Visit */}
      <section className="px-6 py-16 border-t border-black/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-4">Visit Us</p>
              <h3 
                className="text-2xl md:text-3xl text-black mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Roman Road,<br />Bow, London
              </h3>
              <div className="space-y-3 text-sm text-black/60">
                <p>Monday — Saturday: 10am — 6pm</p>
                <p>Sunday: 11am — 4pm</p>
                <p className="pt-2">Follow us for new arrivals</p>
              </div>
              <a 
                href="https://instagram.com/bohemiaromanroad" 
                target="_blank" 
                rel="noopener"
                className="inline-flex items-center gap-2 mt-6 text-sm text-black/60 hover:text-black transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @bohemiaromanroad
              </a>
            </div>
            <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center">
              <p className="text-[10px] uppercase tracking-widest text-black/30">Map coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-black/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 
              className="text-xl text-black mb-1"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '0.1em' }}
            >
              Bohemia
            </h4>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Roman Road, Bow</p>
          </div>
          <p className="text-xs text-black/30">
            © {new Date().getFullYear()} Bohemia. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
