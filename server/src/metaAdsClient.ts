import { env } from "./env.js";

export function isMetaAdsConfigured(): boolean {
  return Boolean(env.metaAdsAppId && env.metaAdsAppSecret);
}

export interface RealAd {
  pageName: string;
  body: string | null;
  startDate: string | null;
  platforms: string[];
}

// Meta's Ad Library API is meant for public transparency, so a basic app
// access token (app_id|app_secret — no per-user OAuth flow) works for
// keyword search over non-political/non-issue ads. Higher-volume or
// political/social-issue-ad access needs Meta's separate ad-library
// access review — see server/README.md.
export async function searchMetaAds(keyword: string, limit = 5): Promise<RealAd[]> {
  const accessToken = `${env.metaAdsAppId}|${env.metaAdsAppSecret}`;
  const url = new URL("https://graph.facebook.com/v20.0/ads_archive");
  url.searchParams.set("search_terms", keyword);
  url.searchParams.set("ad_type", "ALL");
  url.searchParams.set("ad_reached_countries", JSON.stringify(["US"]));
  url.searchParams.set("fields", "page_name,ad_creative_bodies,ad_delivery_start_time,publisher_platforms");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta Ad Library API request failed: ${res.status} ${body}`);
  }

  interface MetaAdsResponse {
    data?: {
      page_name?: string;
      ad_creative_bodies?: string[];
      ad_delivery_start_time?: string;
      publisher_platforms?: string[];
    }[];
  }

  const data = (await res.json()) as MetaAdsResponse;
  return (data.data ?? []).map((ad) => ({
    pageName: ad.page_name ?? "Unknown",
    body: ad.ad_creative_bodies?.[0] ?? null,
    startDate: ad.ad_delivery_start_time ?? null,
    platforms: ad.publisher_platforms ?? [],
  }));
}
