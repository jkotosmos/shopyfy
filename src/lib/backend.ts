// Shared helper for talking to the optional backend in server/ (Shopify
// OAuth + payments scaffold). Returns null when VITE_SHOPIFY_BACKEND_URL
// isn't set, which is the default for this prototype — callers fall back
// to explaining the flow instead of running it.

export function getBackendUrl(): string | null {
  const url = import.meta.env.VITE_SHOPIFY_BACKEND_URL as string | undefined;
  return url ? url.replace(/\/+$/, "") : null;
}
