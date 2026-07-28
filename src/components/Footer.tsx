import { Link } from "react-router-dom";
import { Container } from "./ui";
import { useLanguage, type Lang } from "../lib/i18n";

const FOOTER_LINKS: Record<Lang, { create: { label: string; to: string }[]; research: { label: string; to: string }[]; company: { label: string; to: string }[] }> = {
  ru: {
    create: [
      { label: "План запуска", to: "/launch-plan" },
      { label: "AI-конструктор магазина", to: "/store-builder" },
      { label: "Тарифы", to: "/#pricing" },
      { label: "Активировать промокод", to: "/redeem" },
      { label: "Вопросы и ответы", to: "/#faq" },
    ],
    research: [
      { label: "Поиск трендов", to: "/trends" },
      { label: "SEO-анализ сайта", to: "/tools/site-analyzer" },
      { label: "Калькулятор маржи", to: "/tools/profit-calculator" },
      { label: "Калькулятор тестового бюджета", to: "/tools/ad-budget" },
      { label: "Генератор текстов для рекламы", to: "/tools/ad-copy" },
      { label: "Сценарии для видео-рекламы", to: "/tools/video-script" },
      { label: "Генератор политик магазина", to: "/tools/policy-generator" },
      { label: "Сохранённые товары", to: "/saved" },
    ],
    company: [
      { label: "О сервисе", to: "/#how-it-works" },
      { label: "Контакты", to: "mailto:hello@shopyfy.app" },
    ],
  },
  en: {
    create: [
      { label: "Launch Plan", to: "/launch-plan" },
      { label: "AI Store Builder", to: "/store-builder" },
      { label: "Pricing", to: "/#pricing" },
      { label: "Activate promo code", to: "/redeem" },
      { label: "FAQ", to: "/#faq" },
    ],
    research: [
      { label: "Trend Research", to: "/trends" },
      { label: "Site SEO Analyzer", to: "/tools/site-analyzer" },
      { label: "Margin Calculator", to: "/tools/profit-calculator" },
      { label: "Ad Test Budget Calculator", to: "/tools/ad-budget" },
      { label: "Ad Copy Generator", to: "/tools/ad-copy" },
      { label: "Video Ad Script Generator", to: "/tools/video-script" },
      { label: "Store Policy Generator", to: "/tools/policy-generator" },
      { label: "Saved Products", to: "/saved" },
    ],
    company: [
      { label: "About", to: "/#how-it-works" },
      { label: "Contact", to: "mailto:hello@shopyfy.app" },
    ],
  },
};

export function Footer() {
  const { lang, t } = useLanguage();
  const links = FOOTER_LINKS[lang];

  return (
    <footer className="border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink-950 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700 font-display text-base font-semibold text-brand-50">
                S
              </span>
              Shopyfy
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-500 dark:text-ink-400">{t("footer.tagline")}</p>
          </div>

          <FooterCol title={t("footer.create")} links={links.create} />
          <FooterCol title={t("footer.research")} links={links.research} />
          <FooterCol title={t("footer.company")} links={links.company} />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-200 pt-6 text-xs text-ink-400 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shopyfy. {t("footer.copyright")}</p>
          <p>{t("footer.disclaimer")}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink-950 dark:text-white">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.to.startsWith("mailto:") || l.to.startsWith("http") ? (
              <a href={l.to} className="text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400">
                {l.label}
              </a>
            ) : (
              <Link to={l.to} className="text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
