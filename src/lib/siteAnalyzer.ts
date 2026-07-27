// «SEO/трафик-анализ сайта» — воспроизводит набор отчётов из платной версии
// SimilarWeb (обзор трафика, источники, гео, ключевые слова, бэклинки,
// соцсети, похожие сайты, технологии) на детерминированных, воспроизводимых
// цифрах — без доступа к реальной панели SimilarWeb или иным платным API.
// Как и в остальных инструментах приложения, цифры — иллюстративная
// отправная точка, а не живой фид: buildSiteResearchLinks() даёт реальные
// ссылки на бесплатные инструменты, чтобы проверить фактические показатели.

import { makeRng, pick, pickMany, randInt } from "./seed";
import { detectNiche, type Niche } from "./niches";
import type { ResearchLink } from "./trends";

export interface SiteOverview {
  domain: string;
  category: string;
  globalRank: number;
  countryRank: number;
  categoryRank: number;
  country: string;
  monthlyVisits: number;
  visitsChangePct: number;
  avgVisitDuration: string;
  pagesPerVisit: number;
  bounceRatePct: number;
}

export interface ShareRow {
  label: string;
  pct: number;
}

export interface CountryShare extends ShareRow {
  flag: string;
}

export interface KeywordRow {
  keyword: string;
  trafficSharePct: number;
  monthlyVisitsEstimate: string;
  cpc?: string;
}

export interface ReferringDomain {
  domain: string;
  authority: number;
}

export interface BacklinksOverview {
  totalBacklinks: number;
  referringDomains: number;
  topReferring: ReferringDomain[];
}

export interface SimilarSite {
  domain: string;
  affinityPct: number;
}

export interface TechStackItem {
  category: string;
  name: string;
}

export interface SiteReport {
  domain: string;
  niche: Niche;
  overview: SiteOverview;
  trafficSources: ShareRow[];
  countries: CountryShare[];
  otherCountriesPct: number;
  organicKeywords: KeywordRow[];
  paidKeywords: KeywordRow[];
  backlinks: BacklinksOverview;
  socialShares: ShareRow[];
  similarSites: SimilarSite[];
  audienceInterests: string[];
  techStack: TechStackItem[];
  seoHealthScore: number;
}

