"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedIcon from "@/components/AnimatedIcon";
import Link from "next/link";
import {
  Globe,
  Share2,
  Search,
  Palette,
  Mail,
  Camera,
  Smartphone,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Crown,
  Package,
} from "lucide-react";

const services = [
  {
    slug: "website-design",
    icon: Globe,
    name: "Website Design & Build",
    tagline: "Your business deserves more than a Facebook page",
    price: "From £499",
    priceNote: "one-off + £29/mo hosting",
    description: "A stunning, mobile-responsive website designed to showcase your services and convert visitors into bookings. We handle everything from design to launch.",
    features: [
      "Custom design tailored to your brand",
      "Mobile-responsive (looks great on any device)",
      "SEO-optimised so clients can find you on Google",
      "Booking enquiry form built in",
      "Photo gallery & testimonials",
      "Free SSL certificate & hosting",
      "Content management — update it yourself",
    ],
    popular: true,
  },
  {
    slug: "social-media",
    icon: Share2,
    name: "Social Media Management",
    tagline: "Stay visible. Stay booked.",
    price: "From £199",
    priceNote: "/month",
    description: "Professional social media management to grow your audience and keep your brand in front of potential clients. We create content, schedule posts, and manage your community.",
    features: [
      "12 posts per month (designed + written)",
      "Instagram, Facebook & LinkedIn",
      "Content calendar & strategy",
      "Story creation & reels",
      "Community management & replies",
      "Monthly analytics report",
      "Hashtag research & optimisation",
    ],
    popular: true,
  },
  {
    slug: "seo",
    icon: Search,
    name: "SEO & Google Ranking",
    tagline: "Get found when people search for what you do",
    price: "From £149",
    priceNote: "/month",
    description: "Climb the Google rankings and get found by people actively searching for event suppliers in your area. Technical SEO, content strategy, and local optimisation.",
    features: [
      "Technical website audit & fixes",
      "Google Business Profile optimisation",
      "Local SEO (rank in your area)",
      "Monthly keyword research",
      "Content recommendations",
      "Backlink strategy",
      "Monthly ranking report",
    ],
    popular: false,
  },
  {
    slug: "branding",
    icon: Palette,
    name: "Branding & Design",
    tagline: "Look professional from the first impression",
    price: "From £349",
    priceNote: "one-off",
    description: "A complete brand identity package — logo, colours, fonts, and brand guidelines that make your business look as good as your service.",
    features: [
      "Logo design (3 concepts, unlimited revisions)",
      "Colour palette & typography",
      "Brand guidelines document",
      "Social media templates",
      "Business card design",
      "Email signature",
      "Letterhead & invoice template",
    ],
    popular: false,
  },
  {
    slug: "email-marketing",
    icon: Mail,
    name: "Email Marketing",
    tagline: "Turn past clients into repeat bookings",
    price: "From £99",
    priceNote: "/month",
    description: "Stay in touch with past clients and nurture new leads. We design, write, and send email campaigns that bring people back.",
    features: [
      "Monthly newsletter design & send",
      "Email list management",
      "Automated welcome sequences",
      "Seasonal campaign creation",
      "A/B testing & optimisation",
      "Open rate & click tracking",
      "Unsubscribe management",
    ],
    popular: false,
  },
  {
    slug: "photography",
    icon: Camera,
    name: "Professional Photography",
    tagline: "Show off your work with photos that sell",
    price: "From £249",
    priceNote: "per shoot",
    description: "Professional event and product photography to make your profile and marketing materials look incredible. One shoot, endless content.",
    features: [
      "2-hour on-location shoot",
      "30+ edited high-res images",
      "Social media optimised crops",
      "Website hero images",
      "Quick turnaround (5 working days)",
      "Full commercial usage rights",
      "Optional video clips add-on",
    ],
    popular: false,
  },
];

