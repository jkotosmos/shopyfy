import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { env } from "../env.js";
import { getStripe, isStripeConfigured } from "../stripeClient.js";
import { savePromoCode, findByStripeSession } from "../promoStore.js";
import { sendPromoCodeEmail } from "../mailer.js";
import type Stripe from "stripe";

function generatePromoCode(): string {
  // Not cryptographically required to be unguessable long-term (it's a
  // single-use-in-practice activation code, not a password), but random
  // enough that codes aren't enumerable.
  return `SHOPYFY-${randomBytes(5).toString("hex").toUpperCase()}`;
}

// POST /api/webhooks/stripe
// Register this exact URL in the Stripe Dashboard (or `stripe listen
// --forward-to <HOST>/api/webhooks/stripe` for local testing). Must
// receive the RAW request body — see the express.raw() wiring in
// index.ts — because Stripe's signature is computed over the exact bytes
// sent, not a re-serialized JSON object.
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!isStripeConfigured() || !env.stripeWebhookSecret) {
    return res.status(503).send("Webhook not configured.");
  }

  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(req.body as Buffer, signature as string, env.stripeWebhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return res.status(400).send("Invalid signature.");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const plan = session.metadata?.plan as "starter" | "growth" | "pro" | undefined;
    const email = session.customer_details?.email;

    if (!plan || !email) {
      console.error(`checkout.session.completed for ${session.id} missing plan or email — cannot issue a promo code.`);
      return res.status(200).send("ok"); // ack so Stripe doesn't retry a payment we can't act on differently
    }

    // Stripe can redeliver the same event — don't issue two codes for one payment.
    const existing = await findByStripeSession(session.id);
    if (!existing) {
      const code = generatePromoCode();
      await savePromoCode({ code, plan, email, stripeSessionId: session.id, createdAt: new Date().toISOString() });
      await sendPromoCodeEmail(email, code, plan);
    }
  }

  res.status(200).send("ok");
}