export function normalizeDomain(rawInput: string): string {
  let value = rawInput.trim().toLowerCase();
  if (!value) return "example.com";
  value = value.replace(/^https?:\/\//, "").replace(/^www\./, "");
  value = value.split(/[/?#]/)[0];
  return value.includes(".") ? value : `${value}.com`;
}

const COUNTRIES = [
  { name: "США", flag: "🇺🇸" },
  { name: "Великобритания", flag: "🇬🇧" },
  { name: "Германия", flag: "🇩🇪" },
  { name: "Канада", flag: "🇨🇦" },
  { name: "Франция", flag: "🇫🇷" },
  { name: "Австралия", flag: "🇦🇺" },
  { name: "Бразилия", flag: "🇧🇷" },
  { name: "Индия", flag: "🇮🇳" },
  { name: "Испания", flag: "🇪🇸" },
  { name: "Италия", flag: "🇮🇹" },
  { name: "Нидерланды", flag: "🇳🇱" },
  { name: "Польша", flag: "🇵🇱" },
  { name: "Мексика", flag: "🇲🇽" },
  { name: "Япония", flag: "🇯🇵" },
  { name: "ОАЭ", flag: "🇦🇪" },
] as const;

const TRAFFIC_CHANNEL_RANGES: [string, [number, number]][] = [
  ["Прямые заходы", [22, 46]],
  ["Органический поиск", [20, 42]],
  ["Платный поиск", [3, 16]],
  ["Соцсети", [5, 22]],
  ["Реферальные переходы", [2, 11]],
  ["Медийная реклама", [1, 5]],
  ["Email-рассылки", [1, 6]],
];

const SOCIAL_CHANNEL_RANGES: [string, [number, number]][] = [
  ["YouTube", [15, 38]],
  ["Facebook", [14, 34]],
  ["Instagram", [10, 28]],
  ["TikTok", [6, 24]],
  ["Pinterest", [4, 16]],
  ["X (Twitter)", [3, 12]],
  ["Reddit", [2, 10]],
  ["ВКонтакте", [1, 8]],
];

function distributeExact100(rng: () => number, ranges: [string, [number, number]][]): ShareRow[] {
  const raw = ranges.map(([label, [lo, hi]]) => ({ label, val: lo + rng() * (hi - lo) }));
  const sum = raw.reduce((acc, r) => acc + r.val, 0);
  const rows = raw.map((r) => ({ label: r.label, pct: Math.round((r.val / sum) * 100) }));
  const diff = 100 - rows.reduce((acc, r) => acc + r.pct, 0);
  rows[0].pct += diff;
  return rows.sort((a, b) => b.pct - a.pct);
}

const NICHE_SEARCH_TERM: Record<string, string> = {
  electronics: "гаджет",
  beauty: "уходовую косметику",
  home: "товар для дома",
  fitness: "фитнес-аксессуар",
  pet: "товар для питомца",
  kids: "детский товар",
  outdoors: "туристическое снаряжение",
  fashion: "аксессуар",
  auto: "автотовар",
  general: "товар",
};

const ORGANIC_TEMPLATES: ((brand: string, term: string) => string)[] = [
  (b) => b,
  (b) => `${b} официальный сайт`,
  (b) => `${b} отзывы`,
  (b) => `${b} каталог`,
  (_b, t) => `купить ${t}`,
  (_b, t) => `${t} цена`,
  (b) => `${b} интернет-магазин`,
  (_b, t) => `${t} с доставкой`,
  (b) => `${b} акции`,
  (_b, t) => `лучший ${t}`,
];

const PAID_TEMPLATES: ((brand: string, term: string) => string)[] = [
  (_b, t) => `купить ${t} недорого`,
  (_b, t) => `${t} со скидкой`,
  (_b, t) => `${t} интернет-магазин`,
  (b) => `${b} промокод`,
  (_b, t) => `быстрая доставка — ${t}`,
  (_b, t) => `заказать ${t} онлайн`,
  (b) => `${b} скидка`,
];

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)} млн`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)} тыс.`;
  return `${Math.round(n)}`;
}

function buildKeywordRows(
  rng: () => number,
  templates: ((brand: string, term: string) => string)[],
  brand: string,
  term: string,
  monthlyVisits: number,
  paid: boolean,
): KeywordRow[] {
  const chosen = pickMany(rng, templates, paid ? 5 : 6);
  let remaining = paid ? randInt(rng, 8, 22) : randInt(rng, 20, 45);
  const rows = chosen.map((tmpl, i) => {
    const isLast = i === chosen.length - 1;
    const share = isLast ? Math.max(1, remaining) : Math.max(1, Math.round(remaining * (0.5 + rng() * 0.35)));
    remaining -= share;
    return {
      keyword: tmpl(brand, term),
      trafficSharePct: share,
      monthlyVisitsEstimate: formatCompact(monthlyVisits * (share / 100)),
      cpc: paid ? `$${(0.15 + rng() * 2.35).toFixed(2)}` : undefined,
    };
  });
  return rows.sort((a, b) => b.trafficSharePct - a.trafficSharePct);
}

const REFERRING_DOMAIN_POOL = [
  "reddit.com", "medium.com", "trustpilot.com", "quora.com", "pinterest.com", "youtube.com",
  "forbes.com", "businessinsider.com", "producthunt.com", "tumblr.com", "blogspot.com", "wordpress.com",
];

const SIMILAR_SITES_BY_NICHE: Record<string, string[]> = {
  electronics: ["aliexpress.com", "amazon.com", "bestbuy.com", "newegg.com", "ebay.com", "banggood.com"],
  beauty: ["sephora.com", "ulta.com", "iherb.com", "yesstyle.com", "lookfantastic.com"],
  home: ["wayfair.com", "ikea.com", "target.com", "overstock.com", "homedepot.com"],
  fitness: ["gymshark.com", "myprotein.com", "decathlon.com", "bodybuilding.com", "nike.com"],
  pet: ["chewy.com", "petco.com", "petsmart.com", "zooplus.com"],
  kids: ["carters.com", "babylist.com", "target.com", "zulily.com"],
  outdoors: ["rei.com", "decathlon.com", "backcountry.com", "cabelas.com"],
  fashion: ["zara.com", "asos.com", "shein.com", "hm.com", "nordstrom.com"],
  auto: ["autozone.com", "carid.com", "advanceautoparts.com", "oreillyauto.com"],
  general: ["amazon.com", "ebay.com", "walmart.com", "aliexpress.com", "temu.com"],
};

