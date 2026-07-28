// «SEO/трафик-анализ сайта» — воспроизводит набор отчётов из платной версии
// SimilarWeb (обзор трафика, источники, гео, ключевые слова, бэклинки,
// соцсети, похожие сайты, технологии) на детерминированных, воспроизводимых
// цифрах — без доступа к реальной панели SimilarWeb или иным платным API.
// Как и в остальных инструментах приложения, цифры — иллюстративная
// отправная точка, а не живой фид: buildSiteResearchLinks() даёт реальные
// ссылки на бесплатные инструменты, чтобы проверить фактические показатели.

import { makeRng, pick, pickMany, randInt } from "./seed";
import { detectNiche, nicheLabel, type Niche } from "./niches";
import type { ResearchLink } from "./trends";
import { getLang, type Lang } from "./i18n";

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

export const COUNTRY_FLAGS = ["🇺🇸", "🇬🇧", "🇩🇪", "🇨🇦", "🇫🇷", "🇦🇺", "🇧🇷", "🇮🇳", "🇪🇸", "🇮🇹", "🇳🇱", "🇵🇱", "🇲🇽", "🇯🇵", "🇦🇪"];
export const COUNTRY_NAMES: Record<Lang, string[]> = {
  ru: ["США", "Великобритания", "Германия", "Канада", "Франция", "Австралия", "Бразилия", "Индия", "Испания", "Италия", "Нидерланды", "Польша", "Мексика", "Япония", "ОАЭ"],
  en: ["United States", "United Kingdom", "Germany", "Canada", "France", "Australia", "Brazil", "India", "Spain", "Italy", "Netherlands", "Poland", "Mexico", "Japan", "UAE"],
};
export function countries(lang: Lang) {
  return COUNTRY_FLAGS.map((flag, i) => ({ flag, name: COUNTRY_NAMES[lang][i] }));
}

const CHANNEL_KEYS = ["direct", "organic", "paid", "social", "referral", "display", "email"] as const;
const TRAFFIC_CHANNEL_RANGES: Record<(typeof CHANNEL_KEYS)[number], [number, number]> = {
  direct: [22, 46], organic: [20, 42], paid: [3, 16], social: [5, 22], referral: [2, 11], display: [1, 5], email: [1, 6],
};
const TRAFFIC_CHANNEL_LABELS: Record<Lang, Record<(typeof CHANNEL_KEYS)[number], string>> = {
  ru: { direct: "Прямые заходы", organic: "Органический поиск", paid: "Платный поиск", social: "Соцсети", referral: "Реферальные переходы", display: "Медийная реклама", email: "Email-рассылки" },
  en: { direct: "Direct", organic: "Organic Search", paid: "Paid Search", social: "Social", referral: "Referrals", display: "Display Ads", email: "Email" },
};

