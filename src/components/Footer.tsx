import { Link } from "react-router-dom";
import { Container } from "./ui";
import { Barcode, ParcelMark, Wordmark } from "./logistics";
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

const FOOTER_TEXT: Record<Lang, { endOfShipment: string; track: string }> = {
  ru: { endOfShipment: "Конец отправления", track: "Трек №" },
  en: { endOfShipment: "End of shipment", track: "Tracking no." },
};

export function Footer() {
  const { lang, t } = useLanguage();
  const links = FOOTER_LINKS[lang];
  const ft = FOOTER_TEXT[lang];

  return (
    <footer className="mt-10 text-[#ede7da]">
      {/* torn top edge, like the end of a receipt */}
      <div className="zigzag-top h-3 bg-ink-950 dark:bg-black" aria-hidden="true" />
      <div className="bg-ink-950 dark:bg-black">
        <Container className="pt-12 pb-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Link to="/" className="inline-flex items-center gap-2.5 text-[#fffdf8]" aria-label="Shopyfy">
                <ParcelMark className="h-9 w-9" />
                <Wordmark className="text-xl" />
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">{t("footer.tagline")}</p>

              <div className="mt-7 max-w-xs rounded-lg bg-[#fffdf8] p-3 text-ink-950">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                  <span>{ft.track}</span>
                  <span>SY 000 000 001 RU</span>
                </div>
                <Barcode value="shopyfy-footer" className="mt-2 h-10 w-full" />
                <p className="mt-1.5 text-center font-mono text-[10px] uppercase tracking-[0.3em]">{ft.endOfShipment}</p>
              </div>
            </div>

            <FooterCol title={t("footer.create")} links={links.create} className="lg:col-span-2" />
            <FooterCol title={t("footer.research")} links={links.research} className="lg:col-span-3" />
            <FooterCol title={t("footer.company")} links={links.company} className="lg:col-span-2" />
          </div>
        </Container>

        <div className="overflow-hidden" aria-hidden="true">
          <Container>
            <div className="select-none font-display text-[clamp(60px,16.5vw,198px)] font-black leading-[0.8] tracking-[-0.055em] text-brand-400">
              shopyfy
            </div>
          </Container>
        </div>

        <Container className="border-t border-white/10 py-5">
          <div className="flex flex-col gap-2 font-mono text-[11px] text-ink-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Shopyfy. {t("footer.copyright")}</p>
            <p className="shrink-0">{t("footer.disclaimer")}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, className = "" }: { title: string; links: { label: string; to: string }[]; className?: string }) {
  const linkClass = "text-sm text-ink-300 underline-offset-4 transition-colors hover:text-brand-400 hover:underline";
  return (
    <div className={className}>
      <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.to.startsWith("mailto:") || l.to.startsWith("http") || l.to.includes("#") ? (
              <a href={l.to} className={linkClass}>
                {l.label}
              </a>
            ) : (
              <Link to={l.to} className={linkClass}>
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
