import { env } from "./env.js";

export function isEbayConfigured(): boolean {
  return Boolean(env.ebayAppId && env.ebayCertId);
}

export interface EbayItem {
  title: string;
  price: number | null;
  currency: string | null;
  url: string;
  image: string | null;
  condition: string | null;
  seller: string | null;
  countryCode: string | null; // real listing/seller country (ISO 2-letter) from eBay itself
}

export interface EbaySearchResult {
  items: EbayItem[];
  totalListings: number; // eBay's own real total match count, not just this page's size
}

let cachedToken: { token: string; expiresAt: number } | null = null;

// eBay Browse API uses OAuth2 client-credentials for public read access —
// no per-user login needed, just an app keyset from developer.ebay.com.
// Tokens last ~2 hours; cached here so we don't re-auth on every request.
async function getEbayAppToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const basic = Buffer.from(`${env.ebayAppId}:${env.ebayCertId}`).toString("base64");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`eBay OAuth token request failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.token;
}

export async function searchEbayItems(keyword: string, limit = 8): Promise<EbaySearchResult> {
  const token = await getEbayAppToken();
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.set("q", keyword);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort", "-relevance");

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`eBay Browse API request failed: ${res.status} ${body}`);
  }

  interface EbaySearchResponse {
    total?: number;
    itemSummaries?: {
      title: string;
      price?: { value: string; currency: string };
      itemWebUrl: string;
      image?: { imageUrl: string };
      condition?: string;
      seller?: { username: string };
      itemLocation?: { country?: string };
    }[];
  }

  const data = (await res.json()) as EbaySearchResponse;
  const items = (data.itemSummaries ?? []).map((item) => ({
    title: item.title,
    price: item.price ? Number(item.price.value) : null,
    currency: item.price?.currency ?? null,
    url: item.itemWebUrl,
    image: item.image?.imageUrl ?? null,
    condition: item.condition ?? null,
    seller: item.seller?.username ?? null,
    countryCode: item.itemLocation?.country ?? null,
  }));
  return { items, totalListings: data.total ?? items.length };
}
