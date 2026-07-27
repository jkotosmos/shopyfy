import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";

// Verifies the `hmac` query param Shopify attaches to OAuth callbacks (and
// webhooks): HMAC-SHA256 over the remaining query params, sorted and
// joined as key=value pairs, using the app's client secret.
export function verifyOAuthHmac(query: Record<string, string | undefined>): boolean {
  const { hmac, signature, ...rest } = query;
  if (!hmac) return false;

  const message = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key] ?? ""}`)
    .join("&");

  const digest = createHmac("sha256", env.shopifyApiSecret).update(message).digest("hex");

  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(hmac, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}
