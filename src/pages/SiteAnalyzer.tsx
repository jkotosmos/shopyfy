import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, Globe, Clock, MousePointerClick, Percent, BarChart3, MapPin, KeyRound,
  Link2, Share2, Users, Layers, Bookmark, ExternalLink, TrendingUp, TrendingDown, Megaphone,
} from "lucide-react";
import { Badge, Button, Card, Container, Eyebrow, SectionTitle, Stat } from "../components/ui";
import { analyzeSite, buildSiteResearchLinks, formatCompact, type SiteReport, type KeywordRow } from "../lib/siteAnalyzer";
import { addSaved } from "../lib/storage";
import { nicheLabel } from "../lib/niches";
import { useLanguage, type Lang } from "../lib/i18n";
import type { ResearchLink } from "../lib/trends";

const EXAMPLES = ["gymshark.com", "chewy.com", "allbirds.com"];

const PLATFORM_ICON: Record<string, typeof Search> = {
  SimilarWeb: BarChart3,
  "Google Trends": BarChart3,
  Ahrefs: Link2,
  SEMrush: KeyRound,
  BuiltWith: Layers,
  "Facebook/Instagram Ads": Megaphone,
  "Google PageSpeed": TrendingUp,
  "Who.is": Globe,
};

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string; placeholder: string; submit: string; tryLabel: string;
  topGeo: string; saved: string; save: string;
  globalRank: string; countryRank: string; categoryRank: string; seoScore: string;
  visitsLastMonth: string; perMonth: string;
  avgDuration: string; pagesPerVisit: string; bounceRate: string;
  trafficSources: string; geography: string; otherCountries: string;
  topOrganic: string; topPaid: string; monthShort: string;
  backlinks: string; totalBacklinks: string; referringDomains: string; topReferring: string; authority: string;
  socialTraffic: string; similarSites: string; affinity: string;
  audienceInterests: string; audienceInterestsSub: string; techStack: string;
  verifySources: string; verifySourcesSub: string;
}> = {
  ru: {
    eyebrow: "SEO и анализ трафика конкурентов",
    title: "Узнайте, откуда любой сайт получает трафик — прежде чем конкурировать с ним",
    sub: "Введите домен конкурента или потенциального поставщика — получите отчёт в духе премиум-версии SimilarWeb: источники трафика, география, органические и платные ключевые слова, бэклинки, трафик из соцсетей, похожие сайты и технологический стек. Это демо-оценка на основе домена, а не живой фид — под отчётом есть ссылки на настоящие бесплатные инструменты, чтобы проверить фактические цифры.",
    placeholder: "например, gymshark.com", submit: "Проанализировать", tryLabel: "Попробуйте:",
    topGeo: "Топ-гео", saved: "Сохранено ✓", save: "Сохранить в вотчлист",
    globalRank: "Место в мире", countryRank: "Место в стране", categoryRank: "Место в категории", seoScore: "Оценка SEO-здоровья",
    visitsLastMonth: "визитов за последний месяц", perMonth: "за месяц",
    avgDuration: "средняя длительность визита", pagesPerVisit: "страниц за визит", bounceRate: "показатель отказов",
    trafficSources: "Источники трафика", geography: "География трафика", otherCountries: "Остальные страны",
    topOrganic: "Топ органических ключевых слов", topPaid: "Топ платных ключевых слов", monthShort: "мес",
    backlinks: "Бэклинки", totalBacklinks: "всего бэклинков", referringDomains: "ссылающихся доменов", topReferring: "Топ ссылающихся доменов", authority: "Авторитетность",
    socialTraffic: "Трафик из соцсетей", similarSites: "Похожие сайты", affinity: "схожесть",
    audienceInterests: "Интересы аудитории", audienceInterestsSub: "Какими ещё категориями сайтов интересуется эта же аудитория", techStack: "Технологический стек",
    verifySources: "Проверить по реальным источникам",
    verifySourcesSub: "Цифры выше — иллюстративная демо-оценка на основе домена, а не данные из панели SimilarWeb. Открывайте настоящие бесплатные инструменты ниже, чтобы получить фактические показатели по",
  },
  en: {
    eyebrow: "Competitor SEO & Traffic Analysis",
    title: "See where any site gets its traffic — before you compete with it",
    sub: "Enter a competitor's or potential supplier's domain to get a report in the spirit of premium SimilarWeb: traffic sources, geography, organic and paid keywords, backlinks, social traffic, similar sites, and tech stack. This is a domain-based demo estimate, not a live feed — the report links out to real free tools to verify actual numbers.",
    placeholder: "e.g. gymshark.com", submit: "Analyze", tryLabel: "Try:",
    topGeo: "Top geo", saved: "Saved ✓", save: "Save to watchlist",
    globalRank: "Global rank", countryRank: "Country rank", categoryRank: "Category rank", seoScore: "SEO health score",
    visitsLastMonth: "visits last month", perMonth: "MoM",
    avgDuration: "avg. visit duration", pagesPerVisit: "pages per visit", bounceRate: "bounce rate",
    trafficSources: "Traffic Sources", geography: "Traffic Geography", otherCountries: "Other countries",
    topOrganic: "Top Organic Keywords", topPaid: "Top Paid Keywords", monthShort: "mo",
    backlinks: "Backlinks", totalBacklinks: "total backlinks", referringDomains: "referring domains", topReferring: "Top referring domains", authority: "Authority",
    socialTraffic: "Social Traffic", similarSites: "Similar Sites", affinity: "affinity",
    audienceInterests: "Audience Interests", audienceInterestsSub: "What other site categories this same audience is into", techStack: "Tech Stack",
    verifySources: "Verify against real sources",
    verifySourcesSub: "The numbers above are an illustrative domain-based estimate, not data from the SimilarWeb dashboard. Open the real free tools below to get actual figures for",
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

function ShareBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-48 shrink-0 truncate text-sm text-ink-600 dark:text-ink-300">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="w-11 shrink-0 text-right text-sm font-semibold text-ink-900 dark:text-white">{pct}%</span>
    </div>
  );
}

