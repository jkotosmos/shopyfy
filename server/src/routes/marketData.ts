import type { Request, Response } from "express";
import { isSerpApiConfigured, fetchGoogleTrends, type GoogleTrendsResult } from "../serpapiClient.js";
import { isEbayConfigured, searchEbayItems, type EbayItem } from "../ebayClient.js";
import { isMetaAdsConfigured, searchMetaAds, type RealAd } from "../metaAdsClient.js";

async function settle<T>(enabled: boolean, fn: () => Promise<T>): Promise<T | null> {
  if (!enabled) return null;
  try {
    return await fn();
  } catch (err) {
    console.error("Market data source failed:", err);
    return null;
  }
}

// GET /api/market-data?q=keyword
// Real data only — every field is either genuinely fetched from Google
// Trends (via SerpApi)/eBay/Meta Ad Library, or null when that source
// isn't configured or the request failed. The frontend falls back to its
// own illustrative demo generators per source, never mixing fabricated
// values into what this endpoint reports as real.
export async function getMarketData(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.status(400).json({ error: "q is required" });
  }

  const [trends, products, ads] = await Promise.all([
    settle<GoogleTrendsResult>(isSerpApiConfigured(), () => fetchGoogleTrends(q)),
    settle<EbayItem[]>(isEbayConfigured(), () => searchEbayItems(q)),
    settle<RealAd[]>(isMetaAdsConfigured(), () => searchMetaAds(q)),
  ]);

  res.json({
    query: q,
    trends,
    products,
    ads,
    sources: {
      trends: isSerpApiConfigured(),
      products: isEbayConfigured(),
      ads: isMetaAdsConfigured(),
    },
  });
}
