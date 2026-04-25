import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  PartyPopper,
  Shield,
  Star,
  Zap,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Crown,
  Heart,
  BarChart3,
  Image,
  Globe,
  Phone,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-[#1a1a2e] py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            The simplest way to find and book{" "}
            <span className="text-[#e2b33e]">event suppliers</span>
          </h1>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
            AnyVendor connects event planners with trusted suppliers — no agencies, no commission, no nonsense.
          </p>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: Search,
              step: "01",
              title: "Search & Discover",
              desc: "Browse hundreds of verified event suppliers across every category — bars, caterers, DJs, photographers, venues, and more. Filter by location, event type, budget, and ratings to find exactly what you need.",
              details: ["Filter by category, location & price", "Read genuine reviews from real clients", "Compare multiple vendors side by side", "Save favourites for later"],
            },
            {
              icon: MessageSquare,
              step: "02",
              title: "Connect Directly",
              desc: "Found someone you like? Contact them directly through their profile. No middlemen, no agencies taking a cut. Get quotes, ask questions, and negotiate directly with the people who'll be at your event.",
              details: ["Direct contact — phone, email, website", "Request quotes with one click", "No commission on any bookings", "Chat directly with the supplier"],
            },
            {
              icon: PartyPopper,
              step: "03",
              title: "Book & Celebrate",
              desc: "Confirm your booking directly with the vendor. You deal with them, they deal with you. Simple. Their booking and cancellation policies are clearly displayed on every profile so there are no surprises.",
              details: ["Book directly with the vendor", "Clear policies on every profile", "Verified suppliers you can trust", "Focus on enjoying your event"],
            },
          ].map((item) => (
            <div key={item.step}>
              <div className="w-14 h-14 bg-[#1a1a2e] rounded-2xl flex items-center justify-center mb-5">
                <item.icon size={24} className="text-[#e2b33e]" />
              </div>
              <span className="text-[#e2b33e] text-xs font-bold">STEP {item.step}</span>
              <h3 className="text-gray-900 font-black text-xl mt-2">{item.title}</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">{item.desc}</p>
              <ul className="mt-4 space-y-2">
                {item.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-gray-600 text-sm">
                    <CheckCircle2 size={14} className="text-[#2ec4b6] mt-0.5 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* For Event Planners */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#e2b33e]/10 rounded-xl flex items-center justify-center">
              <Heart size={20} className="text-[#e2b33e]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">For Event Planners</h2>
              <p className="text-gray-500 text-sm">Everything you need to plan the perfect event</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Search, title: "Smart Search", desc: "Find suppliers by category, location, price range, and event type." },
              { icon: Star, title: "Genuine Reviews", desc: "Read real reviews from people who've actually booked these vendors." },
              { icon: Heart, title: "Save Favourites", desc: "Create an account and save vendors you love to compare later." },
              { icon: Shield, title: "Verified Vendors", desc: "Premium vendors are verified — you know you're dealing with professionals." },
              { icon: Zap, title: "Zero Fees", desc: "No booking fees, no commission. What you see is what you pay." },
              { icon: Users, title: "Plan My Event", desc: "Tell us what you need and we'll match you with the right suppliers." },
            ].map((item) => (
              <div key={item.title} className="bg-[#faf8f5] rounded-2xl p-5 border border-gray-100">
                <item.icon size={18} className="text-[#e2b33e] mb-3" />
                <h3 className="text-gray-900 font-bold text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/plan-my-event" className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-8 py-3.5 rounded-full transition-colors inline-flex items-center gap-2">
              Plan My Event <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* For Vendors — Free vs Premium */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1a1a2e]/5 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-[#1a1a2e]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">For Vendors & Suppliers</h2>
            <p className="text-gray-500 text-sm">Get your business in front of people ready to book</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">FREE</span>
            </div>
            <h3 className="text-xl font-black text-gray-900">Free Listing</h3>
            <p className="text-3xl font-black text-gray-900 mt-2">£0<span className="text-gray-400 text-sm font-normal">/month</span></p>
            <p className="text-gray-500 text-sm mt-3">Get listed and start getting found. Perfect for getting started.</p>

            <ul className="mt-6 space-y-3">
              {[
                "Basic profile page",
                "Listed in directory & search",
                "1 cover photo",
                "Business description",
                "Category listing",
                "Email contact button",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-600 text-sm">
                  <CheckCircle2 size={14} className="text-gray-400" /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-gray-400 text-xs mb-3">Not included:</p>
              <ul className="space-y-2">
                {[
                  "Premium badge",
                  "Photo gallery",
                  "Phone & website visible",
                  "Priority in search",
                  "Analytics dashboard",
                  "No competitor ads on profile",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-400 text-xs line-through">
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/list-your-business"
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm py-3 rounded-full transition-colors block text-center"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-[#1a1a2e] rounded-2xl border-2 border-[#e2b33e] p-6 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-[#e2b33e] text-[#1a1a2e] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Crown size={12} /> RECOMMENDED
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4 mt-2">
              <span className="bg-[#e2b33e]/20 text-[#e2b33e] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={10} fill="currentColor" /> PREMIUM
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Premium Listing</h3>
            <p className="text-3xl font-black text-white mt-2">£29<span className="text-gray-400 text-sm font-normal">/month</span></p>
            <p className="text-gray-400 text-sm mt-3">Stand out from the crowd. Get more enquiries, more bookings, more visibility.</p>

            <ul className="mt-6 space-y-3">
              {[
                { text: "Everything in Free", bold: false },
                { text: "Premium badge on profile & cards", bold: true },
                { text: "Photo gallery (up to 20 images)", bold: true },
                { text: "Phone & website visible to all", bold: true },
                { text: "Priority placement in search", bold: true },
                { text: "Analytics dashboard (views & enquiries)", bold: true },
                { text: "No competitor ads on your profile", bold: true },
                { text: "\"Get a Quote\" button", bold: true },
                { text: "Video embed on profile", bold: false },
                { text: "Social media links", bold: false },
              ].map((f) => (
                <li key={f.text} className={`flex items-center gap-2 text-sm ${f.bold ? "text-white" : "text-gray-400"}`}>
                  <CheckCircle2 size={14} className="text-[#e2b33e]" /> {f.text}
                </li>
              ))}
            </ul>

            <Link
              href="/list-your-business"
              className="mt-6 w-full bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm py-3 rounded-full transition-colors block text-center"
            >
              Start Premium — 14 Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Why AnyVendor?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Trusted Suppliers", desc: "Premium vendors are verified. We check they're legitimate, insured, and ready to deliver." },
              { icon: Zap, title: "Zero Commission", desc: "We never take a cut of your bookings. What the vendor quotes is what you pay. Simple." },
              { icon: Globe, title: "UK-Wide Coverage", desc: "From London to Edinburgh, Essex to Cornwall. Find suppliers wherever your event is." },
            ].map((item) => (
              <div key={item.title}>
                <div className="w-12 h-12 bg-[#1a1a2e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon size={20} className="text-[#e2b33e]" />
                </div>
                <h3 className="text-gray-900 font-bold text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a1a2e] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white">Ready to get started?</h2>
          <p className="text-gray-400 text-sm mt-3">Whether you're planning an event or running an event business, AnyVendor is for you.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/directory" className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-8 py-3.5 rounded-full transition-colors">
              Browse Vendors
            </Link>
            <Link href="/list-your-business" className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-3.5 rounded-full border border-white/20 transition-colors">
              List My Business
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
