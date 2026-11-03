import { Check } from "lucide-react";
import { ActionFeedback, Card, CardTitle, Notice, submitCls } from "@/components/business/ui";
import { loadAccess, requireBusiness } from "@/lib/business/data";
import { ANNUAL_PROPOSAL_NOTE, PLANS, PLAN_TERMS_NOTE, gbp, isInterval, isPlanCode, planByCode, priceLabel } from "@/lib/business/plans";
import { billingReady } from "@/lib/business/stripe";
import { signOut } from "../../actions";
import { openPortal, startCheckout } from "../../billing-actions";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AccountPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const chosen = isPlanCode(sp.plan) ? planByCode(sp.plan) : undefined;
  const interval = isInterval(sp.interval) ? sp.interval : "month";
  const ctx = await requireBusiness();
  const access = await loadAccess(ctx);
  const ready = billingReady();
  const isOwner = ctx.business.role === "owner";
  let members: { user_id: string; role: string }[] = [];
  let periodEnd: string | null = null;
  if (ctx.mode === "live") {
    const [{ data: m }, { data: s }] = await Promise.all([
      ctx.sb.from("memberships").select("user_id, role").eq("business_id", ctx.business.id),
      ctx.sb.from("subscriptions").select("current_period_end, status").eq("business_id", ctx.business.id).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    members = m ?? [];
    periodEnd = s?.current_period_end ?? null;
  }
  const current = planByCode(access.plan);

  return (
    <>
      <ActionFeedback sp={sp} />
      {sp.checkout === "returned" && (
        <Notice tone="info">Thanks. We’re waiting for Stripe to confirm the payment. Your plan switches on as soon as it does, usually within seconds; refresh this page.</Notice>
      )}
      {sp.checkout === "cancelled" && <Notice tone="info">Checkout was cancelled. You haven’t been charged.</Notice>}
      <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Plan and billing</h1>
      {!ready && ctx.mode === "live" && <Notice tone="warning">Billing isn’t connected in this preview. Plans are shown for review only and no one can be charged.</Notice>}

      <Card>
        <CardTitle>Your plan</CardTitle>
        <p className="mt-2 text-be-navy">
          {ctx.mode === "demo" ? "Demo (all features shown)" : access.source === "internal" ? `${current?.name} (internal test plan, not a paid subscription)` : current ? `${current.name}, ${priceLabel(current)} inc. VAT` : "No plan yet"}
          {access.status && ctx.mode === "live" && <span className="ml-2 rounded-full bg-be-mist px-2 py-0.5 text-xs text-be-grey">{access.status.replace("_", " ")}</span>}
        </p>
        {periodEnd && <p className="mt-1 text-sm text-be-grey">Current period ends {new Date(periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</p>}
        {ctx.mode === "live" && isOwner && current && access.source === "subscription" && (
          <form action={openPortal} className="mt-4">
            <button className={submitCls}>Manage billing</button>
            <p className="mt-2 text-xs text-be-grey">Change plan, update your card, see invoices or cancel in Stripe’s secure portal.</p>
          </form>
        )}
        {ctx.mode === "live" && !isOwner && <p className="mt-3 text-sm text-be-grey">Only the business owner can change the plan.</p>}
      </Card>

      {chosen && (
        <Notice tone={ready ? "info" : "warning"}>
          You chose <strong>{chosen.name}</strong>, {priceLabel(chosen, interval)} inc. VAT{interval === "year" ? " (annual pricing is proposed and not yet on sale)" : ""}.{" "}
          {ready ? "Confirm below to go to secure checkout." : "Payments aren’t connected in this preview yet, so nothing can be charged. Your choice is noted here."}
        </Notice>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = access.plan === p.code;
          const isChosen = chosen?.code === p.code;
          return (
            <Card key={p.code} className={isCurrent || isChosen ? "ring-2 ring-be-cyan" : ""}>
              <p className="text-sm font-semibold text-be-grey">{p.name}{p.popular ? " · most popular" : ""}</p>
              <p className="mt-1 text-3xl font-bold text-be-navy">{interval === "year" ? gbp(p.annualPence) : gbp(p.monthlyPence)}<span className="text-base font-medium text-be-grey"> {interval === "year" ? "a year" : "a month"} inc. VAT</span></p>
              <p className="mt-2 text-sm text-be-grey">{p.summary}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-be-navy">
                {p.adds.map((f) => (
                  <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-be-cyan" aria-hidden />{f}</li>
                ))}
              </ul>
              {p.notes?.map((n) => <p key={n} className="mt-2 text-xs text-be-grey">{n}</p>)}
              {ctx.mode === "live" && isOwner && access.source !== "subscription" && (
                <form action={startCheckout} className="mt-4">
                  <input type="hidden" name="plan" value={p.code} />
                  <input type="hidden" name="interval" value={interval} />
                  <button className={`${submitCls} w-full`} disabled={!ready} title={ready ? undefined : "Billing isn’t connected in this preview"}>{isChosen ? `Confirm ${p.name}` : `Choose ${p.name}`}</button>
                </form>
              )}
              {isCurrent && <p className="mt-4 text-sm font-semibold text-be-navy">Your current plan</p>}
            </Card>
          );
        })}
      </div>
      {interval === "year" && <p className="text-xs text-be-grey">{ANNUAL_PROPOSAL_NOTE}</p>}
      <p className="text-xs text-be-grey">{PLAN_TERMS_NOTE} Website updates are unlimited requests; larger new features are scoped with you before work starts.</p>

      <Card>
        <CardTitle>Business</CardTitle>
        <dl className="mt-2 grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
          <dt className="text-be-grey">Name</dt><dd className="text-be-navy">{ctx.business.name}</dd>
          <dt className="text-be-grey">Web address</dt><dd className="text-be-navy">/site/{ctx.business.slug}</dd>
          <dt className="text-be-grey">Your role</dt><dd className="capitalize text-be-navy">{ctx.business.role}</dd>
          {ctx.mode === "live" && <><dt className="text-be-grey">Team</dt><dd className="text-be-navy">{members.length} member{members.length === 1 ? "" : "s"}</dd></>}
        </dl>
      </Card>

      {ctx.mode === "live" && (
        <form action={signOut}>
          <button className="text-sm font-semibold text-be-navy underline">Sign out{ctx.email ? ` (${ctx.email})` : ""}</button>
        </form>
      )}
    </>
  );
}