function KeywordTable({ rows, showCpc, monthShort }: { rows: KeywordRow[]; showCpc?: boolean; monthShort: string }) {
  return (
    <div className="mt-3 divide-y divide-ink-100 dark:divide-ink-800">
      {rows.map((r) => (
        <div key={r.keyword} className="flex items-center justify-between gap-3 py-2 text-sm">
          <span className="min-w-0 truncate text-ink-700 dark:text-ink-200">{r.keyword}</span>
          <span className="flex shrink-0 items-center gap-3 text-xs text-ink-400">
            {showCpc && r.cpc && <span>CPC ~{r.cpc}</span>}
            <span>{r.monthlyVisitsEstimate}/{monthShort}</span>
            <span className="font-semibold text-ink-700 dark:text-ink-200">{r.trafficSharePct}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function SiteAnalyzer() {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const locale = lang === "en" ? "en-US" : "ru-RU";
  const [input, setInput] = useState(params.get("domain") ?? "");
  const [report, setReport] = useState<SiteReport | null>(null);
  const [saved, setSaved] = useState(false);
  const autoRan = useRef(false);
  const lastDomain = useRef<string>("");

  function runAnalysis(value: string) {
    if (!value.trim()) return;
    lastDomain.current = value;
    setSaved(false);
    setInput(value);
    setReport(analyzeSite(value));
  }

  useEffect(() => {
    const domainParam = params.get("domain");
    if (domainParam && !autoRan.current) {
      autoRan.current = true;
      runAnalysis(domainParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastDomain.current) runAnalysis(lastDomain.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runAnalysis(input);
  }

  function handleSave() {
    if (!report) return;
    const note = lang === "en"
      ? `SEO analysis: global rank #${report.overview.globalRank.toLocaleString(locale)} · ~${formatCompact(report.overview.monthlyVisits, lang)} visits/mo · SEO score ${report.seoHealthScore}/100`
      : `SEO-анализ: место в мире #${report.overview.globalRank.toLocaleString(locale)} · ~${formatCompact(report.overview.monthlyVisits, lang)} визитов/мес · оценка SEO ${report.seoHealthScore}/100`;
    addSaved({ name: report.domain, category: nicheLabel(report.niche, lang), note });
    setSaved(true);
  }

  const researchLinks = useMemo(() => (report ? buildSiteResearchLinks(report.domain, lang) : []), [report, lang]);

  return (
    <div className="py-14">
      <Container className="max-w-3xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex flex-col gap-2 sm:flex-row">
          <div className="relative w-full">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tx.placeholder}
              className="w-full rounded-xl border border-ink-200 bg-white py-3.5 pl-10 pr-4 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
          </div>
          <Button type="submit" className="whitespace-nowrap">{tx.submit}</Button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-ink-400">{tx.tryLabel}</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => runAnalysis(ex)}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-ink-500 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400"
            >
              {ex}
            </button>
          ))}
        </div>
      </Container>

      {report && (
        <Container className="mt-14 max-w-5xl animate-fade-up space-y-6">
          {/* Overview */}
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{report.niche.emoji} {report.overview.category}</Badge>
                  <span className="text-xs font-medium text-ink-400">{tx.topGeo}: {report.overview.country}</span>
                </div>
                <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-ink-950 dark:text-white">
                  <Globe size={20} className="text-brand-500" /> {report.domain}
                </h3>
              </div>
              <Button variant={saved ? "secondary" : "outline"} onClick={handleSave}>
                <Bookmark size={15} /> {saved ? tx.saved : tx.save}
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat value={`#${report.overview.globalRank.toLocaleString(locale)}`} label={tx.globalRank} />
              <Stat value={`#${report.overview.countryRank.toLocaleString(locale)}`} label={tx.countryRank} />
              <Stat value={`#${report.overview.categoryRank}`} label={tx.categoryRank} />
              <Stat value={`${report.seoHealthScore}/100`} label={tx.seoScore} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-ink-200 pt-5 dark:border-ink-800">
              <div>
                <div className="text-2xl font-extrabold text-ink-950 dark:text-white">{formatCompact(report.overview.monthlyVisits, lang)}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{tx.visitsLastMonth}</div>
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  report.overview.visitsChangePct >= 0
                    ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                }`}
              >
                {report.overview.visitsChangePct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {report.overview.visitsChangePct >= 0 ? "+" : ""}
                {report.overview.visitsChangePct}% {tx.perMonth}
              </span>
            </div>
          </Card>

          {/* Engagement */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <Clock size={20} />
              </span>
              <div>
                <div className="text-xl font-bold text-ink-950 dark:text-white">{report.overview.avgVisitDuration}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{tx.avgDuration}</div>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <MousePointerClick size={20} />
              </span>
              <div>
                <div className="text-xl font-bold text-ink-950 dark:text-white">{report.overview.pagesPerVisit.toFixed(2)}</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{tx.pagesPerVisit}</div>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <Percent size={20} />
              </span>
              <div>
                <div className="text-xl font-bold text-ink-950 dark:text-white">{report.overview.bounceRatePct}%</div>
                <div className="text-xs text-ink-500 dark:text-ink-400">{tx.bounceRate}</div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><BarChart3 size={16} /> {tx.trafficSources}</h4>
              <div className="mt-4 space-y-3">
                {report.trafficSources.map((s) => <ShareBar key={s.label} label={s.label} pct={s.pct} />)}
              </div>
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><MapPin size={16} /> {tx.geography}</h4>
              <div className="mt-4 space-y-3">
                {report.countries.map((c) => <ShareBar key={c.label} label={`${c.flag} ${c.label}`} pct={c.pct} />)}
                <ShareBar label={tx.otherCountries} pct={report.otherCountriesPct} />
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><KeyRound size={16} /> {tx.topOrganic}</h4>
              <KeywordTable rows={report.organicKeywords} monthShort={tx.monthShort} />
            </Card>
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><KeyRound size={16} /> {tx.topPaid}</h4>
              <KeywordTable rows={report.paidKeywords} showCpc monthShort={tx.monthShort} />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Link2 size={16} /> {tx.backlinks}</h4>
              <div className="mt-3 flex gap-8">
                <div>
                  <div className="text-2xl font-extrabold text-ink-950 dark:text-white">{report.backlinks.totalBacklinks.toLocaleString(locale)}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">{tx.totalBacklinks}</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-ink-950 dark:text-white">{report.backlinks.referringDomains.toLocaleString(locale)}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">{tx.referringDomains}</div>
                </div>
              </div>
              <h5 className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{tx.topReferring}</h5>
              <div className="mt-2 space-y-2">
                {report.backlinks.topReferring.map((r) => (
                  <div key={r.domain} className="flex items-center justify-between text-sm">
                    <span className="text-ink-700 dark:text-ink-200">{r.domain}</span>
                    <span className="text-xs text-ink-400">{tx.authority} {r.authority}/100</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Share2 size={16} /> {tx.socialTraffic}</h4>
              <div className="mt-4 space-y-3">
                {report.socialShares.map((s) => <ShareBar key={s.label} label={s.label} pct={s.pct} />)}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Users size={16} /> {tx.similarSites}</h4>
              <div className="mt-3 space-y-2">
                {report.similarSites.map((s) => (
                  <button
                    key={s.domain}
                    type="button"
                    onClick={() => runAnalysis(s.domain)}
                    className="flex w-full items-center justify-between rounded-lg border border-ink-200 px-3 py-2 text-left text-sm hover:border-brand-400 dark:border-ink-700"
                  >
                    <span className="text-ink-700 dark:text-ink-200">{s.domain}</span>
                    <span className="text-xs text-ink-400">{s.affinityPct}% {tx.affinity}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h4 className="font-semibold text-ink-950 dark:text-white">{tx.audienceInterests}</h4>
              <p className="mt-1 text-xs text-ink-400">{tx.audienceInterestsSub}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.audienceInterests.map((a) => (
                  <span key={a} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">{a}</span>
                ))}
              </div>
            </Card>

            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Layers size={16} /> {tx.techStack}</h4>
              <div className="mt-3 space-y-2 text-sm">
                {report.techStack.map((t) => (
                  <div key={t.category} className="flex items-center justify-between gap-3">
                    <span className="text-ink-500 dark:text-ink-400">{t.category}</span>
                    <span className="text-right font-medium text-ink-900 dark:text-white">{t.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <h4 className="font-semibold text-ink-950 dark:text-white">{tx.verifySources}</h4>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
              {tx.verifySourcesSub} «{report.domain}».
            </p>
            <div className="mt-4">
              <LinkGrid links={researchLinks} />
            </div>
          </Card>
        </Container>
      )}
    </div>
  );
}
