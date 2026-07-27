import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env.js";

// DEMO-ONLY STORAGE — see the identical warning in tokenStore.ts. A promo
// code here is a bearer credential (whoever has the string gets the
// entitlement), so before this handles real money: move it to a real
// database, and consider binding redemption to the purchasing email
// instead of treating the code as a fully anonymous bearer token.

export interface PromoCode {
  code: string;
  plan: "starter" | "growth" | "pro";
  email: string;
  stripeSessionId: string;
  createdAt: string;
  redeemCount: number;
  lastRedeemedAt: string | null;
}

const filePath = () => join(env.dataDir, "promo-codes.json");

async function readAll(): Promise<Record<string, PromoCode>> {
  try {
    const raw = await readFile(filePath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, PromoCode>): Promise<void> {
  await mkdir(env.dataDir, { recursive: true });
  await writeFile(filePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function savePromoCode(entry: Omit<PromoCode, "redeemCount" | "lastRedeemedAt">): Promise<void> {
  const all = await readAll();
  all[entry.code] = { ...entry, redeemCount: 0, lastRedeemedAt: null };
  await writeAll(all);
}

export async function findByStripeSession(stripeSessionId: string): Promise<PromoCode | undefined> {
  const all = await readAll();
  return Object.values(all).find((p) => p.stripeSessionId === stripeSessionId);
}

export async function getPromoCode(code: string): Promise<PromoCode | undefined> {
  const all = await readAll();
  return all[code];
}

export async function markRedeemed(code: string): Promise<void> {
  const all = await readAll();
  const entry = all[code];
  if (!entry) return;
  entry.redeemCount += 1;
  entry.lastRedeemedAt = new Date().toISOString();
  await writeAll(all);
}
