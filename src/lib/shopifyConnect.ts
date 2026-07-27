// Talks to the optional backend in server/ (Shopify OAuth + Admin API
// scaffold). Everything here is a no-op / returns null when
// VITE_SHOPIFY_BACKEND_URL isn't set, which is the default for this
// prototype — the UI falls back to explaining the flow instead.

const STORAGE_KEY = "shopyfy_shopify_session_v1";

export interface ShopifySession {
  shop: string;
  token: string;
}

export function getBackendUrl(): string | null {
  const url = import.meta.env.VITE_SHOPIFY_BACKEND_URL as string | undefined;
  return url ? url.replace(/\/+$/, "") : null;
}

export function getStoredSession(): ShopifySession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShopifySession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: ShopifySession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop.trim());
}

export function startConnect(shopDomain: string): void {
  const backendUrl = getBackendUrl();
  if (!backendUrl) return;
  window.location.href = `${backendUrl}/auth?shop=${encodeURIComponent(shopDomain.trim())}`;
}

export interface PublishStorePayload {
  productName: string;
  description: string;
  usps: string[];
  collections: string[];
  price: number;
  bundleUpsell?: { title: string; discount: string };
}

export interface PublishStoreResult {
  productId: number;
  productAdminUrl: string;
  collections: { title: string; id: number }[];
  discountCode: string | null;
}

export async function publishStore(payload: PublishStorePayload): Promise<PublishStoreResult> {
  const backendUrl = getBackendUrl();
  const session = getStoredSession();
  if (!backendUrl || !session) {
    throw new Error("Магазин Shopify не подключён.");
  }

  const res = await fetch(`${backendUrl}/api/stores/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Публикация не удалась (${res.status})`);
  }

  return res.json() as Promise<PublishStoreResult>;
}
