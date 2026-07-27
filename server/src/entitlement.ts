import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";

// Signed proof that a browser redeemed a valid promo code for a plan —
// same minimal-signed-token approach as session.ts (see the caveats
// there: no revocation, no rotation). A purchase is a one-time event in
// this scaffold, not a recurring-subscription check, so this is
// intentionally long-lived rather than session-length.

export type Plan = "starter" | "growth" | "pro";
export const PLAN_RANK: Record<Plan, number> = { starter: 1, growth: 2, pro: 3 };

const ENTITLEMENT_TTL_MS = 400 * 24 * 60 * 60 * 1000; // ~400 days

function sign(payload: string): string {
  return createHmac("sha256", env.sessionSecret).update(payload).digest("hex");
}

export function issueEntitlementToken(plan: Plan, email: string): string {
  const payload = `${plan}.${encodeURIComponent(email)}.${Date.now() + ENTITLEMENT_TTL_MS}`;
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyEntitlementToken(token: string | undefined): { plan: Plan; email: string } | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  // plan (fixed enum, no dots) is safe to split on the FIRST dot; expiry
  // (a plain integer, no dots) is safe to split on the LAST dot. Everything
  // between is the encoded email, which can itself contain dots.
  const decoded = Buffer.from(encoded, "base64url").toString("utf8");
  const firstDot = decoded.indexOf(".");
  const lastDot = decoded.lastIndexOf(".");
  if (firstDot === -1 || lastDot === firstDot) return null;
  const plan = decoded.slice(0, firstDot);
  const encodedEmail = decoded.slice(firstDot + 1, lastDot);
  const expiry = Number(decoded.slice(lastDot + 1));
  if (!encodedEmail || !expiry || expiry < Date.now()) return null;
  if (plan !== "starter" && plan !== "growth" && plan !== "pro") return null;

  return { plan, email: decodeURIComponent(encodedEmail) };
}
