"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LocationSearch from "@/components/LocationSearch";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  Upload,
  Lock,
  Tag,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Star,
  Zap,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";

const categoryOptions = [
  "Mobile Bar", "Caterer", "DJ Services", "Band", "Musician", "Singer",
  "Photographer", "Videographer", "Venue", "Entertainment", "Decor & Flowers",
  "Transport", "Cakes", "Candy Carts", "Equipment Hire", "Photo Booth",
  "Event Planner", "Florist", "Hair & Makeup", "Marquee & Tent Hire",
  "Other",
];

const eventTypeOptions = [
  "Weddings", "Corporate Events", "Birthday Parties", "Baby Showers",
  "Engagements", "Festivals", "Exhibitions", "Garden Parties",
  "House Parties", "Club Events", "Product Launches", "Galas",
  "Ceremonies", "Funerals", "Christmas Parties", "Charity Events",
];

export default function ListYourBusinessPage() {
  const router = useRouter();
  const { signup, user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Account fields
  const [password, setPassword] = useState("");

  // Form state
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    established: "",
    contactName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    description: "",
    priceFrom: "",
    priceUnit: "per event",
    imageUrl: "",
    eventTypes: [] as string[],
    bookingPolicy: "",
    cancellationPolicy: "",
  });

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleEventType(type: string) {
    setForm((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter((t) => t !== type)
        : [...prev.eventTypes, type],
    }));
  }

  async function handleSubmit() {
    setSaving(true);

    // Generate slug from business name
    const slug = form.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Create account for the vendor if not already logged in
    if (!user && form.email && password) {
      await signup({
        email: form.email,
        password,
        name: form.contactName || form.businessName,
        role: "vendor",
        vendorSlug: slug,
      });
    }

    // Save vendor to localStorage (will be Supabase later)
    const vendors = JSON.parse(localStorage.getItem("anyvendor_vendors") || "[]");
    vendors.push({
      slug,
      name: form.businessName,
      category: form.category,
      location: form.location,
      established: parseInt(form.established) || new Date().getFullYear(),
      price_from: parseFloat(form.priceFrom) || 0,
      price_unit: form.priceUnit,
      image_url: form.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
      rating: 0,
      review_count: 0,
      verified: false,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      website: form.website,
      description: form.description,
      eventTypes: form.eventTypes,
      bookingPolicy: form.bookingPolicy,
      cancellationPolicy: form.cancellationPolicy,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("anyvendor_vendors", JSON.stringify(vendors));

    await new Promise((r) => setTimeout(r, 1000)); // Simulate save
    setSaving(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-[#2ec4b6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-[#2ec4b6]" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">You&apos;re Listed!</h1>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            Your business profile has been created. You can view and edit it anytime from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => {
                const slug = form.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                router.push(`/vendor/${slug}`);
              }}
              className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-6 py-3 rounded-full transition-colors"
            >
              View My Profile
            </button>
            <button
              onClick={() => router.push("/directory")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm px-6 py-3 rounded-full transition-colors"
            >
              Browse Directory
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900">List Your Business</h1>
          <p className="text-gray-500 text-sm mt-2">
            Showcase your services and connect with people ready to book. It&apos;s free.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-gray-400 text-xs">
            <span className="flex items-center gap-1"><Shield size={12} className="text-[#2ec4b6]" /> Free listing</span>
            <span className="flex items-center gap-1"><Star size={12} className="text-[#e2b33e]" /> Get found</span>
            <span className="flex items-center gap-1"><Zap size={12} className="text-[#e2b33e]" /> Zero commission</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 max-w-xs mx-auto">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? "bg-[#e2b33e]" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Business Details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 size={18} className="text-[#e2b33e]" /> Business Details
            </h2>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Business Name *</label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none"
                placeholder="e.g. The Bar People"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Year Established</label>
                <input
                  type="number"
                  value={form.established}
                  onChange={(e) => update("established", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none"
                  placeholder="e.g. 2014"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Location *</label>
              <LocationSearch
                value={form.location}
                onChange={(val) => update("location", val)}
                placeholder="Start typing... e.g. Essex, London, UK Wide"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">About Your Business *</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none resize-none"
                placeholder="Tell people what you do, what makes you special..."
              />
            </div>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Cover Image</label>
              {form.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100">
                  <img src={form.imageUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update("imageUrl", "")}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#e2b33e]/50 hover:bg-[#e2b33e]/5 transition-colors">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-gray-500 text-xs font-medium">Click to upload a cover photo</span>
                  <span className="text-gray-400 text-[10px] mt-1">JPG, PNG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          update("imageUrl", ev.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <button
              onClick={() => {
                if (!form.businessName || !form.category || !form.location) {
                  alert("Please fill in business name, category, and location.");
                  return;
                }
                setStep(2);
              }}
              className="w-full bg-[#1a1a2e] hover:bg-[#16213e] text-white font-bold text-sm py-3.5 rounded-full transition-colors"
            >
              Next: Contact & Pricing
            </button>
          </div>
        )}

        {/* Step 2: Contact & Pricing */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1">
              <ChevronLeft size={14} /> Back
            </button>

            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Tag size={18} className="text-[#e2b33e]" /> Contact & Pricing
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Contact Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="Your name" />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="hello@business.com" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="07700 900 000" />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Website</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="https://yoursite.com" />
                </div>
              </div>
            </div>

            {/* Password for account creation */}
            {!user && (
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Create a Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none"
                    placeholder="Min 6 characters — this creates your account"
                  />
                </div>
                <p className="text-gray-400 text-[10px] mt-1">This will create your vendor account so you can manage your profile.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Price From</label>
                <input type="number" min="0" value={form.priceFrom} onChange={(e) => update("priceFrom", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none" placeholder="500" />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5">Price Unit</label>
                <select value={form.priceUnit} onChange={(e) => update("priceUnit", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none">
                  <option value="per event">Per Event</option>
                  <option value="per head">Per Head</option>
                  <option value="per hour">Per Hour</option>
                  <option value="per day">Per Day</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                if (!form.email) { alert("Please enter an email address."); return; }
                setStep(3);
              }}
              className="w-full bg-[#1a1a2e] hover:bg-[#16213e] text-white font-bold text-sm py-3.5 rounded-full transition-colors"
            >
              Next: Events & Policies
            </button>
          </div>
        )}

        {/* Step 3: Event Types & Policies */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1">
              <ChevronLeft size={14} /> Back
            </button>

            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-[#e2b33e]" /> Events & Policies
            </h2>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-2">Event Types You Cover</label>
              <div className="flex flex-wrap gap-2">
                {eventTypeOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleEventType(type)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.eventTypes.includes(type)
                        ? "bg-[#e2b33e]/10 border-[#e2b33e]/30 text-[#1a1a2e] font-semibold"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Booking Policy</label>
              <textarea
                value={form.bookingPolicy}
                onChange={(e) => update("bookingPolicy", e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none resize-none"
                placeholder="How do clients book your services? Deposit requirements, lead time, etc."
              />
            </div>

            <div>
              <label className="block text-gray-600 text-xs font-semibold mb-1.5">Cancellation Policy</label>
              <textarea
                value={form.cancellationPolicy}
                onChange={(e) => update("cancellationPolicy", e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e2b33e] focus:outline-none resize-none"
                placeholder="What happens if a client needs to cancel?"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm py-3.5 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Creating Profile...</> : "Create My Profile"}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
