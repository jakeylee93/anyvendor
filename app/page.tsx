'use client'

import { useState } from 'react'

const PRODUCTS = [
  { id: 1, name: 'Vintage Ceramic Vase', price: 12, image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=375&fit=crop' },
  { id: 2, name: 'Brass Candle Holder', price: 8, image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=300&h=375&fit=crop' },
  { id: 3, name: 'Embroidered Linen Napkins', price: 15, image: 'https://images.unsplash.com/photo-1605218427306-022ba6c5546c?w=300&h=375&fit=crop' },
  { id: 4, name: 'Art Deco Photo Frame', price: 10, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&h=375&fit=crop' },
  { id: 5, name: 'Hand-thrown Pottery Bowl', price: 14, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=375&fit=crop' },
  { id: 6, name: 'Vintage Glass Decanter', price: 11, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=375&fit=crop' },
  { id: 7, name: 'Woven Storage Basket', price: 9, image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=300&h=375&fit=crop' },
  { id: 8, name: 'Terracotta Plant Pot', price: 7, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&h=375&fit=crop' },
]

// Double for seamless scroll
const SCROLL_PRODUCTS = [...PRODUCTS, ...PRODUCTS]

export default function Home() {
  const [showSellModal, setShowSellModal] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      {/* Logo Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-black/5">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <a href="/" className="text-center">
            <h1 
              className="text-2xl md:text-3xl tracking-wide text-black"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, letterSpacing: '0.15em' }}
            >
              Bohemia
            </h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-black/40">Roman Road</p>
          </a>
          
          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <a 
              href="#collection" 
              className="text-sm text-black/60 hover:text-black transition hidden sm:block"
            >
              Collection
            </a>
            <a 
              href="#story" 
              className="text-sm text-black/60 hover:text-black transition hidden sm:block"
            >
              Our Story
            </a>
            <button 
              onClick={() => setShowSellModal(true)}
              className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-black/80 transition"
            >
              Sell Your Item
            </button>
          </div>
        </div>
      </nav>

      {/* Sell Modal */}
      {showSellModal && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowSellModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 
              className="text-2xl text-black mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sell Your Item
            </h3>
            <p className="text-black/60 mb-6 leading-relaxed">
              Have something special to sell? We&apos;re always looking for unique vintage pieces, 
              ceramics, textiles, and curious finds.
            </p>
            <div className="space-y-3">
              <a 
                href="mailto:hello@bohemia.co.uk?subject=Item for Sale"
                className="block w-full text-center bg-black text-white py-3 rounded-full hover:bg-black/80 transition"
              >
                Email Us Photos
              </a>
              <button 
                onClick={() => setShowSellModal(false)}
                className="block w-full text-center text-black/40 hover:text-black transition py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <p className="text-xs uppercase tracking-[0.4em] text-black/40 mb-4">Est. 2024</p>
                <h2 
                  className="text-3xl md:text-5xl lg:text-6xl text-black leading-[1.1] mb-6"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  Small Store.<br />
                  <span className="italic">Big Character.</span>
                </h2>
                <p className="text-sm md:text-base text-black/50 max-w-md mx-auto leading-relaxed">
                  Curated second-hand treasures on Roman Road. Every piece tells a story.
                </p>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between text-[10px] uppercase tracking-widest text-black/30">
              <span>Bow, London</span>
              <span>Curated Finds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Products */}
      <section id="collection" className="py-10 border-t border-black/5 overflow-hidden">
        <div className="px-6 mb-6">
          <div className="max-w-6xl mx-auto flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-2">Latest Arrivals</p>
              <h3 
                className="text-xl md:text-2xl text-black"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                This Week&apos;s Finds
              </h3>
            </div>
            <span className="text-sm text-black/40 pb-1">£5 — £15</span>
          </div>
        </div>

        {/* Scrolling Row - Smaller cards for 4-up on iPad */}
        <div className="relative">
          <div 
            className="flex gap-4 md:gap-5 animate-scroll hover:pause px-6"
            style={{
              width: 'max-content',
              animation: 'scroll 35s linear infinite',
            }}
          >
            {SCROLL_PRODUCTS.map((product, idx) => (
              <div 
                key={`${product.id}-${idx}`} 
                className="group cursor-pointer w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] flex-shrink-0"
              >
                <div 
                  className="aspect-[4/5] rounded-lg mb-3 overflow-hidden relative bg-gray-100"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
                
                <h4 className="text-xs md:text-sm text-black mb-0.5 group-hover:text-black/70 transition leading-snug truncate">
                  {product.name}
                </h4>
                <p className="text-xs font-medium text-black/80">£{product.price}</p>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* Instagram Feed - Full Width Scrolling */}
      <section className="py-12 md:py-16 border-t border-black/5 bg-gradient-to-b from-white to-gray-50/30 overflow-hidden">
        <div className="px-6 mb-8">
          <div className="max-w-6xl mx-auto flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-2">Follow Along</p>
              <h3 
                className="text-xl md:text-2xl text-black"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                @bohemiaromanroad
              </h3>
            </div>
            <a 
              href="https://instagram.com/bohemiaromanroad" 
              target="_blank" 
              rel="noopener"
              className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              View on Instagram
            </a>
          </div>
        </div>

        {/* Scrolling Instagram Grid */}
        <div className="relative">
          <div 
            className="flex gap-3 md:gap-4 insta-scroll hover:pause"
            style={{
              width: 'max-content',
              animation: 'instaScroll 50s linear infinite',
            }}
          >
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-3 md:gap-4">
                {[
                  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop',
                ].map((img, idx) => (
                  <a
                    key={`${setIdx}-${idx}`}
                    href="https://instagram.com/bohemiaromanroad"
                    target="_blank"
                    rel="noopener"
                    className="group relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] flex-shrink-0 overflow-hidden rounded-lg"
                  >
                    <img 
                      src={img}
                      alt={`Instagram ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes instaScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .insta-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* Our Story - Featured Section */}
      <section id="story" className="relative">
        {/* Full-width image background */}
        <div className="relative h-[60vh] min-h-[500px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop)',
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-6 text-center text-white">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-6">Our Story</p>
              <h3 
                className="text-3xl md:text-5xl mb-8 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Good Things Come in<br />
                <span className="italic">Small Packages</span>
              </h3>
              <div className="space-y-4 text-white/80 leading-relaxed text-sm md:text-base max-w-xl mx-auto">
                <p>
                  Bohemia might not be the biggest second-hand store in London, but we make 
                  good use of what space we have — filling it with bargains of all kinds.
                </p>
                <p>
                  Every piece is hand-selected from estate sales, private collections, and 
                  hidden corners of the city. Vintage ceramics, brassware, textiles, and 
                  curious finds that deserve a second life.
                </p>
                <p className="text-white/60 italic">
                  &ldquo;When it&apos;s gone, it&apos;s gone.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visit / Hours */}
      <section className="py-16 md:py-20 px-6 border-t border-black/5">
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
              <div className="space-y-2 text-sm text-black/60 mb-6">
                <p>Monday — Saturday: <span className="text-black">10am — 6pm</span></p>
                <p>Sunday: <span className="text-black">11am — 4pm</span></p>
              </div>
              <a 
                href="https://maps.google.com/?q=Roman+Road+Bow+London"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-sm text-black hover:text-black/60 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Get Directions
              </a>
            </div>
            <div 
              className="aspect-[4/3] rounded-2xl bg-cover bg-center"
              style={{ 
                backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Proper Footer */}
      <footer className="bg-black text-white">
        <div className="px-6 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            {/* Logo */}
            <div className="text-center mb-16">
              <h4 
                className="text-4xl md:text-5xl mb-3"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, letterSpacing: '0.15em' }}
              >
                Bohemia
              </h4>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Roman Road</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 md:gap-16 mb-20">
              {/* About */}
              <div className="text-center md:text-left">
                <h5 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5">About</h5>
                <p className="text-white/60 text-sm leading-relaxed">
                  Curated second-hand treasures on Roman Road, Bow. Small store, big character. 
                  Every piece tells a story.
                </p>
              </div>

              {/* Quick Links */}
              <div className="text-center">
                <h5 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5">Explore</h5>
                <ul className="space-y-3 text-sm">
                  <li><a href="#collection" className="text-white/70 hover:text-white transition">Collection</a></li>
                  <li><a href="#story" className="text-white/70 hover:text-white transition">Our Story</a></li>
                  <li><button onClick={() => setShowSellModal(true)} className="text-white/70 hover:text-white transition">Sell Your Item</button></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-center md:text-right">
                <h5 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5">Visit</h5>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>Roman Road, Bow</li>
                  <li>London</li>
                  <li className="pt-2">
                    <a href="https://instagram.com/bohemiaromanroad" target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-white transition">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      @bohemiaromanroad
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-10 border-t border-white/10 text-center">
              <p className="text-xs text-white/30">
                © {new Date().getFullYear()} Bohemia. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
