import { env } from "./env.js";

export function isMetaAdsConfigured(): boolean {
  return Boolean(env.metaAdsAppId && env.metaAdsAppSecret);
}

export interface RealAd {
  pageName: string;
  body: string | null;
  startDate: string | null;
  platforms: string[];
  snapshotUrl: string | null;
}

export interface MetaAdsResult {
  ads: RealAd[]; // top ads for display
  activeAdCount: number; // real count of currently-running ads matching the keyword, found in this query
  hasMore: boolean; // true if Meta's API reports more results beyond activeAdCount (real count is a lower bound)
}

const AD_REACHED_COUNTRIES = ["US", "GB", "CA", "AU"];

// Meta's Ad Library API is meant for public transparency, so a basic app
// access token (app_id|app_secret — no per-user OAuth flow) works for
// keyword search over non-political/non-issue ads. Higher-volume or
// political/social-issue-ad access needs Meta's separate ad-library
// access review — see server/README.md.
//
// The API has no "total match count" field (privacy-by-design), so
// activeAdCount is the real number of ads returned by this one query — a
// genuine lower bound on how many ads are running, used as a free,
// real (not illustrative) proxy for ad-driven demand, since there's no
// simple public API for the same signal on TikTok.
export async function searchMetaAds(keyword: string, displayLimit = 5, probeLimit = 25): Promise<MetaAdsResult> {
  const accessToken = `${env.metaAdsAppId}|${env.metaAdsAppSecret}`;
  const url = new URL("https://graph.facebook.com/v20.0/ads_archive");
  url.searchParams.set("search_terms", keyword);
  url.searchParams.set("ad_type", "ALL");
  url.searchParams.set("ad_reached_countries", JSON.stringify(AD_REACHED_COUNTRIES));
  url.searchParams.set("fields", "page_name,ad_creative_bodies,ad_delivery_start_time,publisher_platforms,ad_snapshot_url");
  url.searchParams.set("limit", String(probeLimit));
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
      ad_snapshot_url?: string;
    }[];
    paging?: { next?: string };
  }

  const data = (await res.json()) as MetaAdsResponse;
  const all = (data.data ?? []).map((ad) => ({
    pageName: ad.page_name ?? "Unknown",
    body: ad.ad_creative_bodies?.[0] ?? null,
    startDate: ad.ad_delivery_start_time ?? null,
    platforms: ad.publisher_platforms ?? [],
    snapshotUrl: ad.ad_snapshot_url ?? null,
  }));

  return {
    ads: all.slice(0, displayLimit),
    activeAdCount: all.length,
    hasMore: Boolean(data.paging?.next),
  };
}
