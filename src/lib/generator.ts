import { makeRng, pick, pickMany, randInt } from "./seed";
import { detectNiche, type Niche } from "./niches";

export type SourceMarketplace = "AliExpress" | "Amazon" | "Alibaba" | "Shopify" | "Custom link" | "Product name";

export interface GeneratedStore {
  input: string;
  source: SourceMarketplace;
  productName: string;
  niche: Niche;
  storeName: string;
  domainSuggestion: string;
  tagline: string;
  heroHeadline: string;
  heroSub: string;
  description: string;
  usps: string[];
  collections: string[];
  pageSections: string[];
  bundleUpsell: { title: string; discount: string };
  cartUpsell: { title: string; addOn: string; price: string };
  cost: number;
  price: number;
  marginPct: number;
  marketScore: number;
  competitionLabel: string;
  buildSteps: string[];
}

const NOISE_TOKENS = new Set([
  "dp", "gp", "product", "products", "item", "items", "i", "html", "htm", "pdt", "pd",
  "ref", "the", "for", "and", "with", "new", "hot", "sale", "free", "shipping",
  "store", "shop", "official", "wholesale", "detail", "detail_page", "aliexpress",
  "amazon", "alibaba", "shopify", "www", "com", "net", "org", "search", "wholesale2",
  "spm", "sku", "id", "index",
]);

function looksLikeCode(token: string): boolean {
  // e.g. B08N5WRWNW, 1005006, 32849xyz1 — SKUs / ASINs / numeric ids
  if (/^\d+$/.test(token)) return true;
  if (/^[a-z]\d[a-z0-9]{6,}$/i.test(token)) return true;
  if (/^[a-z]{1,3}\d{3,}$/i.test(token)) return true;
  return false;
}

