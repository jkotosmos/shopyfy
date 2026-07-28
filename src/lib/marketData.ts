// Talks to the optional backend's GET /api/market-data (server/src/routes/
// marketData.ts) — real Google Trends interest/region data (via SerpApi),
// real eBay listings, and real Meta Ad Library ads for a keyword. Returns
// null (not an error) whenever the backend isn't configured at all, or a
// given source within it isn't set up, so callers can fall back to the
// illustrative demo generators per-source.

import { getBackendUrl } from "./backend";

export interface RealTrendPoint {
  date: string;
  value: number;
}

export interface RealCountryInterest {
  country: string;
  countryCode: string;
  value: number;
}

export interface RealGoogleTrends {
  keyword: string;
  averageInterest: number;
  timeseries: RealTrendPoint[];
  topCountries: RealCountryInterest[];
}

export interface RealProduct {
  title: string;
  price: number | null;
  currency: string | null;
  url: string;
  image: string | null;
  condition: string | null;
  seller: string | null;
}

export interface RealAd {
  pageName: string;
  body: string | null;
  startDate: string | null;
  platforms: string[];
}

export interface RealMarketData {
  query: string;
  trends: RealGoogleTrends | null;
  products: RealProduct[] | null;
  ads: RealAd[] | null;
  sources: { trends: boolean; products: boolean; ads: boolean };
}

export function isMarketDataBackendConfigured(): boolean {
  return Boolean(getBackendUrl());
}

export async function fetchRealMarketData(keyword: string): Promise<RealMarketData | null> {
  const backendUrl = getBackendUrl();
  const q = keyword.trim();
  if (!backendUrl || !q) return null;
  try {
    const res = await fetch(`${backendUrl}/api/market-data?q=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    return (await res.json()) as RealMarketData;
  } catch {
    return null;
  }
}
