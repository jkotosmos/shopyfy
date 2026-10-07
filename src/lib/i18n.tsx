import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

const STORAGE_KEY = "shopyfy_lang_v1";

const PAGE_META: Record<Lang, { title: string; description: string }> = {
  ru: {
    title: "Shopyfy — AI-конструктор магазина и поиск трендов для дропшипперов",
    description: "Shopyfy превращает любую ссылку на товар в готовый к продаже магазин Shopify: страницы от ИИ, допродажи и встроенный поиск трендов для дропшипперов.",
  },
  en: {
    title: "Shopyfy — AI Store Builder & Trend Research for Dropshippers",
    description: "Shopyfy turns any product link into a ready-to-sell Shopify store: AI-written pages, upsells, and built-in trend research for dropshippers.",
  },
};

// Module-level mirror of the current language so plain generator functions
// (generateStore, computeWinningScore, buildResearchLinks, …) can pick the
// right content pool without every call site having to thread a `lang`
// argument through. Only read at call time (inside event handlers/effects,
// never during render), so this doesn't break React's render purity rules.
let currentLang: Lang = "ru";
export function getLang(): Lang {
  return currentLang;
}

function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ru" || stored === "en") return stored;
  } catch {
    // ignore (private browsing, etc.)
  }
  return "ru";
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = PAGE_META[lang].title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", PAGE_META[lang].description);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const t = useMemo(() => {
    return (key: string): string => {
      const dict = TRANSLATIONS[lang];
      return dict[key] ?? TRANSLATIONS.ru[key] ?? key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang: setLangState, t }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

// Flat dictionary for static UI chrome (nav, buttons, disclaimers, page
// headers). Content-heavy arrays (feature lists, FAQ, pricing) live next to
// the page that owns them as Record<Lang, T[]>, since keying dozens of long
// strings individually here would be harder to maintain than to read.
export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  ru: {
    "nav.launchPlan": "План запуска",
    "nav.storeBuilder": "Конструктор магазина",
    "nav.trends": "Поиск трендов",
    "nav.siteAnalyzer": "SEO-анализ сайта",
    "nav.calculator": "Калькулятор маржи",
    "nav.adCopy": "Тексты для рекламы",
    "nav.saved": "Сохранённое",
    "nav.pricing": "Тарифы",
    "nav.cta": "Попробовать бесплатно",
    "nav.openMenu": "Открыть меню",
    "nav.storeBuilderShort": "Конструктор",
    "nav.trendsShort": "Тренды",
    "nav.tools": "Инструменты",
    "nav.adBudget": "Бюджет теста рекламы",
    "nav.videoScript": "Сценарии видео-рекламы",
    "nav.policies": "Политики магазина",
    "nav.redeem": "Активировать промокод",
    "nav.ctaShort": "Начать",

    "footer.tagline": "Вставьте ссылку на товар — получите готовый магазин на Shopify, а заодно поиск трендов, расчёт цены и тексты для рекламы, чтобы реально продавать.",
    "footer.create": "Создать",
    "footer.research": "Исследование",
    "footer.company": "Компания",
    "footer.about": "О сервисе",
    "footer.contact": "Контакты",
    "footer.faqLink": "Вопросы и ответы",
    "footer.copyright": "Прототип для исследования товаров — баллы трендов иллюстративны, проверяйте по ссылкам на источники.",
    "footer.disclaimer": "Не аффилирован с Shopify Inc.",

    "lang.toggleLabel": "Язык",
  },
  en: {
    "nav.launchPlan": "Launch Plan",
    "nav.storeBuilder": "Store Builder",
    "nav.trends": "Trend Research",
    "nav.siteAnalyzer": "Site SEO Analyzer",
    "nav.calculator": "Margin Calculator",
    "nav.adCopy": "Ad Copy Generator",
    "nav.saved": "Saved",
    "nav.pricing": "Pricing",
    "nav.cta": "Try it free",
    "nav.openMenu": "Open menu",
    "nav.storeBuilderShort": "Builder",
    "nav.trendsShort": "Trends",
    "nav.tools": "Tools",
    "nav.adBudget": "Ad test budget",
    "nav.videoScript": "Video ad scripts",
    "nav.policies": "Store policies",
    "nav.redeem": "Activate promo code",
    "nav.ctaShort": "Start",

    "footer.tagline": "Paste a product link, get a ready-to-sell Shopify store — plus trend research, pricing math, and ad copy so it actually sells.",
    "footer.create": "Build",
    "footer.research": "Research",
    "footer.company": "Company",
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.faqLink": "FAQ",
    "footer.copyright": "A product-research prototype — trend scores are illustrative, verify against the source links.",
    "footer.disclaimer": "Not affiliated with Shopify Inc.",

    "lang.toggleLabel": "Language",
  },
};
