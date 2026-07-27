import { env } from "./env.js";

interface ShopifyRequestOptions {
  shop: string;
  accessToken: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string; // e.g. "products.json"
  body?: unknown;
}

// Thin wrapper around the Shopify Admin REST API: builds the URL, attaches
// the access token, and retries once on a 429 using the Retry-After header
// Shopify sends (Admin API is rate-limited per shop — see
// https://shopify.dev/docs/api/usage/rate-limits).
export async function shopifyRequest<T>({ shop, accessToken, method = "GET", path, body }: ShopifyRequestOptions): Promise<T> {
  const url = `https://${shop}/admin/api/${env.shopifyApiVersion}/${path}`;

  const doFetch = () =>
    fetch(url, {
      method,
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 429) {
    const retryAfterSeconds = Number(res.headers.get("Retry-After") ?? "1");
    await new Promise((r) => setTimeout(r, retryAfterSeconds * 1000));
    res = await doFetch();
  }

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Shopify API ${method} ${path} failed: ${res.status} ${errorBody}`);
  }

  return res.json() as Promise<T>;
}