const AUDIENCE_INTERESTS_POOL = [
  "Электронная коммерция", "Соцсети и мессенджеры", "Новости и медиа", "Стриминг видео",
  "Финансы и платежи", "Путешествия", "Игры", "Образование", "Поисковые системы",
  "Мода и стиль", "Здоровье и фитнес", "Кулинария и рецепты",
];

const PLATFORM_POOL = ["Shopify", "Shopify", "WooCommerce (WordPress)", "WooCommerce (WordPress)", "BigCommerce", "Magento", "Wix", "Tilda", "Самописное решение"];
const ANALYTICS_POOL = ["Google Analytics 4", "Google Tag Manager", "Yandex.Metrica", "Hotjar", "Microsoft Clarity"];
const AD_PIXELS_POOL = ["Meta Pixel", "TikTok Pixel", "Google Ads Tag", "Pinterest Tag", "Snapchat Pixel"];
const REVIEWS_POOL = ["Judge.me", "Loox", "Yotpo", "Trustpilot Reviews"];
const CHAT_POOL = ["Tidio", "Intercom", "Re:amaze", "чат в Facebook Messenger"];
const PAYMENTS_POOL = ["Shopify Payments", "PayPal", "Stripe", "Klarna"];

export function analyzeSite(rawInput: string): SiteReport {
  const domain = normalizeDomain(rawInput);
  const brand = domain.split(".")[0];
  const brandDisplay = brand.charAt(0).toUpperCase() + brand.slice(1);
  const niche = detectNiche(domain);
  const searchTerm = NICHE_SEARCH_TERM[niche.id] ?? "товар";
  const rng = makeRng(domain);

  const visitsBase = randInt(rng, 12, 980);
  const visitsScale = pick(rng, [1_000, 10_000, 100_000]);
  const monthlyVisits = visitsBase * visitsScale;
  const globalRank = Math.max(38, Math.round(9_200_000 / Math.sqrt(monthlyVisits)) + randInt(rng, -150, 150));
  const countryRank = Math.max(5, Math.round(globalRank * (randInt(rng, 12, 38) / 100)));
  const categoryRank = randInt(rng, 4, 460);
  const visitsChangePct = randInt(rng, -22, 46);
  const country = pick(rng, COUNTRIES);

  const totalSeconds = randInt(rng, 48, 430);
  const avgVisitDuration = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
  const pagesPerVisit = randInt(rng, 120, 820) / 100;
  const bounceRatePct = randInt(rng, 27, 74);

  const overview: SiteOverview = {
    domain, category: niche.label, globalRank, countryRank, categoryRank,
    country: `${country.flag} ${country.name}`, monthlyVisits, visitsChangePct,
    avgVisitDuration, pagesPerVisit, bounceRatePct,
  };

  const trafficSources = distributeExact100(rng, TRAFFIC_CHANNEL_RANGES);
  const socialShares = distributeExact100(rng, SOCIAL_CHANNEL_RANGES);

  const countryPicks = pickMany(rng, COUNTRIES, 5);
  const rawCountryVals = countryPicks.map((_, i) => (i === 0 ? 30 + rng() * 20 : Math.max(2, 22 - i * 4 + rng() * 8)));
  const rawSum = rawCountryVals.reduce((a, b) => a + b, 0);
  const targetTop5Sum = 58 + rng() * 30;
  const countryShares = rawCountryVals.map((v) => Math.round((v / rawSum) * targetTop5Sum));
  const countries: CountryShare[] = countryPicks.map((c, i) => ({ label: c.name, flag: c.flag, pct: countryShares[i] }));
  const otherCountriesPct = Math.max(1, 100 - countryShares.reduce((a, b) => a + b, 0));

  const organicKeywords = buildKeywordRows(rng, ORGANIC_TEMPLATES, brandDisplay, searchTerm, monthlyVisits, false);
  const paidKeywords = buildKeywordRows(rng, PAID_TEMPLATES, brandDisplay, searchTerm, monthlyVisits, true);

  const totalBacklinks = randInt(rng, 850, 2_400_000);
  const referringDomains = Math.max(24, Math.round(totalBacklinks / randInt(rng, 9, 45)));
  const topReferring: ReferringDomain[] = pickMany(rng, REFERRING_DOMAIN_POOL, 5)
    .map((d) => ({ domain: d, authority: randInt(rng, 28, 96) }))
    .sort((a, b) => b.authority - a.authority);
  const backlinks: BacklinksOverview = { totalBacklinks, referringDomains, topReferring };

  const similarPool = (SIMILAR_SITES_BY_NICHE[niche.id] ?? SIMILAR_SITES_BY_NICHE.general).filter((d) => d !== domain);
  const similarSites: SimilarSite[] = pickMany(rng, similarPool, Math.min(5, similarPool.length))
    .map((d) => ({ domain: d, affinityPct: randInt(rng, 38, 91) }))
    .sort((a, b) => b.affinityPct - a.affinityPct);

  const audienceInterests = pickMany(rng, AUDIENCE_INTERESTS_POOL, 5);

  const techStack: TechStackItem[] = [
    { category: "Платформа", name: pick(rng, PLATFORM_POOL) },
    { category: "Аналитика", name: pickMany(rng, ANALYTICS_POOL, 2).join(", ") },
    { category: "Пиксели и реклама", name: pickMany(rng, AD_PIXELS_POOL, 2).join(", ") },
    { category: "Отзывы", name: pick(rng, REVIEWS_POOL) },
    { category: "Онлайн-чат", name: pick(rng, CHAT_POOL) },
    { category: "Оплата", name: pickMany(rng, PAYMENTS_POOL, 2).join(", ") },
  ];

  const rankFactor = Math.max(0, 100 - Math.log10(Math.max(globalRank, 10)) * 14);
  const engagementFactor = Math.max(0, 100 - bounceRatePct) * 0.6 + Math.min(100, pagesPerVisit * 16) * 0.4;
  const seoHealthScore = Math.round(Math.min(97, Math.max(8, rankFactor * 0.5 + engagementFactor * 0.5)));

  return {
    domain, niche, overview, trafficSources, countries, otherCountriesPct,
    organicKeywords, paidKeywords, backlinks, socialShares, similarSites,
    audienceInterests, techStack, seoHealthScore,
  };
}