const SOCIAL_KEYS = ["youtube", "facebook", "instagram", "tiktok", "pinterest", "x", "reddit", "vk"] as const;
const SOCIAL_CHANNEL_RANGES: Record<(typeof SOCIAL_KEYS)[number], [number, number]> = {
  youtube: [15, 38], facebook: [14, 34], instagram: [10, 28], tiktok: [6, 24], pinterest: [4, 16], x: [3, 12], reddit: [2, 10], vk: [1, 8],
};
const SOCIAL_CHANNEL_LABELS: Record<Lang, Record<(typeof SOCIAL_KEYS)[number], string>> = {
  ru: { youtube: "YouTube", facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", pinterest: "Pinterest", x: "X (Twitter)", reddit: "Reddit", vk: "ВКонтакте" },
  en: { youtube: "YouTube", facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", pinterest: "Pinterest", x: "X (Twitter)", reddit: "Reddit", vk: "VK" },
};

function distributeExact100<K extends string>(rng: () => number, ranges: Record<K, [number, number]>, labels: Record<K, string>): ShareRow[] {
  const keys = Object.keys(ranges) as K[];
  const raw = keys.map((key) => ({ key, val: ranges[key][0] + rng() * (ranges[key][1] - ranges[key][0]) }));
  const sum = raw.reduce((acc, r) => acc + r.val, 0);
  const rows = raw.map((r) => ({ label: labels[r.key], pct: Math.round((r.val / sum) * 100) }));
  const diff = 100 - rows.reduce((acc, r) => acc + r.pct, 0);
  rows[0].pct += diff;
  return rows.sort((a, b) => b.pct - a.pct);
}

const NICHE_SEARCH_TERM: Record<Lang, Record<string, string>> = {
  ru: {
    electronics: "гаджет", beauty: "уходовую косметику", home: "товар для дома", fitness: "фитнес-аксессуар",
    pet: "товар для питомца", kids: "детский товар", outdoors: "туристическое снаряжение", fashion: "аксессуар",
    auto: "автотовар", general: "товар",
  },
  en: {
    electronics: "gadget", beauty: "skincare", home: "home goods", fitness: "fitness gear",
    pet: "pet supplies", kids: "kids gear", outdoors: "camping gear", fashion: "accessories",
    auto: "car accessories", general: "product",
  },
};

const ORGANIC_TEMPLATES: Record<Lang, ((brand: string, term: string) => string)[]> = {
  ru: [
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
  ],
  en: [
    (b) => b,
    (b) => `${b} official site`,
    (b) => `${b} reviews`,
    (b) => `${b} catalog`,
    (_b, t) => `buy ${t}`,
    (_b, t) => `${t} price`,
    (b) => `${b} online store`,
    (_b, t) => `${t} free shipping`,
    (b) => `${b} promo code`,
    (_b, t) => `best ${t}`,
  ],
};

const PAID_TEMPLATES: Record<Lang, ((brand: string, term: string) => string)[]> = {
  ru: [
    (_b, t) => `купить ${t} недорого`,
    (_b, t) => `${t} со скидкой`,
    (_b, t) => `${t} интернет-магазин`,
    (b) => `${b} промокод`,
    (_b, t) => `быстрая доставка — ${t}`,
    (_b, t) => `заказать ${t} онлайн`,
    (b) => `${b} скидка`,
  ],
  en: [
    (_b, t) => `cheap ${t}`,
    (_b, t) => `${t} discount`,
    (_b, t) => `${t} online store`,
    (b) => `${b} coupon code`,
    (_b, t) => `fast shipping ${t}`,
    (_b, t) => `order ${t} online`,
    (b) => `${b} sale`,
  ],
};

export function formatCompact(n: number, lang: Lang = "ru"): string {
  if (lang === "en") {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
    return `${Math.round(n)}`;
  }
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
  lang: Lang,
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
      monthlyVisitsEstimate: formatCompact(monthlyVisits * (share / 100), lang),
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

const AUDIENCE_INTERESTS_POOL: Record<Lang, string[]> = {
  ru: [
    "Электронная коммерция", "Соцсети и мессенджеры", "Новости и медиа", "Стриминг видео",
    "Финансы и платежи", "Путешествия", "Игры", "Образование", "Поисковые системы",
    "Мода и стиль", "Здоровье и фитнес", "Кулинария и рецепты",
  ],
  en: [
    "E-commerce", "Social Media & Messaging", "News & Media", "Video Streaming",
    "Finance & Payments", "Travel", "Gaming", "Education", "Search Engines",
    "Fashion & Style", "Health & Fitness", "Cooking & Recipes",
  ],
};

const PLATFORM_POOL: Record<Lang, string[]> = {
  ru: ["Shopify", "Shopify", "WooCommerce (WordPress)", "WooCommerce (WordPress)", "BigCommerce", "Magento", "Wix", "Tilda", "Самописное решение"],
  en: ["Shopify", "Shopify", "WooCommerce (WordPress)", "WooCommerce (WordPress)", "BigCommerce", "Magento", "Wix", "Squarespace", "Custom-built"],
};
const ANALYTICS_POOL = ["Google Analytics 4", "Google Tag Manager", "Yandex.Metrica", "Hotjar", "Microsoft Clarity"];
const AD_PIXELS_POOL = ["Meta Pixel", "TikTok Pixel", "Google Ads Tag", "Pinterest Tag", "Snapchat Pixel"];
const REVIEWS_POOL = ["Judge.me", "Loox", "Yotpo", "Trustpilot Reviews"];
const CHAT_POOL: Record<Lang, string[]> = {
  ru: ["Tidio", "Intercom", "Re:amaze", "чат в Facebook Messenger"],
  en: ["Tidio", "Intercom", "Re:amaze", "Facebook Messenger chat"],
};
const PAYMENTS_POOL = ["Shopify Payments", "PayPal", "Stripe", "Klarna"];

const TECH_CATEGORY_LABELS: Record<Lang, { platform: string; analytics: string; pixels: string; reviews: string; chat: string; payments: string }> = {
  ru: { platform: "Платформа", analytics: "Аналитика", pixels: "Пиксели и реклама", reviews: "Отзывы", chat: "Онлайн-чат", payments: "Оплата" },
  en: { platform: "Platform", analytics: "Analytics", pixels: "Ad Pixels", reviews: "Reviews", chat: "Live Chat", payments: "Payments" },
};

export function analyzeSite(rawInput: string): SiteReport {
  const lang = getLang();
  const domain = normalizeDomain(rawInput);
  const brand = domain.split(".")[0];
  const brandDisplay = brand.charAt(0).toUpperCase() + brand.slice(1);
  const niche = detectNiche(domain);
  const searchTerm = NICHE_SEARCH_TERM[lang][niche.id] ?? NICHE_SEARCH_TERM[lang].general;
  const rng = makeRng(domain);

  const visitsBase = randInt(rng, 12, 980);
  const visitsScale = pick(rng, [1_000, 10_000, 100_000]);
  const monthlyVisits = visitsBase * visitsScale;
  const globalRank = Math.max(38, Math.round(9_200_000 / Math.sqrt(monthlyVisits)) + randInt(rng, -150, 150));
  const countryRank = Math.max(5, Math.round(globalRank * (randInt(rng, 12, 38) / 100)));
  const categoryRank = randInt(rng, 4, 460);
  const visitsChangePct = randInt(rng, -22, 46);
  const countryList = countries(lang);
  const country = pick(rng, countryList);

  const totalSeconds = randInt(rng, 48, 430);
  const avgVisitDuration = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
  const pagesPerVisit = randInt(rng, 120, 820) / 100;
  const bounceRatePct = randInt(rng, 27, 74);

  const overview: SiteOverview = {
    domain, category: nicheLabel(niche, lang), globalRank, countryRank, categoryRank,
    country: `${country.flag} ${country.name}`, monthlyVisits, visitsChangePct,
    avgVisitDuration, pagesPerVisit, bounceRatePct,
  };

  const trafficSources = distributeExact100(rng, TRAFFIC_CHANNEL_RANGES, TRAFFIC_CHANNEL_LABELS[lang]);
  const socialShares = distributeExact100(rng, SOCIAL_CHANNEL_RANGES, SOCIAL_CHANNEL_LABELS[lang]);

  const countryPicks = pickMany(rng, countryList, 5);
  const rawCountryVals = countryPicks.map((_, i) => (i === 0 ? 30 + rng() * 20 : Math.max(2, 22 - i * 4 + rng() * 8)));
  const rawSum = rawCountryVals.reduce((a, b) => a + b, 0);
  const targetTop5Sum = 58 + rng() * 30;
  const countryShares = rawCountryVals.map((v) => Math.round((v / rawSum) * targetTop5Sum));
  const countryRows: CountryShare[] = countryPicks.map((c, i) => ({ label: c.name, flag: c.flag, pct: countryShares[i] }));
  const otherCountriesPct = Math.max(1, 100 - countryShares.reduce((a, b) => a + b, 0));

  const organicKeywords = buildKeywordRows(rng, ORGANIC_TEMPLATES[lang], brandDisplay, searchTerm, monthlyVisits, false, lang);
  const paidKeywords = buildKeywordRows(rng, PAID_TEMPLATES[lang], brandDisplay, searchTerm, monthlyVisits, true, lang);

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

  const audienceInterests = pickMany(rng, AUDIENCE_INTERESTS_POOL[lang], 5);

  const techLabels = TECH_CATEGORY_LABELS[lang];
  const techStack: TechStackItem[] = [
    { category: techLabels.platform, name: pick(rng, PLATFORM_POOL[lang]) },
    { category: techLabels.analytics, name: pickMany(rng, ANALYTICS_POOL, 2).join(", ") },
    { category: techLabels.pixels, name: pickMany(rng, AD_PIXELS_POOL, 2).join(", ") },
    { category: techLabels.reviews, name: pick(rng, REVIEWS_POOL) },
    { category: techLabels.chat, name: pick(rng, CHAT_POOL[lang]) },
    { category: techLabels.payments, name: pickMany(rng, PAYMENTS_POOL, 2).join(", ") },
  ];

  const rankFactor = Math.max(0, 100 - Math.log10(Math.max(globalRank, 10)) * 14);
  const engagementFactor = Math.max(0, 100 - bounceRatePct) * 0.6 + Math.min(100, pagesPerVisit * 16) * 0.4;
  const seoHealthScore = Math.round(Math.min(97, Math.max(8, rankFactor * 0.5 + engagementFactor * 0.5)));

  return {
    domain, niche, overview, trafficSources, countries: countryRows, otherCountriesPct,
    organicKeywords, paidKeywords, backlinks, socialShares, similarSites,
    audienceInterests, techStack, seoHealthScore,
  };
}

const RESEARCH_LINK_TEXT: Record<Lang, { label: string; platform: string; hint: string }[]> = {
  ru: [
    { label: "SimilarWeb", platform: "SimilarWeb", hint: "Реальный бесплатный обзор трафика этого сайта" },
    { label: "Google Trends", platform: "Google Trends", hint: "Динамика интереса к бренду в поиске" },
    { label: "Ahrefs Backlink Checker", platform: "Ahrefs", hint: "Бесплатная проверка бэклинков и рефералов" },
    { label: "SEMrush — обзор домена", platform: "SEMrush", hint: "Органические и платные ключевые слова" },
    { label: "BuiltWith", platform: "BuiltWith", hint: "Реальный технологический стек сайта" },
    { label: "Meta Ad Library", platform: "Facebook/Instagram Ads", hint: "Какую рекламу сейчас крутит этот бренд" },
    { label: "PageSpeed Insights", platform: "Google PageSpeed", hint: "Реальная скорость загрузки и Core Web Vitals" },
    { label: "WHOIS-запись", platform: "Who.is", hint: "Регистрация и возраст домена" },
  ],
  en: [
    { label: "SimilarWeb", platform: "SimilarWeb", hint: "A real, free traffic overview for this site" },
    { label: "Google Trends", platform: "Google Trends", hint: "Search interest in the brand over time" },
    { label: "Ahrefs Backlink Checker", platform: "Ahrefs", hint: "Free backlink and referring-domain check" },
    { label: "SEMrush — domain overview", platform: "SEMrush", hint: "Organic and paid keywords" },
    { label: "BuiltWith", platform: "BuiltWith", hint: "The site's real technology stack" },
    { label: "Meta Ad Library", platform: "Facebook/Instagram Ads", hint: "What ads this brand is running right now" },
    { label: "PageSpeed Insights", platform: "Google PageSpeed", hint: "Real load speed and Core Web Vitals" },
    { label: "WHOIS record", platform: "Who.is", hint: "Domain registration and age" },
  ],
};

const RESEARCH_LINK_URLS = (domain: string, enc: string): string[] => [
  `https://www.similarweb.com/website/${enc}/`,
  `https://trends.google.com/trends/explore?q=${enc}`,
  `https://ahrefs.com/backlink-checker/?input=${enc}&mode=domain`,
  `https://www.semrush.com/analytics/overview/?q=${enc}&searchType=domain`,
  `https://builtwith.com/${enc}`,
  `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${enc}&search_type=keyword_unordered`,
  `https://pagespeed.web.dev/report?url=${encodeURIComponent(`https://${domain}`)}`,
  `https://who.is/whois/${enc}`,
];

export function buildSiteResearchLinks(domain: string, lang: Lang = "ru"): ResearchLink[] {
  const enc = encodeURIComponent(domain);
  const urls = RESEARCH_LINK_URLS(domain, enc);
  return RESEARCH_LINK_TEXT[lang].map((entry, i) => ({ ...entry, url: urls[i] }));
}
