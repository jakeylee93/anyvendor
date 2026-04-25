"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Building2, FileText, HelpCircle, Sparkles } from "lucide-react";
import { allVendors } from "@/data/vendors";

// FAQ knowledge base
const faqs = [
  { q: "what happens if a supplier cancels", a: "Each vendor has their own cancellation policy displayed on their profile page. We recommend checking this before booking. If a vendor cancels on you, contact us and we'll help you find a replacement.", tags: ["cancel", "cancellation", "refund", "supplier cancels"] },
  { q: "how does payment work", a: "You pay vendors directly — AnyVendor never handles your money. Most vendors require a deposit to secure your date, with the balance due before or on the event day. Check each vendor's booking policy for specifics.", tags: ["payment", "pay", "deposit", "money", "cost"] },
  { q: "are vendors verified", a: "Premium vendors go through a verification process. We check they're a legitimate business with proper insurance and licenses. Free-tier vendors are listed but not verified — always ask for proof of insurance.", tags: ["verified", "trust", "safe", "legitimate", "insurance"] },
  { q: "how much does it cost to list", a: "Listing your business is completely free. Our Free tier gets you a basic profile in the directory. Premium listings are £29/month and include a gold badge, photo gallery, priority search placement, analytics, and more.", tags: ["cost", "price", "free", "premium", "list", "listing", "how much"] },
  { q: "what is premium", a: "Premium is our paid vendor tier at £29/month. You get a gold Premium badge, photo gallery (up to 20 images), phone & website visible to all, priority search placement, analytics dashboard, no competitor ads on your profile, and a 'Get a Quote' button.", tags: ["premium", "upgrade", "paid", "badge", "features"] },
  { q: "how do i contact a vendor", a: "Click on any vendor's profile and you'll see their contact details. Premium vendors show phone, email, and website. Free vendors show email only. You can also use the 'Get a Quote' button on premium profiles.", tags: ["contact", "phone", "email", "message", "reach", "talk"] },
  { q: "can i get a refund", a: "Refund policies vary by vendor. Each profile displays their cancellation and refund terms clearly. Generally, cancellations 30+ days before the event get a full refund. Check the specific vendor's policy.", tags: ["refund", "money back", "cancel", "return"] },
  { q: "how do i leave a review", a: "After your event, you can leave a review on the vendor's profile page. You'll need to be logged in with an account. Reviews help other event planners make informed decisions.", tags: ["review", "feedback", "rating", "stars"] },
  { q: "what areas do you cover", a: "AnyVendor covers the entire UK — from London to Edinburgh, Essex to Cornwall. Use the location filter in our directory to find suppliers near your event venue.", tags: ["area", "location", "cover", "uk", "london", "nationwide", "where"] },
  { q: "how do i plan my event", a: "Use our 'Plan My Event' feature — tell us your event type, date, location, guest count, budget, and what services you need. We'll match you with suitable vendors. You can also browse the directory and save favourites.", tags: ["plan", "event", "help", "organise", "organize"] },
  { q: "do you take commission", a: "No. AnyVendor never takes commission on bookings. What the vendor quotes is what you pay. We make money from vendor subscriptions (Premium listings) and digital services, not from your event budget.", tags: ["commission", "fee", "cut", "percentage", "charge"] },
];

// Pages on the site
const pages = [
  { title: "Event Directory", desc: "Browse all vendors", href: "/directory", tags: ["directory", "browse", "vendors", "suppliers", "find"] },
  { title: "List My Business", desc: "Create your vendor profile", href: "/list-your-business", tags: ["list", "business", "register", "sign up", "create", "vendor"] },
  { title: "Plan My Event", desc: "Get matched with vendors", href: "/plan-my-event", tags: ["plan", "event", "match", "help"] },
  { title: "How It Works", desc: "Learn about AnyVendor", href: "/how-it-works", tags: ["how", "works", "about", "learn"] },
  { title: "Services", desc: "Digital services for vendors", href: "/services", tags: ["services", "website", "social", "seo", "branding"] },
  { title: "Sign Up", desc: "Create an account", href: "/signup", tags: ["sign up", "register", "account", "create"] },
  { title: "Sign In", desc: "Log into your account", href: "/login", tags: ["login", "sign in", "account"] },
  { title: "My Favourites", desc: "Your saved vendors", href: "/favourites", tags: ["favourites", "favorites", "saved", "heart"] },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Parent needs to handle opening
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search vendors
  const vendorResults = q.length >= 2
    ? allVendors.filter((v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  // Search pages
  const pageResults = q.length >= 2
    ? pages.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
      ).slice(0, 3)
    : [];

  // Search FAQ
  const faqResults = q.length >= 3
    ? faqs.filter((f) =>
        f.q.includes(q) ||
        f.tags.some((t) => q.includes(t) || t.includes(q))
      ).slice(0, 2)
    : [];

  const hasResults = vendorResults.length > 0 || pageResults.length > 0 || faqResults.length > 0;

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative max-w-2xl mx-auto mt-[10vh] px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vendors, pages, or ask a question..."
              className="flex-1 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {q.length < 2 ? (
              /* Quick links when empty */
              <div className="p-4">
                <p className="text-gray-400 text-xs font-semibold mb-3">QUICK LINKS</p>
                <div className="space-y-1">
                  {pages.slice(0, 5).map((p) => (
                    <button
                      key={p.href}
                      onClick={() => navigate(p.href)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 transition-colors group"
                    >
                      <FileText size={14} className="text-gray-400 group-hover:text-[#e2b33e] transition-colors" />
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{p.title}</p>
                        <p className="text-gray-400 text-xs">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : !hasResults ? (
              <div className="p-8 text-center">
                <Search size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Vendors */}
                {vendorResults.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <Building2 size={12} /> VENDORS
                    </p>
                    <div className="space-y-1">
                      {vendorResults.map((v) => (
                        <button
                          key={v.slug}
                          onClick={() => navigate(`/vendor/${v.slug}`)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-medium truncate group-hover:text-[#e2b33e] transition-colors">{v.name}</p>
                            <p className="text-gray-400 text-xs">{v.category} · {v.location}</p>
                          </div>
                          <ArrowRight size={14} className="text-gray-300 group-hover:text-[#e2b33e] transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pages */}
                {pageResults.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <FileText size={12} /> PAGES
                    </p>
                    <div className="space-y-1">
                      {pageResults.map((p) => (
                        <button
                          key={p.href}
                          onClick={() => navigate(p.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 transition-colors group"
                        >
                          <FileText size={14} className="text-gray-400 group-hover:text-[#e2b33e] transition-colors flex-shrink-0" />
                          <div>
                            <p className="text-gray-900 text-sm font-medium">{p.title}</p>
                            <p className="text-gray-400 text-xs">{p.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ answers */}
                {faqResults.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <HelpCircle size={12} /> ANSWERS
                    </p>
                    <div className="space-y-2">
                      {faqResults.map((f, idx) => (
                        <div key={idx} className="bg-[#faf8f5] rounded-xl p-4 border border-gray-100">
                          <p className="text-gray-900 text-sm font-medium mb-1.5 flex items-start gap-2">
                            <Sparkles size={14} className="text-[#e2b33e] flex-shrink-0 mt-0.5" />
                            {f.q.charAt(0).toUpperCase() + f.q.slice(1)}?
                          </p>
                          <p className="text-gray-600 text-xs leading-relaxed pl-[22px]">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-gray-400 text-[10px]">
              <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd> to close
            </p>
            <p className="text-gray-400 text-[10px] flex items-center gap-1">
              <Sparkles size={10} className="text-[#e2b33e]" /> AI answers coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
