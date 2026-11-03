// Plans and entitlements. The database (public.has_module) is the authority; this
// mirrors it for display only. Prices are preview copy pending Jake's final terms.

export type PlanCode = "website" | "seo" | "social";
export type Module = "listing" | "website" | "requests" | "seo" | "social";

export interface Plan {
  code: PlanCode;
  name: string;
  pricePence: number;
  priceLabel: string;
  modules: Module[];
  summary: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    code: "website",
    name: "Website",
    pricePence: 5000,
    priceLabel: "£50",
    modules: ["listing", "website", "requests"],
    summary: "Your directory listing and your own website, looked after for you.",
    features: [
      "Directory listing on AnyVendor",
      "Your website included, with hosting",
      "Unlimited update requests, including new features",
      "We aim to deliver each request within 24 hours",
    ],
  },
  {
    code: "seo",
    name: "Website + SEO",
    pricePence: 7500,
    priceLabel: "£75",
    modules: ["listing", "website", "requests", "seo"],
    summary: "Everything in Website, plus search engine optimisation.",
    features: ["Everything in Website", "SEO for your site", "Your Google search performance in your dashboard"],
  },
  {
    code: "social",
    name: "Website + SEO + Social",
    pricePence: 10000,
    priceLabel: "£100",
    modules: ["listing", "website", "requests", "seo", "social"],
    summary: "Everything in Website + SEO, plus a scheduler for your own social accounts.",
    features: ["Everything in Website + SEO", "Schedule your own Instagram and LinkedIn posts", "See how your posts perform"],
  },
];

export const SELLER = "The Bar People Limited";
export const PLAN_TERMS_NOTE = "All prices are per month and include VAT. AnyVendor is a trading name of The Bar People Limited, which bills your subscription.";

const RANK: Record<PlanCode, number> = { website: 1, seo: 2, social: 3 };
/** Stripe statuses that keep paid access. past_due keeps it while Stripe retries the card. */
export const ACCESS_STATUSES = ["active", "trialing", "past_due"];

export interface SubscriptionRow {
  plan: PlanCode | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
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

function ukDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
}

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
  const live = subs
    .filter((s) => s.plan && ACCESS_STATUSES.includes(s.status))
    .sort((a, b) => RANK[b.plan!] - RANK[a.plan!] || b.updated_at.localeCompare(a.updated_at));
  const best = live[0];
  if (best) {
    const plan = planByCode(best.plan)!;
    let notice: Access["notice"] = null;
    if (best.status === "past_due") notice = { tone: "warning", text: "Your last payment didn’t go through. Update your card to keep your plan." };
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

export function hasModule(access: Access, m: Module) {
  return access.modules.includes(m);
}
