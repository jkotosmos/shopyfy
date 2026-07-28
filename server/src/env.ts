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

  // Real market data (all optional — /api/market-data reports per-source
  // which of these are configured and returns null for the rest, so the
  // frontend can fall back to the illustrative demo generators per-source
  // instead of all-or-nothing).
  //
  // Google Trends has no general-access official API (only an invite-only
  // alpha as of 2025), so real trend/interest-by-region data here goes
  // through SerpApi's Google Trends endpoint instead — a paid third-party
  // service with a small free trial. This is a deliberate, documented
  // choice, not a stand-in for an official API; swap serpapiClient.ts for
  // another provider (HasData, Bright Data, Apify, etc.) if you prefer.
  serpApiKey: process.env.SERPAPI_KEY,

  // eBay Browse API — free developer account, OAuth client-credentials
  // (see developer.ebay.com). Gives real listings (title/price/condition/
  // seller) for a keyword; it's eBay's marketplace, not AliExpress, since
  // AliExpress has no comparable self-serve API.
  ebayAppId: process.env.EBAY_APP_ID,
  ebayCertId: process.env.EBAY_CERT_ID,

  // Meta Ad Library API — a Meta developer app's ID+secret used as an app
  // access token. Works for basic keyword search on non-political ads;
  // higher volume / political-and-issue ads need Meta's separate ad-library
  // access review. See server/README.md.
  metaAdsAppId: process.env.META_ADS_APP_ID,
  metaAdsAppSecret: process.env.META_ADS_APP_SECRET,
};
