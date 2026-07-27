import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} — copy server/.env.example to server/.env and fill it in.`);
  }
  return value;
}

export const env = {
  shopifyApiKey: required("SHOPIFY_API_KEY"),
  shopifyApiSecret: required("SHOPIFY_API_SECRET"),
  shopifyScopes: process.env.SHOPIFY_SCOPES ?? "write_products,read_products",
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-01",
  host: required("HOST").replace(/\/+$/, ""),
  appUrl: required("APP_URL").replace(/\/+$/, ""),
  sessionSecret: required("SESSION_SECRET"),
  port: Number(process.env.PORT ?? 8787),
  dataDir: process.env.DATA_DIR ?? "./data",

  // Payments (optional — the /api/checkout and /api/promo routes respond
  // with a clear "not configured" error instead of crashing the server
  // when these are unset, so the Shopify-only half of this backend keeps
  // working without a Stripe account).
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePrices: {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth: process.env.STRIPE_PRICE_GROWTH,
    pro: process.env.STRIPE_PRICE_PRO,
  },

  // SMTP (optional — promo codes are still generated and stored without
  // this, but won't be emailed; see mailer.ts).
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? "Shopyfy <no-reply@example.com>",
};