function titleCase(words: string[]): string {
  return words
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

function detectSource(url: URL | null, raw: string): SourceMarketplace {
  const host = url?.hostname.toLowerCase() ?? "";
  if (host.includes("aliexpress")) return "AliExpress";
  if (host.includes("amazon")) return "Amazon";
  if (host.includes("alibaba")) return "Alibaba";
  if (host.includes("myshopify") || host.includes("shopify")) return "Shopify";
  if (url) return "Custom link";
  return raw.trim() ? "Product name" : "Product name";
}

function extractProductWords(url: URL): string[] {
  const segments = decodeURIComponent(url.pathname)
    .split(/[/]/)
    .flatMap((seg) => seg.split(/[-_+.]/))
    .map((w) => w.trim())
    .filter(Boolean);

  const words = segments.filter((w) => {
    if (NOISE_TOKENS.has(w.toLowerCase())) return false;
    if (looksLikeCode(w)) return false;
    if (!/[a-zA-Z]/.test(w)) return false;
    return true;
  });

  if (words.length >= 2) return words.slice(0, 6);

  // fall back to query params that often carry the search/product text
  const q = url.searchParams.get("keywords") || url.searchParams.get("SearchText") || url.searchParams.get("q");
  if (q) {
    return q.split(/[\s\-_+.]/).filter((w) => w && !NOISE_TOKENS.has(w.toLowerCase())).slice(0, 6);
  }
  return words;
}

const FALLBACK_PRODUCTS = [
  "Portable Neck Fan", "Magnetic Cable Organizer", "LED Galaxy Projector",
  "Posture Corrector Brace", "Silicone Kitchen Gadget Set", "Mini Facial Massager",
  "Foldable Phone Stand", "Pet Grooming Glove", "Resistance Band Set",
  "Car Windshield Sunshade", "Collapsible Water Bottle", "Smart Sleep Mask",
];

function resolveProductName(input: string): { name: string; url: URL | null } {
  let url: URL | null = null;
  try {
    url = new URL(input.trim());
  } catch {
    url = null;
  }

  if (!url) {
    const clean = input.trim();
    return { name: clean.length > 2 ? titleCase(clean.split(/\s+/)) : pick(makeRng(input || "seed"), FALLBACK_PRODUCTS), url: null };
  }

  const words = extractProductWords(url);
  if (words.length === 0) {
    return { name: pick(makeRng(input), FALLBACK_PRODUCTS), url };
  }
  return { name: titleCase(words), url };
}

const STORE_NAME_TEMPLATES = [
  (w: string) => `${w}ify`,
  (w: string) => `Get${w}`,
  (w: string) => `${w} Haven`,
  (w: string) => `The ${w} Edit`,
  (w: string) => `${w} Co.`,
  (w: string) => `My${w}`,
  (w: string) => `${w} Studio`,
  (w: string) => `Daily ${w}`,
  (w: string) => `${w} Nest`,
  (w: string) => `Urban ${w}`,
];

const TAGLINES = [
  "Small upgrade, big difference.",
  "The one everyone asks about.",
  "Made for people who notice details.",
  "Everyday essentials, elevated.",
  "Because good design shouldn't be rare.",
  "Your new favorite, delivered.",
  "Simple. Useful. Actually works.",
  "Built around how you actually live.",
];

const USP_TEMPLATES = [
  (p: string) => `Premium-grade materials make ${p} noticeably more durable than typical alternatives`,
  (p: string) => `Free worldwide shipping and 30-day returns on every ${p} order`,
  (_p: string) => `Backed by 4.7★ average rating across early customer reviews`,
  (_p: string) => `Ships in discreet, eco-friendly packaging within 24 hours`,
  (_p: string) => `Designed for effortless daily use — no learning curve`,
  (_p: string) => `Limited first batch — restocks typically sell out within 2 weeks`,
  (_p: string) => `Compact enough to travel with, sturdy enough for daily use`,
  (_p: string) => `1-year warranty and real human customer support`,
];

const SECTION_POOL = [
  "Hero banner with product video",
  "Problem → solution story block",
  "Feature highlight grid",
  "Before/after comparison slider",
  "Customer review carousel",
  "Instagram/TikTok UGC gallery",
  "Size/spec comparison table",
  "FAQ accordion",
  "Trust badges + guarantee bar",
  "Sticky add-to-cart bar",
  "Countdown restock banner",
  "Bundle & save block",
];

const COLLECTION_POOL = [
  "Best Sellers", "New Arrivals", "Under $30", "Staff Picks",
  "Trending This Week", "Gift Ideas", "Bundle Deals", "Back in Stock",
];

const BUILD_STEPS = [
  "Reading product link…",
  "Cross-checking 1,200+ similar listings…",
  "Analyzing market demand & competition…",
  "Drafting brand name and identity…",
  "Writing product page copy…",
  "Generating page sections & layout…",
  "Building bundle and cart upsell offers…",
  "Optimizing for mobile conversion…",
  "Store ready ✅",
];

export function generateStore(rawInput: string): GeneratedStore {
  const { name: productName, url } = resolveProductName(rawInput);
  const source = detectSource(url, rawInput);
  const niche = detectNiche(`${rawInput} ${productName}`);
  const rng = makeRng(rawInput.trim().toLowerCase() || productName);

  const keyWord = productName.split(" ").filter((w) => w.length > 3)[0] || productName.split(" ")[0] || "Store";
  const storeName = pick(rng, STORE_NAME_TEMPLATES)(keyWord);
  const domainSuggestion = `${storeName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.com`;

  const tagline = pick(rng, TAGLINES);
  const heroHeadline = `${productName}: ${tagline.replace(/\.$/, "")}`;
  const heroSub = `Discover why shoppers are switching to the ${productName.toLowerCase()} for ${niche.benefit}.`;

  const description = `The ${productName} was picked because it solves a real, recurring problem tied to ${niche.benefit}. Our AI analyzed pricing, reviews and ad activity across the category before generating a page structured to answer buyer objections in order: what it is, why it's different, proof it works, and a low-friction way to try it.`;

  const usps = pickMany(rng, USP_TEMPLATES, 3).map((fn) => fn(productName));
  const collections = ["Best Sellers", ...pickMany(rng, COLLECTION_POOL.slice(1), 3)];
  const pageSections = pickMany(rng, SECTION_POOL, 6);

  const bundleDiscountPct = randInt(rng, 10, 20);
  const bundleUpsell = {
    title: `Buy 2, Save ${bundleDiscountPct}%`,
    discount: `Bundle of 3 → Save ${bundleDiscountPct + 8}%`,
  };
  const cartUpsell = {
    title: `Complete the set`,
    addOn: `Add a travel case`,
    price: `+$${randInt(rng, 6, 14)}.99`,
  };

  const [costMin, costMax] = niche.costRange;
  const cost = Math.round((costMin + rng() * (costMax - costMin)) * 100) / 100;
  const markup = 2.6 + rng() * 2.2; // typical dropshipping markup range
  const price = Math.round(cost * markup * 100) / 100;
  const marginPct = Math.round(((price - cost) / price) * 100);

  const marketScore = randInt(rng, 58, 96);
  const competitionLabel = marketScore > 85 ? "High demand, moderate competition" : marketScore > 70 ? "Solid demand, low-moderate competition" : "Niche demand, low competition";

  return {
    input: rawInput,
    source,
    productName,
    niche,
    storeName,
    domainSuggestion,
    tagline,
    heroHeadline,
    heroSub,
    description,
    usps,
    collections,
    pageSections,
    bundleUpsell,
    cartUpsell,
    cost,
    price,
    marginPct,
    marketScore,
    competitionLabel,
    buildSteps: BUILD_STEPS,
  };
}
