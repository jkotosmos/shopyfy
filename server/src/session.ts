import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";

// Minimal signed session token: base64url(shop.expiry) + "." + HMAC signature.
// This only proves "the server issued this for this shop and it hasn't
// expired" — it is not a replacement for real session/auth infrastructure
// (no revocation, no rotation). Fine for a scaffold; swap for signed JWTs
// or server-side sessions before handling real merchants.

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

function sign(payload: string): string {
  return createHmac("sha256", env.sessionSecret).update(payload).digest("hex");
}

export function issueSessionToken(shop: string): string {
  const payload = `${shop}.${Date.now() + SESSION_TTL_MS}`;
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined): { shop: string } | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  // Split on the LAST dot only — shop is a domain like "my-store.myshopify.com"
  // and can itself contain multiple dots, so a naive split(".") would chop it
  // up incorrectly. The expiry is always a plain integer with no dots, so
  // it's safe to peel off everything after the final dot.
  const decoded = Buffer.from(encoded, "base64url").toString("utf8");
  const sep = decoded.lastIndexOf(".");
  if (sep === -1) return null;
  const shop = decoded.slice(0, sep);
  const expiry = Number(decoded.slice(sep + 1));
  if (!shop || !expiry || expiry < Date.now()) return null;

  return { shop };
}
