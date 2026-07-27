import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, ExternalLink, BarChart3, Music2, Megaphone, Image as ImageIcon,
  Video, MessageCircle, ShoppingCart, ShoppingBag, Bookmark, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge, Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { buildResearchLinks, TRENDING_NICHES, type ResearchLink } from "../lib/trends";
import { addSaved } from "../lib/storage";

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
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [searched, setSearched] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const categories = useMemo(() => ["All", ...Array.from(new Set(TRENDING_NICHES.map((n) => n.category)))], []);
  const filtered = useMemo(
    () => TRENDING_NICHES.filter((n) => category === "All" || n.category === category),
    [category],
  );
  const searchLinks = useMemo(() => (searched.trim() ? buildResearchLinks(searched) : []), [searched]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearched(query);
  }

  function handleSaveNiche(n: (typeof TRENDING_NICHES)[number]) {
    addSaved({ name: n.name, category: n.category, note: `Trend score ${n.score}/100 · ${n.growth} · signal: ${n.signal}` });
    setSavedIds((prev) => new Set(prev).add(n.id));
  }

  return (
    <div className="py-14">
      <Container className="max-w-3xl text-center">
        <Eyebrow>Trend research</Eyebrow>
        <SectionTitle>Find what's popular — and see exactly where that came from</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">
          Search any product or niche to get one-click research links into the actual social/trend sources — Google
          Trends, TikTok, Meta Ad Library, Pinterest, YouTube, Reddit — plus supplier and retail listings. No black-box
          scores: every claim is one click from its source.
        </p>

        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
          <div className="relative w-full">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'posture corrector' or 'led lamp'…"
              className="w-full rounded-xl border border-ink-200 bg-white py-3.5 pl-10 pr-4 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
          </div>
          <button type="submit" className="rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 whitespace-nowrap">
            Get research links
          </button>
        </form>
      </Container>

      {searched.trim() && (
        <Container className="mt-10 max-w-3xl">
          <Card>
            <h3 className="font-semibold text-ink-950 dark:text-white">Research links for "{searched.trim()}"</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Opens the real search/trend page for this exact keyword on each platform.</p>
            <div className="mt-4">
              <LinkGrid links={searchLinks} />
            </div>
          </Card>
        </Container>
      )}

      <Container className="mt-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Starter list</Eyebrow>
          <SectionTitle>Trending niches to get you started</SectionTitle>
          <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
            Scores and growth figures below are illustrative starting points, not a live feed — expand any card to
            jump straight to the live sources and verify current numbers yourself.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-brand-500 bg-brand-500 text-white"
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
                <p className="mt-2 text-xs italic text-ink-400">Signal: {n.signal}</p>
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
                    {open ? "Hide sources" : "See sources"} {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveNiche(n)}
                    className="flex items-center justify-center rounded-lg border border-ink-200 px-3 text-ink-700 hover:border-brand-400 dark:border-ink-700 dark:text-ink-200"
                    aria-label="Save to watchlist"
                  >
                    <Bookmark size={14} className={savedIds.has(n.id) ? "fill-brand-500 text-brand-500" : ""} />
                  </button>
                </div>

                {open && (
                  <div className="mt-4 border-t border-ink-200 pt-4 dark:border-ink-800">
                    <LinkGrid links={buildResearchLinks(n.keyword)} />
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
