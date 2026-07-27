import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Container, LinkButton } from "./ui";
import { useLanguage, type Lang } from "../lib/i18n";

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink-950 dark:text-white" onClick={onClick}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700 font-display text-base font-semibold text-brand-50">
        S
      </span>
      Shopyfy
    </Link>
  );
}

function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();
  const other: Lang = lang === "ru" ? "en" : "ru";
  return (
    <button
      type="button"
      onClick={() => setLang(other)}
      title={t("lang.toggleLabel")}
      className={`inline-flex items-center gap-1 rounded-full border border-ink-300 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:border-brand-500 hover:text-brand-700 dark:border-ink-700 dark:text-ink-300 dark:hover:text-brand-400 ${className}`}
    >
      <span className={lang === "ru" ? "text-ink-950 dark:text-white" : "text-ink-400 dark:text-ink-600"}>RU</span>
      <span className="text-ink-300 dark:text-ink-700">/</span>
      <span className={lang === "en" ? "text-ink-950 dark:text-white" : "text-ink-400 dark:text-ink-600"}>EN</span>
    </button>
  );
}

const NAV: { to: string; key: string }[] = [
  { to: "/store-builder", key: "nav.storeBuilder" },
  { to: "/trends", key: "nav.trends" },
  { to: "/tools/site-analyzer", key: "nav.siteAnalyzer" },
  { to: "/tools/profit-calculator", key: "nav.calculator" },
  { to: "/tools/ad-copy", key: "nav.adCopy" },
  { to: "/saved", key: "nav.saved" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/80 backdrop-blur-lg dark:border-ink-800 dark:bg-ink-950/80">
      <Container className="flex h-16 items-center justify-between">
        <Logo onClick={() => setOpen(false)} />

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <a href="/#pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:text-ink-950 dark:text-ink-300 dark:hover:text-white">
            {t("nav.pricing")}
          </a>
          <LanguageToggle />
          <LinkButton href="/store-builder" className="!py-2.5">
            {t("nav.cta")}
          </LinkButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="rounded-lg p-2 text-ink-700 dark:text-ink-200"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("nav.openMenu")}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950">
          <Container className="flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300" : "text-ink-700 dark:text-ink-200"
                  }`
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
            <a href="/#pricing" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 dark:text-ink-200" onClick={() => setOpen(false)}>
              {t("nav.pricing")}
            </a>
            <LinkButton href="/store-builder" className="mt-2 w-full">
              {t("nav.cta")}
            </LinkButton>
          </Container>
        </div>
      )}
    </header>
  );
}
