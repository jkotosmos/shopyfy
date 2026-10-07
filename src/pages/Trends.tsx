import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, ExternalLink, BarChart3, Music2, Megaphone, Image as ImageIcon,
  Video, MessageCircle, ShoppingCart, ShoppingBag, Bookmark, ChevronDown, ChevronUp, Clock, Loader2, Info,
} from "lucide-react";
import { Badge, Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { buildResearchLinks, getTrendingNiches, estimateTopCountry, countryNameFromCode, type ResearchLink, type TrendingNiche, type TopCountry } from "../lib/trends";
import { generateAdLibraryEntries, type AdLibraryEntry } from "../lib/adLibrary";
import { fetchRealMarketData, isMarketDataBackendConfigured, type RealMarketData, type RealAd, type RealProduct } from "../lib/marketData";
import { addSaved } from "../lib/storage";
import { useLanguage, type Lang } from "../lib/i18n";
import { Stamp, type StampTone } from "../components/logistics";

const PLATFORM_ICON: Record<string, typeof Search> = {
  "Google Trends": BarChart3,
  TikTok: Music2,
  "Facebook/Instagram Ads": Megaphone,
  Pinterest: ImageIcon,
  YouTube: Video,
  Reddit: MessageCircle,
  AliExpress: ShoppingCart,
  Amazon: ShoppingBag,
};

interface TrendsText {
  eyebrow: string; title: string; sub: string; placeholder: string; submit: string;
  sourcesFor: string; sourcesHint: string;
  starterEyebrow: string; starterTitle: string; starterSub: string;
  all: string; showSources: string; hideSources: string; saveToWatchlist: string;
  signalLabel: string;
  adLibraryTitle: string; adLibraryDisclaimer: string; runningFor: string; days: string;
  realBadge: string; demoBadge: string; topCountryLabel: string; sellerCountryLabel: string; estimateLabel: string;
  realInterestLabel: string; realProductsTitle: string; runningSince: string; loadingReal: string;
  realListingsLabel: string; realAdCountLabel: string; productCountryHint: string;
  notConfiguredHint: string;
}

const TEXT: Record<Lang, TrendsText> = {
  ru: {
    eyebrow: "Поиск трендов",
    title: "Найдите, что популярно — и точно узнайте, откуда это известно",
    sub: "Ищите любой товар или нишу, чтобы получить ссылки на реальные источники трендов в один клик — Google Trends, TikTok, Meta Ad Library, Pinterest, YouTube, Reddit — плюс карточки поставщиков и розницы. Никаких баллов из чёрного ящика: каждое утверждение — в один клик от источника.",
    placeholder: "например, «корректор осанки» или «led лампа»…",
    submit: "Получить ссылки",
    sourcesFor: "Ссылки на источники по запросу", sourcesHint: "Открывает реальную страницу поиска/трендов по этому ключевому слову на каждой платформе.",
    starterEyebrow: "Стартовый список", starterTitle: "Трендовые ниши для старта",
    starterSub: "Баллы и цифры роста ниже — это иллюстративная отправная точка, а не данные в реальном времени: раскройте любую карточку, чтобы перейти к живым источникам и проверить актуальные цифры самостоятельно.",
    all: "Все", showSources: "Показать источники", hideSources: "Скрыть источники", saveToWatchlist: "Сохранить в вотчлист",
    signalLabel: "Сигнал",
    adLibraryTitle: "Примеры активной рекламы", runningFor: "Активна", days: "дн.",
    adLibraryDisclaimer: "Иллюстративные примеры в стиле типичных объявлений в этой нише — не реальные объявления. Нажмите на карточку, чтобы открыть настоящий поиск по Meta Ad Library и увидеть, что крутится на самом деле.",
    realBadge: "Реально", demoBadge: "Демо", topCountryLabel: "Чаще всего ищут в", sellerCountryLabel: "Продавцы чаще всего из", estimateLabel: "оценка",
    realInterestLabel: "реальный интерес в поиске (Google Trends, 90 дней)", realProductsTitle: "Реальные товары (eBay)",
    runningSince: "Показывается с", loadingReal: "Загружаем реальные данные…",
    realListingsLabel: "реальных объявлений найдено на eBay", realAdCountLabel: "активных объявлений в Meta Ad Library прямо сейчас (США/Великобритания/Канада/Австралия)",
    productCountryHint: "Продавец из",
    notConfiguredHint: "Чтобы видеть здесь реальные данные вместо иллюстративных примеров, разверните бэкенд из server/ и настройте бесплатные EBAY_APP_ID/EBAY_CERT_ID и META_ADS_APP_ID/META_ADS_APP_SECRET (оба без какой-либо оплаты) — см. server/README.md. SERPAPI_KEY для Google Trends не обязателен и не бесплатен после небольшого пробного лимита.",
  },
  en: {
    eyebrow: "Trend Research",
    title: "Find what's popular — and know exactly how you know",
    sub: "Search any product or niche to get one-click links to real trend sources — Google Trends, TikTok, Meta Ad Library, Pinterest, YouTube, Reddit — plus supplier and retail listings. No black-box scores: every claim is one click from its source.",
    placeholder: "e.g. \"posture corrector\" or \"led lamp\"…",
    submit: "Get links",
    sourcesFor: "Source links for", sourcesHint: "Opens the real search/trends page for this keyword on each platform.",
    starterEyebrow: "Starter list", starterTitle: "Trending niches to start from",
    starterSub: "The scores and growth figures below are an illustrative starting point, not real-time data — expand any card to jump to live sources and verify current numbers yourself.",
    all: "All", showSources: "Show sources", hideSources: "Hide sources", saveToWatchlist: "Save to watchlist",
    signalLabel: "Signal",
    adLibraryTitle: "Example ads currently running", runningFor: "Running for", days: "days",
    adLibraryDisclaimer: "Illustrative examples styled after typical ads in this niche — not real ads. Click a card to open a real Meta Ad Library search and see what's actually running.",
    realBadge: "Real", demoBadge: "Demo", topCountryLabel: "Most searched in", sellerCountryLabel: "Sellers most often based in", estimateLabel: "estimate",
    realInterestLabel: "real search interest (Google Trends, 90 days)", realProductsTitle: "Real products (eBay)",
    runningSince: "Running since", loadingReal: "Loading real data…",
    realListingsLabel: "real listings found on eBay", realAdCountLabel: "active ads in Meta Ad Library right now (US/UK/CA/AU)",
    productCountryHint: "Seller based in",
    notConfiguredHint: "To see real data here instead of illustrative examples, deploy the backend in server/ and configure the free EBAY_APP_ID/EBAY_CERT_ID and META_ADS_APP_ID/META_ADS_APP_SECRET (both cost nothing) — see server/README.md. SERPAPI_KEY for Google Trends is optional and isn't free beyond a small trial quota.",
  },
};

// Real vs illustrative data is marked with a rubber stamp: violet "official"
// ink for real data, orange for demo, brown for estimates.
function RealBadge({ label, tone = "real" }: { label: string; tone?: StampTone }) {
  return (
    <Stamp tone={tone} rotate={tone === "real" ? -3 : 3} className="mx-1">
      {label}
    </Stamp>
  );
}

function countryCodeToFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Real signal, free of charge: the most common seller/listing country
// among actual eBay search results for this keyword.
function mostCommonCountryCode(products: RealProduct[]): string | null {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (!p.countryCode) continue;
    counts.set(p.countryCode, (counts.get(p.countryCode) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [code, count] of counts) {
    if (count > bestCount) {
      best = code;
      bestCount = count;
    }
  }
  return best;
}

function LinkGrid({ links }: { links: ResearchLink[] }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {links.map((l) => {
        const Icon = PLATFORM_ICON[l.platform] ?? ExternalLink;
        return (
          <a
            key={l.platform}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 items-start gap-3 rounded-xl border border-ink-200 p-3 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-ink-700 dark:hover:bg-brand-950/20"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
              <Icon size={15} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-medium text-ink-900 dark:text-white">
                {l.label} <ExternalLink size={12} className="shrink-0 opacity-0 group-hover:opacity-100" />
              </span>
              <span className="block truncate text-xs text-ink-500 dark:text-ink-400">{l.hint}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

function metaAdLibraryUrl(keyword: string): string {
  return `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(keyword.trim())}&search_type=keyword_unordered`;
}

function AdLibraryGrid({ entries, tx, keyword }: { entries: AdLibraryEntry[]; tx: TrendsText; keyword: string }) {
  const verifyUrl = metaAdLibraryUrl(keyword);
  return (
    <div className="mt-4">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
        <Megaphone size={13} /> {tx.adLibraryTitle} <RealBadge label={tx.demoBadge} tone="demo" />
      </h4>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <a
            key={entry.libraryId}
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-ink-200 p-3 text-xs transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-ink-700 dark:hover:bg-brand-950/20"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-ink-400">
              <span className="min-w-0 break-all">ID {entry.libraryId}</span>
              <span className="ml-auto flex shrink-0 items-center gap-1"><Clock size={11} /> {tx.runningFor} {entry.activeDays} {tx.days}</span>
            </div>
            <p className="mt-1.5 flex items-center gap-1 font-semibold text-ink-900 dark:text-white">
              {entry.advertiserName}
              <ExternalLink size={11} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </p>
            <p className="mt-1 line-clamp-3 text-ink-500 dark:text-ink-400">{entry.primaryText}</p>
            <div className="mt-2 rounded-lg bg-ink-50 p-2 dark:bg-ink-800/60">
              <p className="text-[10px] uppercase tracking-wide text-ink-400">{entry.format}</p>
              <p className="mt-0.5 font-medium text-ink-800 dark:text-ink-200">{entry.headline}</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {entry.platforms.map((p) => (
                <span key={p} className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500 dark:bg-ink-800 dark:text-ink-400">{p}</span>
              ))}
              <span className="ml-auto shrink-0 rounded-md bg-ink-900 px-2 py-1 text-[10px] font-semibold text-white dark:bg-white dark:text-ink-950">{entry.cta}</span>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-2 text-xs italic text-ink-400">{tx.adLibraryDisclaimer}</p>
    </div>
  );
}

function RealAdsGrid({ ads, tx, lang, keyword }: { ads: RealAd[]; tx: TrendsText; lang: Lang; keyword: string }) {
  const locale = lang === "en" ? "en-US" : "ru-RU";
  const verifyUrl = metaAdLibraryUrl(keyword);
  return (
    <div className="mt-4">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
        <Megaphone size={13} /> {tx.adLibraryTitle} <RealBadge label={tx.realBadge} />
      </h4>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad, i) => (
          <a
            key={i}
            href={ad.snapshotUrl ?? verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl border border-ink-200 p-3 text-xs transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-ink-700 dark:hover:bg-brand-950/20"
          >
            <p className="flex items-center gap-1 font-semibold text-ink-900 dark:text-white">
              {ad.pageName}
              <ExternalLink size={11} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </p>
            {ad.body && <p className="mt-1 line-clamp-3 text-ink-500 dark:text-ink-400">{ad.body}</p>}
            {ad.platforms.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {ad.platforms.map((p) => (
                  <span key={p} className="rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500 dark:bg-ink-800 dark:text-ink-400">{p}</span>
                ))}
              </div>
            )}
            {ad.startDate && <p className="mt-1.5 text-ink-400">{tx.runningSince} {new Date(ad.startDate).toLocaleDateString(locale)}</p>}
          </a>
        ))}
      </div>
    </div>
  );
}

function MarketDataPanel({ keyword, lang, tx }: { keyword: string; lang: Lang; tx: TrendsText }) {
  const [data, setData] = useState<RealMarketData | null>(null);
  const [loading, setLoading] = useState(isMarketDataBackendConfigured());

  useEffect(() => {
    let cancelled = false;
    if (!isMarketDataBackendConfigured()) return;
    setLoading(true);
    fetchRealMarketData(keyword).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [keyword]);

  const locale = lang === "en" ? "en-US" : "ru-RU";

  // Prefer the eBay-derived real seller country (free, no paid keys) over
  // Google Trends' real search-interest country (needs paid SerpApi),
  // falling back to an illustrative estimate when neither is available.
  const ebayCountryCode = data?.products ? mostCommonCountryCode(data.products.items) : null;
  const realTrendsCountry = data?.trends?.topCountries?.[0];
  const topCountry: TopCountry = ebayCountryCode
    ? { flag: countryCodeToFlag(ebayCountryCode), name: countryNameFromCode(ebayCountryCode, lang), source: "ebay" }
    : realTrendsCountry
    ? { flag: countryCodeToFlag(realTrendsCountry.countryCode), name: realTrendsCountry.country, source: "trends" }
    : estimateTopCountry(keyword, lang);
  const countryLabel = topCountry.source === "ebay" ? tx.sellerCountryLabel : tx.topCountryLabel;

  return (
    <div className="mt-4 border-t border-ink-200 pt-4 dark:border-ink-800">
      <LinkGrid links={buildResearchLinks(keyword, lang)} />

      <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-600 dark:text-ink-300">
        <span>{topCountry.flag}</span> {countryLabel}: <strong className="text-ink-900 dark:text-white">{topCountry.name}</strong>
        {topCountry.source !== "estimate" ? <RealBadge label={tx.realBadge} /> : <RealBadge label={tx.estimateLabel} tone="estimate" />}
      </p>

      {loading && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400"><Loader2 size={12} className="animate-spin" /> {tx.loadingReal}</p>
      )}

      {data?.trends && (
        <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
          <strong className="text-ink-900 dark:text-white">{data.trends.averageInterest}/100</strong> {tx.realInterestLabel} <RealBadge label={tx.realBadge} />
        </p>
      )}

      {data?.products && (
        <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
          <strong className="text-ink-900 dark:text-white">{data.products.totalListings.toLocaleString(locale)}</strong> {tx.realListingsLabel} <RealBadge label={tx.realBadge} />
        </p>
      )}

      {data?.ads && (
        <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
          <strong className="text-ink-900 dark:text-white">{data.ads.activeAdCount}{data.ads.hasMore ? "+" : ""}</strong> {tx.realAdCountLabel} <RealBadge label={tx.realBadge} />
        </p>
      )}

      {data?.products && data.products.items.length > 0 && (
        <div className="mt-4">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <ShoppingBag size={13} /> {tx.realProductsTitle} <RealBadge label={tx.realBadge} />
          </h4>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {data.products.items.slice(0, 4).map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-ink-200 p-2 text-xs transition-colors hover:border-brand-400 dark:border-ink-700"
              >
                {p.image && <img src={p.image} alt="" className="mb-2 h-20 w-full rounded-lg object-cover" />}
                <p className="line-clamp-2 font-medium text-ink-800 dark:text-ink-200">{p.title}</p>
                {p.price != null && (
                  <p className="mt-1 font-semibold text-ink-950 dark:text-white">
                    {p.currency === "USD" ? "$" : `${p.currency ?? ""} `}{p.price.toFixed(2)}
                  </p>
                )}
                {p.countryCode && (
                  <p className="mt-1 text-[10px] text-ink-400">{tx.productCountryHint} {countryCodeToFlag(p.countryCode)} {p.countryCode}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {data?.ads && data.ads.ads.length > 0 ? (
        <RealAdsGrid ads={data.ads.ads} tx={tx} lang={lang} keyword={keyword} />
      ) : (
        <AdLibraryGrid entries={generateAdLibraryEntries(keyword, lang)} tx={tx} keyword={keyword} />
      )}

      {!isMarketDataBackendConfigured() && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-400">
          <Info size={12} className="mt-0.5 shrink-0" /> {tx.notConfiguredHint}
        </p>
      )}
    </div>
  );
}

export function Trends() {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [searched, setSearched] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<string>(tx.all);
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const niches: TrendingNiche[] = useMemo(() => getTrendingNiches(lang), [lang]);
  const categories = useMemo(() => [tx.all, ...Array.from(new Set(niches.map((n) => n.category)))], [niches, tx.all]);
  const filtered = useMemo(
    () => niches.filter((n) => category === tx.all || n.category === category),
    [niches, category, tx.all],
  );

  useEffect(() => {
    setCategory(tx.all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearched(query);
  }

  function handleSaveNiche(n: TrendingNiche) {
    const note = lang === "en"
      ? `Trend score ${n.score}/100 · ${n.growth} · signal: ${n.signal}`
      : `Балл тренда ${n.score}/100 · ${n.growth} · сигнал: ${n.signal}`;
    addSaved({ name: n.name, category: n.category, note });
    setSavedIds((prev) => new Set(prev).add(n.id));
  }

  return (
    <div className="py-14">
      <Container className="max-w-3xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>

        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
          <div className="relative w-full">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tx.placeholder}
              className="w-full rounded-xl border-[1.5px] border-ink-950 bg-[#fffdf8] py-3.5 pl-10 pr-4 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
          </div>
          <button type="submit" className="press whitespace-nowrap rounded-md border-2 border-ink-950 bg-brand-400 px-5 py-3.5 font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-ink-950 hover:bg-brand-300 dark:border-brand-400">
            {tx.submit}
          </button>
        </form>
      </Container>

      {searched.trim() && (
        <Container className="mt-10 max-w-3xl">
          <Card>
            <h3 className="font-semibold text-ink-950 dark:text-white">{tx.sourcesFor} «{searched.trim()}»</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{tx.sourcesHint}</p>
            <MarketDataPanel keyword={searched.trim()} lang={lang} tx={tx} />
          </Card>
        </Container>
      )}

      <Container className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>{tx.starterEyebrow}</Eyebrow>
          <SectionTitle>{tx.starterTitle}</SectionTitle>
          <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">{tx.starterSub}</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-md border-[1.5px] px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] transition-colors ${
                category === c
                  ? "border-ink-950 bg-ink-950 text-[#fffdf8] dark:border-ink-100 dark:bg-ink-100 dark:text-ink-950"
                  : "border-ink-950/25 text-ink-700 hover:border-ink-950 dark:border-ink-600 dark:text-ink-300 dark:hover:border-ink-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => {
            const open = openId === n.id;
            return (
              <Card key={n.id} className="flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-2xl">{n.emoji}</div>
                  <Badge>{n.score}/100</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-ink-950 dark:text-white">{n.name}</h3>
                <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{n.growth}</p>
                <p className="mt-2 flex-1 text-sm text-ink-500 dark:text-ink-400">{n.blurb}</p>
                <p className="mt-2 text-xs italic text-ink-400">{tx.signalLabel}: {n.signal}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {n.platforms.map((p) => (
                    <span key={p} className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-300">{p}</span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : n.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-ink-200 py-2 text-xs font-semibold text-ink-700 hover:border-brand-400 dark:border-ink-700 dark:text-ink-200"
                  >
                    {open ? tx.hideSources : tx.showSources} {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveNiche(n)}
                    className="flex items-center justify-center rounded-lg border border-ink-200 px-3 text-ink-700 hover:border-brand-400 dark:border-ink-700 dark:text-ink-200"
                    aria-label={tx.saveToWatchlist}
                  >
                    <Bookmark size={14} className={savedIds.has(n.id) ? "fill-brand-500 text-brand-500" : ""} />
                  </button>
                </div>

                {open && <MarketDataPanel keyword={n.keyword} lang={lang} tx={tx} />}
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
