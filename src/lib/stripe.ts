import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith("sk_placeholder") || key === "sk_test_xxx") {
    return null;
  }
  return new Stripe(key);
}

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.startsWith("sk_placeholder") &&
      process.env.STRIPE_PRICE_ID &&
      !process.env.STRIPE_PRICE_ID.startsWith("price_placeholder")
  );
}
