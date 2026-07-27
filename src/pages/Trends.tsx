import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, ExternalLink, BarChart3, Music2, Megaphone, Image as ImageIcon,
  Video, MessageCircle, ShoppingCart, ShoppingBag, Bookmark, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge, Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { buildResearchLinks, getTrendingNiches, type ResearchLink, type TrendingNiche } from "../lib/trends";
import { addSaved } from "../lib/storage";
import { useLanguage, type Lang } from "../lib/i18n";

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

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string; placeholder: string; submit: string;
  sourcesFor: string; sourcesHint: string;
  starterEyebrow: string; starterTitle: string; starterSub: string;
  all: string; showSources: string; hideSources: string; saveToWatchlist: string;
  signalLabel: string;
}> = {
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
  },
};

function LinkGrid({ links }: { links: ResearchLink[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {links.map((l) => {
        const Icon = PLATFORM_ICON[l.platform] ?? ExternalLink;
        return (
          <a
            key={l.platform}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 rounded-xl border border-ink-200 p-3 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-ink-700 dark:hover:bg-brand-950/20"
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
  const searchLinks = useMemo(() => (searched.trim() ? buildResearchLinks(searched, lang) : []), [searched, lang]);

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
              className="w-full rounded-xl border border-ink-200 bg-white py-3.5 pl-10 pr-4 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
          </div>
          <button type="submit" className="rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-900/15 hover:bg-brand-700 whitespace-nowrap">
            {tx.submit}
          </button>
        </form>
      </Container>

      {searched.trim() && (
        <Container className="mt-10 max-w-3xl">
          <Card>
            <h3 className="font-semibold text-ink-950 dark:text-white">{tx.sourcesFor} «{searched.trim()}»</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{tx.sourcesHint}</p>
            <div className="mt-4">
              <LinkGrid links={searchLinks} />
            </div>
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
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 text-ink-600 hover:border-brand-400 dark:border-ink-700 dark:text-ink-300"
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

                {open && (
                  <div className="mt-4 border-t border-ink-200 pt-4 dark:border-ink-800">
                    <LinkGrid links={buildResearchLinks(n.keyword, lang)} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
