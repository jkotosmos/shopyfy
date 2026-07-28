import { env } from "./env.js";

export function isSerpApiConfigured(): boolean {
  return Boolean(env.serpApiKey);
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface CountryInterest {
  country: string;
  countryCode: string;
  value: number;
}

export interface GoogleTrendsResult {
  keyword: string;
  averageInterest: number;
  timeseries: TrendPoint[];
  topCountries: CountryInterest[];
}

interface SerpApiTimeseriesResponse {
  interest_over_time?: {
    timeline_data?: { date: string; values: { value: string }[] }[];
  };
}

interface SerpApiRegionResponse {
  interest_by_region?: { location: string; value: string; geo?: string }[];
}

async function serpApiGet<T>(params: Record<string, string>): Promise<T> {
  const url = new URL("https://serpapi.com/search.json");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("api_key", env.serpApiKey!);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SerpApi request failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

// Real Google Trends data for a keyword: interest-over-time (last 90 days)
// and interest-by-region (which countries search this the most — the
// closest legitimate, freely-queryable proxy for "where this sells best"
// that doesn't require sales data no public API exposes).
export async function fetchGoogleTrends(keyword: string): Promise<GoogleTrendsResult> {
  const [timeseriesRes, regionRes] = await Promise.all([
    serpApiGet<SerpApiTimeseriesResponse>({ engine: "google_trends", q: keyword, data_type: "TIMESERIES", date: "today 3-m" }),
    serpApiGet<SerpApiRegionResponse>({ engine: "google_trends", q: keyword, data_type: "GEO_MAP_0" }),
  ]);

  const timeline = timeseriesRes.interest_over_time?.timeline_data ?? [];
  const timeseries: TrendPoint[] = timeline.map((point) => ({
    date: point.date,
    value: Number(point.values?.[0]?.value ?? 0),
  }));
  const averageInterest = timeseries.length
    ? Math.round(timeseries.reduce((sum, p) => sum + p.value, 0) / timeseries.length)
    : 0;

  const regions = regionRes.interest_by_region ?? [];
  const topCountries: CountryInterest[] = regions
    .map((r) => ({ country: r.location, countryCode: r.geo ?? "", value: Number(r.value) || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return { keyword, averageInterest, timeseries, topCountries };
}
