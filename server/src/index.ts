import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./env.js";
import { startInstall, completeInstall } from "./shopifyAuth.js";
import { publishStore } from "./routes/publishStore.js";
import { createCheckoutSession } from "./routes/checkout.js";
import { handleStripeWebhook } from "./routes/stripeWebhook.js";
import { redeemPromoCode } from "./routes/redeem.js";
import { asyncHandler } from "./asyncHandler.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.appUrl }));

// Stripe verifies its webhook signature over the exact raw request bytes,
// so this route must NOT go through the JSON body-parser — it needs to be
// registered (with express.raw()) before the global express.json() below.
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), asyncHandler(handleStripeWebhook));

app.use(express.json({ limit: "256kb" }));

// This backend doesn't run behind a shared load balancer that would spread
// abusive traffic across instances, so a simple in-memory limiter is enough
// here — swap for a store-backed limiter (Redis) if you deploy more than
// one instance.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const publishLimiter = rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const checkoutLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const redeemLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

app.get("/health", (_req, res) => res.json({ ok: true }));

// OAuth: connect a seller's Shopify account.
app.get("/auth", authLimiter, startInstall);
app.get("/auth/callback", authLimiter, asyncHandler(completeInstall));

// Publish an AI-generated store as a real (draft) product listing in the
// connected Shopify store.
app.post("/api/stores/publish", publishLimiter, asyncHandler(publishStore));

// Payments: pick a plan -> pay on Stripe's hosted page -> Stripe webhook
// (above) emails a promo code -> redeem it here for an entitlement token.
app.post("/api/checkout/create-session", checkoutLimiter, asyncHandler(createCheckoutSession));
app.post("/api/promo/redeem", redeemLimiter, asyncHandler(redeemPromoCode));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled request error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error." });
});

app.listen(env.port, () => {
  console.log(`Shopyfy backend listening on http://localhost:${env.port}`);
  console.log(`Public HOST configured as: ${env.host}`);
});