export function buildSiteResearchLinks(domain: string): ResearchLink[] {
  const enc = encodeURIComponent(domain);
  return [
    {
      label: "SimilarWeb", platform: "SimilarWeb",
      url: `https://www.similarweb.com/website/${enc}/`,
      hint: "Реальный бесплатный обзор трафика этого сайта",
    },
    {
      label: "Google Trends", platform: "Google Trends",
      url: `https://trends.google.com/trends/explore?q=${enc}`,
      hint: "Динамика интереса к бренду в поиске",
    },
    {
      label: "Ahrefs Backlink Checker", platform: "Ahrefs",
      url: `https://ahrefs.com/backlink-checker/?input=${enc}&mode=domain`,
      hint: "Бесплатная проверка бэклинков и рефералов",
    },
    {
      label: "SEMrush — обзор домена", platform: "SEMrush",
      url: `https://www.semrush.com/analytics/overview/?q=${enc}&searchType=domain`,
      hint: "Органические и платные ключевые слова",
    },
    {
      label: "BuiltWith", platform: "BuiltWith",
      url: `https://builtwith.com/${enc}`,
      hint: "Реальный технологический стек сайта",
    },
    {
      label: "Meta Ad Library", platform: "Facebook/Instagram Ads",
      url: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${enc}&search_type=keyword_unordered`,
      hint: "Какую рекламу сейчас крутит этот бренд",
    },
    {
      label: "PageSpeed Insights", platform: "Google PageSpeed",
      url: `https://pagespeed.web.dev/report?url=${encodeURIComponent(`https://${domain}`)}`,
      hint: "Реальная скорость загрузки и Core Web Vitals",
    },
    {
      label: "WHOIS-запись", platform: "Who.is",
      url: `https://who.is/whois/${enc}`,
      hint: "Регистрация и возраст домена",
    },
  ];
}
