import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu, X, ChevronDown, Search, Calculator, Wallet, MessageSquareText, Clapperboard, Scale, Bookmark, ArrowRight,
} from "lucide-react";
import { Container, LinkButton } from "./ui";
import { ParcelMark, Wordmark } from "./logistics";
import { useLanguage, type Lang } from "../lib/i18n";

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5 text-ink-950 dark:text-white" onClick={onClick} aria-label="Shopyfy">
      <ParcelMark className="h-9 w-9 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-6" />
      <Wordmark className="text-[19px]" />
    </Link>
  );
}

function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  const options: Lang[] = ["ru", "en"];
  return (
    <div
      role="group"
      aria-label={t("lang.toggleLabel")}
      className={`inline-flex overflow-hidden rounded-md border-[1.5px] border-ink-950 font-mono text-[11px] font-bold dark:border-ink-400 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={`px-2 py-1.5 uppercase tracking-[0.1em] transition-colors ${
            lang === option
              ? "bg-ink-950 text-[#fffdf8] dark:bg-ink-100 dark:text-ink-950"
              : "text-ink-500 hover:text-ink-950 dark:text-ink-400 dark:hover:text-white"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

const PRIMARY_NAV: { to: string; key: string }[] = [
  { to: "/launch-plan", key: "nav.launchPlan" },
  { to: "/store-builder", key: "nav.storeBuilderShort" },
  { to: "/trends", key: "nav.trendsShort" },
];

const TOOLS_NAV: { to: string; key: string; icon: typeof Search }[] = [
  { to: "/tools/site-analyzer", key: "nav.siteAnalyzer", icon: Search },
  { to: "/tools/profit-calculator", key: "nav.calculator", icon: Calculator },
  { to: "/tools/ad-budget", key: "nav.adBudget", icon: Wallet },
  { to: "/tools/ad-copy", key: "nav.adCopy", icon: MessageSquareText },
  { to: "/tools/video-script", key: "nav.videoScript", icon: Clapperboard },
  { to: "/tools/policy-generator", key: "nav.policies", icon: Scale },
  { to: "/saved", key: "nav.saved", icon: Bookmark },
];

function navIndex(i: number) {
  return String(i + 1).padStart(2, "0");
}

function ToolsMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const toolActive = TOOLS_NAV.some((item) => location.pathname === item.to);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1.5 rounded-md px-3 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.08em] transition-colors ${
          toolActive || open
            ? "bg-ink-950 text-[#fffdf8] dark:bg-ink-100 dark:text-ink-950"
            : "text-ink-700 hover:bg-ink-950/5 dark:text-ink-200 dark:hover:bg-white/5"
        }`}
      >
        <span className={toolActive || open ? "text-brand-400 dark:text-brand-600" : "text-ink-400"}>{navIndex(PRIMARY_NAV.length)}</span>
        {t("nav.tools")}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="surface-label animate-stick absolute left-0 top-[calc(100%+12px)] z-50 w-[min(560px,90vw)] rounded-2xl border-2 border-ink-950 p-2 shadow-[6px_6px_0_0_var(--color-ink-950)] dark:border-ink-600 dark:shadow-[6px_6px_0_0_#000]" style={{ "--stick-rot": "0deg" } as CSSProperties}>
          <p className="caption px-3 pb-2 pt-2">{t("nav.tools")} · {TOOLS_NAV.length}</p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {TOOLS_NAV.map((item, i) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg border-[1.5px] px-3 py-2.5 transition-colors ${
                      isActive
                        ? "border-ink-950 bg-brand-400 text-ink-950"
                        : "border-transparent text-ink-800 hover:border-ink-950 dark:text-ink-100 dark:hover:border-ink-400"
                    }`
                  }
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink-950 bg-[#fffdf8] text-ink-950 dark:border-ink-400 dark:bg-ink-800 dark:text-ink-100">
                    <item.icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-tight">{t(item.key)}</span>
                  <span className="font-mono text-[10px] text-ink-400 group-hover:text-ink-950 dark:group-hover:text-white">T-{navIndex(i)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="surface-paper sticky top-0 z-40 border-b-2 border-ink-950 dark:border-ink-700">
      <Container className="flex h-[68px] items-center justify-between gap-4">
        <Logo onClick={() => setOpen(false)} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {PRIMARY_NAV.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.08em] transition-colors ${
                  isActive
                    ? "bg-ink-950 text-[#fffdf8] dark:bg-ink-100 dark:text-ink-950"
                    : "text-ink-700 hover:bg-ink-950/5 dark:text-ink-200 dark:hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-brand-400 dark:text-brand-600" : "text-ink-400"}>{navIndex(i)}</span>
                  {t(item.key)}
                </>
              )}
            </NavLink>
          ))}
          <ToolsMenu />
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/#pricing"
            className="hidden font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink-700 underline-offset-4 hover:text-ink-950 hover:underline xl:inline dark:text-ink-200 dark:hover:text-white"
          >
            {t("nav.pricing")}
          </a>
          <LanguageToggle />
          <LinkButton href="/store-builder" className="!px-4 !py-2.5">
            <span className="xl:hidden">{t("nav.ctaShort")}</span>
            <span className="hidden xl:inline">{t("nav.cta")}</span>
            <ArrowRight size={15} />
          </LinkButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border-[1.5px] border-ink-950 text-ink-950 dark:border-ink-400 dark:text-ink-100"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("nav.openMenu")}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="surface-paper max-h-[calc(100dvh-68px)] overflow-y-auto border-t-2 border-ink-950 lg:hidden dark:border-ink-700">
          <Container className="py-4">
            <ul className="divide-y-[1.5px] divide-dashed divide-ink-300 dark:divide-ink-700">
              {PRIMARY_NAV.map((item, i) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-baseline gap-3 py-3 font-display text-xl font-bold tracking-[-0.02em] ${isActive ? "text-brand-600 dark:text-brand-400" : "text-ink-950 dark:text-white"}`
                    }
                  >
                    <span className="font-mono text-xs font-bold text-ink-400">{navIndex(i)}</span>
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <p className="caption mt-5 mb-2">{navIndex(PRIMARY_NAV.length)} · {t("nav.tools")}</p>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {TOOLS_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg border-[1.5px] px-3 py-2.5 text-sm font-medium ${
                        isActive ? "border-ink-950 bg-brand-400 text-ink-950" : "surface-label border-ink-950 text-ink-900 dark:border-ink-700 dark:text-ink-100"
                      }`
                    }
                  >
                    <item.icon size={16} className="shrink-0" />
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-3">
              <a href="/#pricing" className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink-700 dark:text-ink-200" onClick={() => setOpen(false)}>
                {t("nav.pricing")} →
              </a>
              <LinkButton href="/store-builder" className="w-full">
                {t("nav.cta")} <ArrowRight size={15} />
              </LinkButton>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