const bundles = [
  {
    name: "Starter",
    desc: "Website + Hosting",
    price: "£499 + £29/mo",
    services: ["website-design"],
    savings: null,
  },
  {
    name: "Growth",
    desc: "Website + Social + SEO",
    price: "£499 + £299/mo",
    services: ["website-design", "social-media", "seo"],
    savings: "Save £49/mo",
  },
  {
    name: "Full Service",
    desc: "Website + Social + SEO + Branding + Email",
    price: "£799 + £399/mo",
    services: ["website-design", "social-media", "seo", "branding", "email-marketing"],
    savings: "Save £147/mo",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-[#1a1a2e] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedIcon animation="fade-up">
            <span className="text-[#e2b33e] text-xs font-bold tracking-wider">FOR VENDORS & SUPPLIERS</span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mt-3">
              Grow your business with{" "}
              <span className="text-[#e2b33e]">digital services</span>
            </h1>
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
              Websites, social media, SEO, branding — everything you need to get more bookings. Built by the team behind AnyVendor.
            </p>
          </AnimatedIcon>
        </div>
      </section>

      {/* Bundles */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {bundles.map((bundle, idx) => (
            <AnimatedIcon key={bundle.name} animation="fade-up" delay={idx * 100}>
              <div className={`bg-white rounded-2xl border p-5 text-center ${
                bundle.savings ? "border-[#e2b33e] shadow-lg" : "border-gray-200"
              }`}>
                {bundle.savings && (
                  <span className="bg-[#e2b33e] text-[#1a1a2e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {bundle.savings}
                  </span>
                )}
                <h3 className="text-gray-900 font-black text-lg mt-2">{bundle.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{bundle.desc}</p>
                <p className="text-[#1a1a2e] font-black text-xl mt-3">{bundle.price}</p>
                <Link
                  href="/contact"
                  className={`mt-4 w-full font-bold text-xs py-2.5 rounded-full transition-colors block ${
                    bundle.savings
                      ? "bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e]"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </AnimatedIcon>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <AnimatedIcon animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-gray-900">Our Services</h2>
            <p className="text-gray-500 text-sm mt-2">Everything your event business needs to thrive online</p>
          </div>
        </AnimatedIcon>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, idx) => (
            <AnimatedIcon key={svc.slug} animation="scale-bounce" delay={idx * 80}>
              <div className={`bg-white rounded-2xl border p-6 h-full flex flex-col ${
                svc.popular ? "border-[#e2b33e]/30 ring-1 ring-[#e2b33e]/10" : "border-gray-100"
              }`}>
                {svc.popular && (
                  <span className="bg-[#e2b33e]/10 text-[#e2b33e] text-[10px] font-bold px-2 py-0.5 rounded-full self-start flex items-center gap-1 mb-3">
                    <Star size={10} fill="currentColor" /> Popular
                  </span>
                )}
                <div className="w-11 h-11 bg-[#1a1a2e] rounded-xl flex items-center justify-center mb-4">
                  <svc.icon size={20} className="text-[#e2b33e]" />
                </div>
                <h3 className="text-gray-900 font-bold text-base">{svc.name}</h3>
                <p className="text-gray-400 text-xs mt-1 italic">{svc.tagline}</p>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed flex-1">{svc.description}</p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[#1a1a2e] font-black text-lg">{svc.price}<span className="text-gray-400 text-xs font-normal ml-1">{svc.priceNote}</span></p>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {svc.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-gray-500 text-xs">
                      <CheckCircle2 size={12} className="text-[#2ec4b6] mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                  {svc.features.length > 4 && (
                    <li className="text-gray-400 text-[10px]">+ {svc.features.length - 4} more</li>
                  )}
                </ul>

                <Link
                  href="/contact"
                  className="mt-4 w-full bg-[#1a1a2e] hover:bg-[#16213e] text-white font-bold text-xs py-2.5 rounded-full transition-colors block text-center"
                >
                  Learn More
                </Link>
              </div>
            </AnimatedIcon>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-[#1a1a2e] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AnimatedIcon animation="fade-up">
            <h2 className="text-2xl font-black text-white mb-8">Why Choose Our Services?</h2>
          </AnimatedIcon>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Built for Events", desc: "We understand the events industry. Every service is tailored for suppliers like you." },
              { icon: Zap, title: "Quick Turnaround", desc: "No 6-month website projects. We move fast and get you live within weeks." },
              { icon: Crown, title: "AnyVendor Integration", desc: "Your website and services integrate seamlessly with your AnyVendor profile." },
            ].map((item, idx) => (
              <AnimatedIcon key={item.title} animation="rotate-in" delay={idx * 150}>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon size={20} className="text-[#e2b33e]" />
                </div>
                <h3 className="text-white font-bold text-sm">{item.title}</h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">{item.desc}</p>
              </AnimatedIcon>
            ))}
          </div>

          <AnimatedIcon animation="fade-up" delay={300}>
            <div className="mt-10">
              <Link href="/contact" className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-8 py-3.5 rounded-full transition-colors inline-flex items-center gap-2">
                Get a Free Consultation <ArrowRight size={14} />
              </Link>
            </div>
          </AnimatedIcon>
        </div>
      </section>

      <Footer />
    </>
  );
}
