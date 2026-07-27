import Stripe from "stripe";
import { env } from "./env.js";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey);
}

// Lazy singleton so a server without Stripe configured can still boot and
// serve the Shopify-only routes; only throws if something actually calls
// this without STRIPE_SECRET_KEY set.
export function getStripe(): Stripe {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set — payments routes are disabled until it is configured.");
  }
  if (!client) {
    client = new Stripe(env.stripeSecretKey);
  }
  return client;
}
