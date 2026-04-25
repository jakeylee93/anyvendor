"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocationSearch from "@/components/LocationSearch";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Users,
  CheckCircle2,
  Loader2,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const eventTypes = [
  "Wedding", "Birthday Party", "Corporate Event", "Baby Shower",
  "Engagement Party", "Festival", "Exhibition", "Garden Party",
  "Christmas Party", "Charity Event", "Product Launch", "Gala",
  "Funeral", "Other",
];

const serviceNeeds = [
  "Mobile Bar", "Catering", "DJ / Music", "Live Band",
  "Photography", "Videography", "Venue", "Decor & Flowers",
  "Cakes", "Transport", "Photo Booth", "Equipment Hire",
  "Entertainment", "Event Planner", "Marquee / Tent",
];

export default function PlanMyEventPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    eventType: "",
    eventDate: "",
    location: "",
    guestCount: "",
    budget: "",
    services: [] as string[],
    details: "",
  });

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleService(svc: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter((s) => s !== svc)
        : [...prev.services, svc],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Save to localStorage for now
    const requests = JSON.parse(localStorage.getItem("anyvendor_event_requests") || "[]");
    requests.push({ ...form, createdAt: new Date().toISOString() });
    localStorage.setItem("anyvendor_event_requests", JSON.stringify(requests));
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-[#2ec4b6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-[#2ec4b6]" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Request Submitted!</h1>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            We&apos;ve received your event details. Our team will match you with the best vendors and get back to you shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/directory" className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2">
              Browse Vendors <ArrowRight size={14} />
            </Link>
            <Link href="/" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-6 py-3 rounded-full transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-[#e2b33e]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={24} className="text-[#e2b33e]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Plan My Event</h1>
          <p className="text-gray-500 text-sm mt-2">
            Tell us about your event and we&apos;ll match you with the perfect vendors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Your Name *</label>
              <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 text-xs font-semibold mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="07700 900 000" />
          </div>

          {/* Event details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Event Type *</label>
              <select required value={form.eventType} onChange={(e) => update("eventType", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none">
                <option value="">Select...</option>
                {eventTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Event Date</label>
              <input type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 text-xs font-semibold mb-1.5">Location</label>
            <LocationSearch value={form.location} onChange={(val) => update("location", val)} placeholder="Where is your event?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5 flex items-center gap-1"><Users size={12} /> Estimated Guests</label>
              <input type="number" min="1" value={form.guestCount} onChange={(e) => update("guestCount", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Budget Range</label>
              <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none">
                <option value="">Select...</option>
                <option value="under-1000">Under £1,000</option>
                <option value="1000-5000">£1,000 - £5,000</option>
                <option value="5000-10000">£5,000 - £10,000</option>
                <option value="10000-25000">£10,000 - £25,000</option>
                <option value="25000+">£25,000+</option>
              </select>
            </div>
          </div>

          {/* Services needed */}
          <div>
            <label className="block text-gray-600 text-xs font-semibold mb-2">What services do you need?</label>
            <div className="flex flex-wrap gap-2">
              {serviceNeeds.map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => toggleService(svc)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.services.includes(svc)
                      ? "bg-[#e2b33e]/10 border-[#e2b33e]/30 text-[#1a1a2e] font-semibold"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-600 text-xs font-semibold mb-1.5">Anything else we should know?</label>
            <textarea value={form.details} onChange={(e) => update("details", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none resize-none" placeholder="Tell us more about your event, any specific requirements..." />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit My Event Request"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
