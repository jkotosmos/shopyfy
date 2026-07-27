// Talks to the optional backend's payment routes (server/src/routes/
// checkout.ts, redeem.ts). No card details ever pass through this file or
// this app — startCheckout() redirects the browser to Stripe's own hosted
// Checkout page, and money from a real purchase goes straight to whoever
// owns the Stripe account configured on the backend. Everything here is a
// no-op / throws a clear "not connected" error when VITE_SHOPIFY_BACKEND_URL
// isn't set, same fallback pattern as shopifyConnect.ts.

import { getBackendUrl } from "./backend";
import type { Lang } from "./i18n";

export type Plan = "starter" | "growth" | "pro";

export const PLAN_RANK: Record<Plan, number> = { starter: 1, growth: 2, pro: 3 };

export interface Entitlement {
  plan: Plan;
  email: string;
  token: string;
}

const ENTITLEMENT_KEY = "shopyfy_entitlement_v1";

export function getEntitlement(): Entitlement | null {
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY);
    return raw ? (JSON.parse(raw) as Entitlement) : null;
  } catch {
    return null;
  }
}

export function saveEntitlement(entitlement: Entitlement): void {
  localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(entitlement));
}

export function clearEntitlement(): void {
  localStorage.removeItem(ENTITLEMENT_KEY);
}

export function hasPlanAtLeast(plan: Plan): boolean {
  const entitlement = getEntitlement();
  if (!entitlement) return false;
  return PLAN_RANK[entitlement.plan] >= PLAN_RANK[plan];
}

function notConnectedError(lang: Lang): Error {
  return new Error(lang === "en" ? "Payments backend is not connected." : "Бэкенд для оплаты не подключён.");
}

// Redirects the browser to Stripe Checkout for the given plan. Never
// resolves on success (the browser navigates away); only throws if the
// request to create the session itself fails.
export async function startCheckout(plan: Plan, lang: Lang = "ru"): Promise<void> {
  const backendUrl = getBackendUrl();
  if (!backendUrl) throw notConnectedError(lang);

  const res = await fetch(`${backendUrl}/api/checkout/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? (lang === "en" ? `Checkout failed (${res.status})` : `Не удалось начать оплату (${res.status})`));
  }

  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}

export async function redeemPromoCode(code: string, lang: Lang = "ru"): Promise<Entitlement> {
  const backendUrl = getBackendUrl();
  if (!backendUrl) throw notConnectedError(lang);

  const res = await fetch(`${backendUrl}/api/promo/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? (lang === "en" ? "Invalid promo code." : "Неверный промокод."));
  }

  const entitlement = (await res.json()) as Entitlement;
  saveEntitlement(entitlement);
  return entitlement;
}
