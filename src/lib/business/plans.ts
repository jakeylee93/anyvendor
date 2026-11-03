// Five-tier plans: the single source of truth for names, prices, modules and copy.
// The database (public.has_module) is the authority for access; this mirrors it.
// Monthly prices were confirmed by Jake on 3 Nov 2026. Annual prices are a PROPOSAL
// (two months free, pay for ten) and must not be sold until he approves them.

export type PlanCode = "listing" | "website" | "marketing" | "social" | "ai";
export type Module = "listing" | "website" | "requests" | "seo" | "social" | "agent";
export type Interval = "month" | "year";

export interface Plan {
  code: PlanCode;
  name: string;
  /** Monthly price in pence, inclusive of VAT. */
  monthlyPence: number;
  /** Proposed annual price in pence, inclusive of VAT (two months free). */
  annualPence: number;
  modules: Module[];
  summary: string;
  /** What this tier adds over the one below it. The first tier lists what it includes. */
  adds: string[];
  /** Honest limits shown under the features. */
  notes?: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    code: "listing",
    name: "Listing",
    monthlyPence: 2500,
    annualPence: 25000,
    modules: ["listing"],
    summary: "Your business profile in the AnyVendor directory, managed by you.",
    adds: ["Your directory profile and listing", "Enquiries from people planning events", "Edit your profile, photos and services in your dashboard"],
    notes: ["No website is included on this plan."],
  },
  {
    code: "website",
    name: "Website Plus",
    monthlyPence: 5000,
    annualPence: 50000,
    modules: ["listing", "website", "requests"],
    summary: "Everything in Listing, plus a bespoke website we design and host.",
    adds: ["Everything in Listing", "A professionally designed bespoke website", "Hosting included", "Unlimited website updates"],
    notes: ["Updates are unlimited requests. We aim to complete normal edits within 24 hours. Larger new features are scoped and scheduled with you first."],
    popular: true,
  },
  {
    code: "marketing",
    name: "Marketing Plus",
    monthlyPence: 10000,
    annualPence: 100000,
    modules: ["listing", "website", "requests", "seo"],
    summary: "Everything in Website Plus, plus search optimisation and clear reporting.",
    adds: ["Everything in Website Plus", "SEO workflows for your site: titles, descriptions, structured data and content checks", "Your Google Search Console performance in your dashboard"],
    notes: ["We optimise your site. Rankings depend on Google and are not guaranteed."],
  },
  {
    code: "social",
    name: "Social Media Plus",
    monthlyPence: 15000,
    annualPence: 150000,
    modules: ["listing", "website", "requests", "seo", "social"],
    summary: "Everything in Marketing Plus, plus scheduling and reporting for your own social accounts.",
    adds: ["Everything in Marketing Plus", "Schedule posts to your connected Instagram and LinkedIn accounts", "Post reporting in your dashboard"],
    notes: ["You write and approve what is posted. This is a scheduling tool, not a managed content agency."],
  },
  {
    code: "ai",
    name: "AI Plus",
    monthlyPence: 35000,
    annualPence: 350000,
    modules: ["listing", "website", "requests", "seo", "social", "agent"],
    summary: "Everything in Social Media Plus, plus your own assistant, hosted by us, that you talk to on WhatsApp.",
    adds: [
      "Everything in Social Media Plus",
      "Forward a quote enquiry on WhatsApp and it turns it into a structured enquiry and a draft quote for you to approve",
      "Once you approve, it sends the quote and follows up, and records everything in your dashboard",
      "It can act inside your own AnyVendor business only, with permissions you set and an audit trail of every action",
    ],
    notes: ["Included WhatsApp and AI usage and any overage charges will be published before this plan goes on sale. Anything that affects a customer or spends money needs your approval."],
  },
];

export const SELLER = "The Bar People Limited";
export const PLAN_TERMS_NOTE = "All prices include VAT. AnyVendor is a trading name of The Bar People Limited, which bills your subscription.";
export const ANNUAL_PROPOSAL_NOTE = "Annual pricing (two months free) is proposed and not yet on sale.";

export const RANK: Record<PlanCode, number> = { listing: 1, website: 2, marketing: 3, social: 4, ai: 5 };
export const PLAN_CODES = PLANS.map((p) => p.code);
export const isPlanCode = (v: unknown): v is PlanCode => typeof v === "string" && (PLAN_CODES as string[]).includes(v);
export const isInterval = (v: unknown): v is Interval => v === "month" || v === "year";

/** Stripe statuses that keep paid access. past_due keeps it while Stripe retries the card. */
export const ACCESS_STATUSES = ["active", "trialing", "past_due"];

export const gbp = (pence: number) => (pence % 100 === 0 ? `£${(pence / 100).toLocaleString("en-GB")}` : `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`);
export const priceLabel = (plan: Plan, interval: Interval = "month") => (interval === "year" ? `${gbp(plan.annualPence)} a year` : `${gbp(plan.monthlyPence)} a month`);
export const monthlyEquivalent = (plan: Plan) => gbp(Math.round(plan.annualPence / 12));

export interface SubscriptionRow {
  plan: PlanCode | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  updated_at: string;
}

export interface InternalPlan {
  plan: PlanCode;
  label: string;
  expires_at: string | null;
}

export interface Access {
  plan: PlanCode | null;
  status: string | null;
  /** Where the access comes from: a paid subscription, an internal test plan, or nothing. */
  source: "subscription" | "internal" | null;
  modules: Module[];
  notice: { tone: "info" | "warning" | "danger"; text: string } | null;
}

export function planByCode(code: PlanCode | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.code === code);
}

const ukDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });

export function accessFor(subs: SubscriptionRow[], internal: InternalPlan | null = null): Access {
  const paid = paidAccess(subs);
  const internalLive = internal && (!internal.expires_at || Date.parse(internal.expires_at) > Date.now()) ? internal : null;
  if (internalLive && (!paid.plan || RANK[internalLive.plan] > RANK[paid.plan])) {
    const plan = planByCode(internalLive.plan)!;
    const until = internalLive.expires_at ? ` until ${ukDate(internalLive.expires_at)}` : "";
    return { plan: plan.code, status: "internal", source: "internal", modules: plan.modules, notice: { tone: "info", text: `Internal test plan (${internalLive.label})${until}. This is not a paid subscription.` } };
  }
  return paid;
}

function paidAccess(subs: SubscriptionRow[]): Access {
  const live = subs.filter((s) => s.plan && ACCESS_STATUSES.includes(s.status)).sort((a, b) => RANK[b.plan!] - RANK[a.plan!]);
  const best = live[0];
  if (best) {
    const plan = planByCode(best.plan)!;
    let notice: Access["notice"] = null;
    if (best.status === "past_due") notice = { tone: "warning", text: "Your last payment didn’t go through. Please update your card to keep your plan." };
    else if (best.cancel_at_period_end && best.current_period_end) notice = { tone: "info", text: `Your plan ends on ${ukDate(best.current_period_end)}.` };
    return { plan: plan.code, status: best.status, source: "subscription", modules: plan.modules, notice };
  }
  const latest = [...subs].sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  if (latest && ["canceled", "unpaid", "incomplete_expired", "paused"].includes(latest.status)) {
    return { plan: null, status: latest.status, source: null, modules: [], notice: { tone: "danger", text: "Your plan has ended. Your history is safe; choose a plan to make new requests." } };
  }
  if (latest && latest.status === "incomplete") {
    return { plan: null, status: latest.status, source: null, modules: [], notice: { tone: "info", text: "We’re waiting for your first payment to confirm." } };
  }
  return { plan: null, status: null, source: null, modules: [], notice: null };
}
