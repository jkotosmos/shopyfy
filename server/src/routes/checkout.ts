import type { Request, Response } from "express";
import { env } from "../env.js";
import { getStripe, isStripeConfigured } from "../stripeClient.js";
import type { Plan } from "../entitlement.js";

const VALID_PLANS: Plan[] = ["starter", "growth", "pro"];

// POST /api/checkout/create-session
// Creates a Stripe-hosted Checkout Session for the chosen plan and hands
// the frontend the URL to redirect to. This backend never sees or stores
// card details — Stripe Checkout collects payment on Stripe's own page,
// and the money settles directly into whoever owns the Stripe account
// configured via STRIPE_SECRET_KEY. A promo code is only ever generated
// after Stripe confirms the payment (see routes/stripeWebhook.ts) — this
// endpoint does not grant access by itself.
export async function createCheckoutSession(req: Request, res: Response) {
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: "Payments are not configured on this server yet." });
  }

  const plan = req.body?.plan as Plan | undefined;
  if (!plan || !VALID_PLANS.includes(plan)) {
    return res.status(400).json({ error: `plan must be one of: ${VALID_PLANS.join(", ")}` });
  }

  const priceId = env.stripePrices[plan];
  if (!priceId) {
    return res.status(503).json({ error: `No Stripe price configured for the "${plan}" plan (set STRIPE_PRICE_${plan.toUpperCase()}).` });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.appUrl}/redeem?checkout=success`,
    cancel_url: `${env.appUrl}/#pricing`,
    metadata: { plan },
  });

  if (!session.url) {
    return res.status(502).json({ error: "Stripe did not return a checkout URL." });
  }

  res.json({ url: session.url });
}
