import Stripe from "stripe";

export function stripeKey() {
  return process.env.STRIPE_SECRET_KEY ?? null;
}

export function stripeClient() {
  const key = stripeKey();
  return key ? new Stripe(key) : null;
}

export function billingReady() {
  return Boolean(stripeKey() && process.env.STRIPE_PRICE_WEBSITE && process.env.STRIPE_PRICE_SEO && process.env.STRIPE_PRICE_SOCIAL);
}
