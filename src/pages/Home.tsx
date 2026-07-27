import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, Wand2, LayoutTemplate, FileText, PackagePlus, ShoppingCart, UploadCloud,
  Clock, DollarSign, TrendingUp, Calculator, MessageSquareText, Bookmark, Search,
  ChevronDown, Check, Link2, BrainCircuit, Sparkles, Loader2, KeyRound,
} from "lucide-react";
import { Badge, Button, Card, Container, Eyebrow, LinkButton, Modal, SectionTitle, Stat } from "../components/ui";
import { useLanguage, type Lang } from "../lib/i18n";
import { startCheckout, type Plan } from "../lib/payments";
import { getBackendUrl } from "../lib/backend";

const STEPS: Record<Lang, { icon: typeof Link2; title: string; body: string }[]> = {
  ru: [
    { icon: Link2, title: "Вставьте ссылку на товар", body: "Ссылка на товар с AliExpress, Amazon, Alibaba или Shopify — или просто название товара." },
    { icon: BrainCircuit, title: "ИИ анализирует товар и рынок", body: "Разбираем карточку товара, определяем нишу, оцениваем себестоимость/маржу, спрос и конкуренцию." },
    { icon: Wand2, title: "Магазин собирается автоматически", body: "Главная страница, страницы товаров, коллекции, кастомные секции, тексты и допродажи — с нуля под этот товар." },
    { icon: UploadCloud, title: "Импорт и доработка", body: "Переносите в Shopify и меняйте что угодно — текст, изображения, цвета, структуру — без кода." },
  ],
  en: [
    { icon: Link2, title: "Paste a product link", body: "A product page from AliExpress, Amazon, Alibaba, or Shopify — or just a product name." },
    { icon: BrainCircuit, title: "AI analyzes the product and market", body: "We parse the listing, detect the niche, and estimate cost/margin, demand, and competition." },
    { icon: Wand2, title: "The store builds itself", body: "Homepage, product pages, collections, custom sections, copy, and upsells — built from scratch for this product." },
    { icon: UploadCloud, title: "Import and refine", body: "Push it to Shopify and change anything — copy, images, colors, structure — no code." },
  ],
};

const CORE_FEATURES: Record<Lang, { icon: typeof Wand2; title: string; body: string }[]> = {
  ru: [
    { icon: Wand2, title: "AI-конструктор магазина", body: "Собирает полноценный магазин — не типовой шаблон — под конкретный товар, который вы указали." },
    { icon: LayoutTemplate, title: "AI-конструктор страниц", body: "Секции с текстами от ИИ, которые можно мгновенно менять местами без кода." },
    { icon: FileText, title: "Генератор страниц товара", body: "Конверсионные страницы товара с текстом на пользе, таблицами сравнения и блоками FAQ." },
    { icon: PackagePlus, title: "Комплект-допродажи (Bundle)", body: "Автоматические предложения «купи больше — сэкономь больше» под цену конкретного товара." },
    { icon: ShoppingCart, title: "Допродажи в корзине", body: "Сопутствующие товары в корзине для увеличения среднего чека." },
    { icon: UploadCloud, title: "Импорт в Shopify в один клик", body: "Переносите готовый магазин прямо в админку Shopify — там его можно полностью редактировать." },
  ],
  en: [
    { icon: Wand2, title: "AI Store Builder", body: "Builds a full store — not a generic template — around the specific product you gave it." },
    { icon: LayoutTemplate, title: "AI Page Builder", body: "AI-written sections you can reorder instantly, no code required." },
    { icon: FileText, title: "Product Page Generator", body: "Conversion-focused product pages with benefit-driven copy, comparison tables, and FAQ blocks." },
    { icon: PackagePlus, title: "Bundle Upsells", body: "Automatic 'buy more, save more' offers sized to the specific product's price." },
    { icon: ShoppingCart, title: "Cart Upsells", body: "Complementary add-ons at checkout to lift average order value." },
    { icon: UploadCloud, title: "One-click Shopify import", body: "Push the finished store straight into the Shopify admin — fully editable there." },
  ],
};

const EXTRA_TOOLS: Record<Lang, { icon: typeof TrendingUp; title: string; body: string; to: string; cta: string }[]> = {
  ru: [
    { icon: TrendingUp, title: "Поиск трендовых товаров", body: "Подборка трендовых ниш плюс универсальный поиск по ключевому слову — каждое утверждение ведёт на Google Trends, TikTok, Meta Ad Library, Pinterest и другие источники, чтобы вы могли всё проверить сами.", to: "/trends", cta: "Смотреть тренды" },
    { icon: Search, title: "SEO-анализ сайта конкурента", body: "Отчёт в духе премиум-версии SimilarWeb: источники трафика, гео, органические и платные ключевые слова, бэклинки, соцсети, похожие сайты и технологии — по любому домену.", to: "/tools/site-analyzer", cta: "Проанализировать сайт" },
    { icon: Calculator, title: "Калькулятор маржи", body: "Учитывает себестоимость у поставщика, доставку, комиссию платёжки и расходы на рекламу, чтобы показать реальную маржу — или цену, нужную для целевой маржи.", to: "/tools/profit-calculator", cta: "Посчитать" },
    { icon: MessageSquareText, title: "Генератор рекламных текстов", body: "Пять рекламных ракурсов (любопытство, срочность, соцдоказательство, до/после…) плюс готовые хэштеги для TikTok и Instagram.", to: "/tools/ad-copy", cta: "Сгенерировать текст" },
    { icon: Bookmark, title: "Вотчлист сохранённых товаров", body: "Сохраняйте товары, которые изучаете, с заметками — хранится локально в браузере, аккаунт не нужен.", to: "/saved", cta: "Открыть вотчлист" },
  ],
  en: [
    { icon: TrendingUp, title: "Trending product research", body: "A curated list of trending niches plus a universal keyword search — every claim links out to Google Trends, TikTok, Meta Ad Library, Pinterest, and more so you can verify it yourself.", to: "/trends", cta: "See trends" },
    { icon: Search, title: "Competitor site SEO analysis", body: "A report in the spirit of premium SimilarWeb: traffic sources, geography, organic and paid keywords, backlinks, social traffic, similar sites, and tech stack — for any domain.", to: "/tools/site-analyzer", cta: "Analyze a site" },
    { icon: Calculator, title: "Margin calculator", body: "Factors in supplier cost, shipping, payment fees, and ad spend to show real margin — or the price you'd need for a target margin.", to: "/tools/profit-calculator", cta: "Calculate" },
    { icon: MessageSquareText, title: "Ad copy generator", body: "Five ad angles (curiosity, urgency, social proof, before/after…) plus ready-made hashtags for TikTok and Instagram.", to: "/tools/ad-copy", cta: "Generate copy" },
    { icon: Bookmark, title: "Saved products watchlist", body: "Save products you're researching with notes — stored locally in your browser, no account needed.", to: "/saved", cta: "Open watchlist" },
  ],
};

const DIFFERENTIATORS: Record<Lang, string[]> = {
  ru: [
    "Каждый магазин генерируется под конкретный товар, который вы указали, — а не переиспользует один и тот же шаблон для всех.",
    "ИИ проводит лёгкое маркетинговое исследование (ниша, сигнал спроса, конкуренция) прежде чем написать хоть слово текста.",
    "Всё сгенерированное остаётся полностью редактируемым: текст, изображения, цвета, структура и секции.",
    "Утверждения о трендах ведут прямо к источнику (Google Trends, TikTok, Meta Ads Library…), а не просят поверить чёрному ящику на слово.",
  ],
  en: [
    "Every store is generated around the specific product you gave it — not the same template reused for everyone.",
    "The AI does light market research (niche, demand signal, competition) before writing a single word of copy.",
    "Everything generated stays fully editable: copy, images, colors, structure, and sections.",
    "Trend claims link straight to the source (Google Trends, TikTok, Meta Ads Library…) instead of asking you to trust a black-box score.",
  ],
};

const FAQS: Record<Lang, { q: string; a: string }[]> = {
  ru: [
    { q: "Нужно ли уметь программировать?", a: "Нет. Магазин, страницы товаров и все инструменты Shopyfy собираются в визуальном редакторе без кода." },
    { q: "Какие ссылки на товары можно вставлять?", a: "Страницы товаров с AliExpress, Amazon и Alibaba, а также существующие ссылки на товары Shopify. Если ссылки пока нет, можно просто ввести название товара." },
    { q: "Данные о трендах в реальном времени?", a: "Подборка трендовых ниш — это иллюстративная отправная точка, явно помеченная как ориентировочная. Каждая карточка — и любое ваше ключевое слово — ведёт на реальный источник (Google Trends, TikTok, Meta Ad Library и т.д.), чтобы вы могли сами проверить актуальные цифры перед тем, как тратить деньги на рекламу." },
    { q: "Можно ли доработать сгенерированный магазин?", a: "Да — ничего не заблокировано. После генерации можно переписать текст, заменить изображения, поменять цвета и структуру, добавить или убрать секции." },
    { q: "Это заменяет найм дизайнера или разработчика?", a: "Для большинства стартовых магазинов — да: AI-конструктор магазина/страниц, блоки допродаж и генерация текстов закрывают то, для чего обычно нанимают небольшую команду." },
  ],
  en: [
    { q: "Do I need to know how to code?", a: "No. The store, product pages, and every Shopyfy tool are built in a visual editor with no code." },
    { q: "What product links can I paste?", a: "Product pages from AliExpress, Amazon, and Alibaba, plus existing Shopify product links. No link yet? Just type a product name." },
    { q: "Is the trend data real-time?", a: "The curated trending-niche list is an illustrative starting point, clearly labeled as such. Every card — and any keyword you search — links to a real source (Google Trends, TikTok, Meta Ad Library, etc.) so you can verify current numbers yourself before spending on ads." },
    { q: "Can I edit the generated store?", a: "Yes — nothing is locked. After generation you can rewrite copy, swap images, change colors and structure, and add or remove sections." },
    { q: "Does this replace hiring a designer or developer?", a: "For most starter stores, yes: the AI store/page builder, upsell blocks, and copy generation cover what a small team is usually hired for." },
  ],
};

const PRICING: Record<Lang, { plan: Plan; name: string; period: string; body: string; features: string[]; cta: string }[]> = {
  ru: [
    { plan: "starter", name: "Starter", period: "/мес", body: "Попробуйте AI-конструктор магазина и все инструменты исследования.", features: ["1 сгенерированный магазин", "Инструмент поиска трендов", "Калькулятор маржи", "Генератор рекламных текстов"], cta: "Начать бесплатно" },
    { plan: "growth", name: "Growth", period: "/мес", body: "Для дропшипперов, активно запускающих магазины.", features: ["Неограниченное число магазинов", "Импорт в Shopify в один клик", "Конструктор bundle- и cart-допродаж", "Вотчлист сохранённых товаров", "Приоритетная поддержка"], cta: "Купить Growth" },
    { plan: "pro", name: "Pro", period: "/мес", body: "Для команд, ведущих несколько магазинов.", features: ["Всё из Growth", "Несколько мест в команде", "Массовая генерация страниц товаров", "Библиотека кастомных секций"], cta: "Купить Pro" },
  ],
  en: [
    { plan: "starter", name: "Starter", period: "/mo", body: "Try the AI store builder and every research tool.", features: ["1 generated store", "Trend research tool", "Margin calculator", "Ad copy generator"], cta: "Start free" },
    { plan: "growth", name: "Growth", period: "/mo", body: "For dropshippers actively launching stores.", features: ["Unlimited stores", "One-click Shopify import", "Bundle & cart upsell builder", "Saved products watchlist", "Priority support"], cta: "Buy Growth" },
    { plan: "pro", name: "Pro", period: "/mo", body: "For teams running multiple stores.", features: ["Everything in Growth", "Multiple team seats", "Bulk product page generation", "Custom section library"], cta: "Buy Pro" },
  ],
};

const HOME_TEXT: Record<Lang, {
  heroBadge: string; heroTitlePrefix: string; heroTitleAccent: string; heroSub: string;
  heroPlaceholder: string; heroSubmit: string; heroNote: string;
  statStores: string; statSpeed: string; statHours: string; statSavings: string;
  howEyebrow: string; howTitle: string; stepLabel: string;
  featuresEyebrow: string; featuresTitle: string; featuresSub: string;
  toolsEyebrow: string; toolsTitle: string; toolsSub: string;
  benefitsEyebrow: string; benefitsTitle: string;
  benefitTimeTitle: string; benefitTimeBody: string;
  benefitConvTitle: string; benefitConvBody: string;
  benefitCostTitle: string; benefitCostBody: string;
  diffEyebrow: string; diffTitle: string; diffBody: string;
  pricingEyebrow: string; pricingTitle: string; mostPopular: string;
  havePromoCode: string; redeemLink: string;
  checkoutDemoTitle: string; checkoutDemoP1: string; checkoutDemoP2: string; checkoutDemoGotIt: string;
  checkoutError: string;
  faqEyebrow: string; faqTitle: string;
  ctaTitle: string; ctaSub: string; ctaButton: string;
}> = {
  ru: {
    heroBadge: "AI-конструктор магазина для дропшипперов",
    heroTitlePrefix: "Превратите любую ссылку на товар в магазин, который",
    heroTitleAccent: "продаёт",
    heroSub: "Вставьте ссылку с AliExpress, Amazon, Alibaba или Shopify. ИИ Shopyfy соберёт главную страницу, страницы товаров, допродажи и тексты — а затем вы импортируете всё прямо в Shopify.",
    heroPlaceholder: "Вставьте ссылку на товар (AliExpress, Amazon, Alibaba, Shopify)…",
    heroSubmit: "Собрать мой магазин",
    heroNote: "Регистрация для демо не нужна. Занимает около 10 секунд.",
    statStores: "созданных магазинов", statSpeed: "быстрее создание страниц", statHours: "экономии на магазин", statSavings: "экономии на найме",
    howEyebrow: "Как это работает", howTitle: "От ссылки до готового магазина за четыре шага", stepLabel: "ШАГ",
    featuresEyebrow: "Основные функции", featuresTitle: "Всё в одном приложении вместо пяти", featuresSub: "Тема, конструктор страниц и приложения для допродаж — заменены единым ИИ-процессом.",
    toolsEyebrow: "Не только конструктор магазина", toolsTitle: "Встроенное исследование рынка для дропшипперов", toolsSub: "Найдите, что в тренде, правильно посчитайте цену и напишите рекламу — ещё до того, как потратите хоть доллар.",
    benefitsEyebrow: "Почему это того стоит", benefitsTitle: "Время, деньги и конверсия — всё сразу",
    benefitTimeTitle: "Экономия времени", benefitTimeBody: "Создавайте страницы товаров до 15× быстрее и экономьте 40+ часов по сравнению с ручной сборкой магазина.",
    benefitConvTitle: "Рост конверсии", benefitConvBody: "Секции и текстовые паттерны, основанные на том, что работает у успешных e-commerce брендов.",
    benefitCostTitle: "Сокращение расходов", benefitCostBody: "Одно приложение заменяет несколько Shopify-приложений плюс услуги разработчика, дизайнера и копирайтера — часто это $100+/мес и $1 000+ на найме.",
    diffEyebrow: "Не очередной генератор шаблонов", diffTitle: "Построено вокруг вашего товара, а не переработанного макета",
    diffBody: "Обычные AI-конструкторы сайтов переиспользуют одну и ту же горстку шаблонов для всех. Shopyfy сначала анализирует конкретный товар и проводит лёгкое исследование рынка, поэтому структура, тексты и предложения реально соответствуют тому, что вы продаёте.",
    pricingEyebrow: "Тарифы", pricingTitle: "Начните бесплатно, обновитесь, когда начнёте продавать", mostPopular: "Самый популярный",
    havePromoCode: "Уже есть промокод?", redeemLink: "Активировать",
    checkoutDemoTitle: "Оплата", checkoutDemoGotIt: "Понятно",
    checkoutDemoP1: "В полноценном продукте эта кнопка ведёт на страницу оплаты Stripe. После оплаты промокод для активации тарифа приходит на email — деньги поступают напрямую на счёт владельца сайта, минуя нас.",
    checkoutDemoP2: "Этот прототип развёрнут без бэкенда для оплаты, поэтому здесь показано только объяснение процесса.",
    checkoutError: "Не удалось перейти к оплате.",
    faqEyebrow: "Вопросы и ответы", faqTitle: "Отвечаем на частые вопросы",
    ctaTitle: "Вставьте ссылку. Увидьте свой магазин за секунды.", ctaSub: "Без карты, без регистрации — демо работает полностью в вашем браузере.", ctaButton: "Собрать мой магазин",
  },
  en: {
    heroBadge: "AI store builder for dropshippers",
    heroTitlePrefix: "Turn any product link into a store that",
    heroTitleAccent: "sells",
    heroSub: "Paste a link from AliExpress, Amazon, Alibaba, or Shopify. Shopyfy's AI builds the homepage, product pages, upsells, and copy — then you import it straight into Shopify.",
    heroPlaceholder: "Paste a product link (AliExpress, Amazon, Alibaba, Shopify)…",
    heroSubmit: "Build my store",
    heroNote: "No signup needed for the demo. Takes about 10 seconds.",
    statStores: "stores generated", statSpeed: "faster page creation", statHours: "saved per store", statSavings: "saved on hiring",
    howEyebrow: "How it works", howTitle: "From link to finished store in four steps", stepLabel: "STEP",
    featuresEyebrow: "Core features", featuresTitle: "One app instead of five", featuresSub: "Theme, page builder, and upsell apps — replaced by a single AI process.",
    toolsEyebrow: "More than a store builder", toolsTitle: "Built-in market research for dropshippers", toolsSub: "Find what's trending, price it right, and write the ads — before you spend a single dollar.",
    benefitsEyebrow: "Why it's worth it", benefitsTitle: "Time, money, and conversion — all at once",
    benefitTimeTitle: "Save time", benefitTimeBody: "Build product pages up to 15× faster and save 40+ hours versus building a store by hand.",
    benefitConvTitle: "Higher conversion", benefitConvBody: "Sections and copy patterns based on what works for successful e-commerce brands.",
    benefitCostTitle: "Lower costs", benefitCostBody: "One app replaces several Shopify apps plus a developer, designer, and copywriter — often $100+/mo and $1,000+ in hiring.",
    diffEyebrow: "Not another template generator", diffTitle: "Built around your product, not a reworked layout",
    diffBody: "Typical AI site builders reuse the same handful of templates for everyone. Shopyfy analyzes the specific product first and does light market research, so the structure, copy, and offers actually match what you're selling.",
    pricingEyebrow: "Pricing", pricingTitle: "Start free, upgrade once you start selling", mostPopular: "Most popular",
    havePromoCode: "Already have a promo code?", redeemLink: "Activate it",
    checkoutDemoTitle: "Checkout", checkoutDemoGotIt: "Got it",
    checkoutDemoP1: "In a full product, this button goes to Stripe's payment page. After payment, a promo code to activate the plan is emailed to you — the money goes straight to the site owner's account, never through us.",
    checkoutDemoP2: "This prototype is deployed without a payments backend, so this is shown for explanation only.",
    checkoutError: "Couldn't start checkout.",
    faqEyebrow: "FAQ", faqTitle: "Frequently asked questions",
    ctaTitle: "Paste a link. See your store in seconds.", ctaSub: "No card, no signup — the demo runs entirely in your browser.", ctaButton: "Build my store",
  },
};

export function Home() {
  const [url, setUrl] = useState("");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const tx = HOME_TEXT[lang];

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/store-builder${url.trim() ? `?url=${encodeURIComponent(url.trim())}` : ""}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-500/10" />
        <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="flex justify-center animate-fade-up">
            <Badge>
              <Sparkles size={13} /> {tx.heroBadge}
            </Badge>
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink-950 dark:text-white sm:text-6xl animate-fade-up" style={{ animationDelay: "80ms" }}>
            {tx.heroTitlePrefix} <span className="italic text-brand-600 dark:text-brand-400">{tx.heroTitleAccent}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-600 dark:text-ink-300 animate-fade-up" style={{ animationDelay: "160ms" }}>
            {tx.heroSub}
          </p>

          <form onSubmit={handleGenerate} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row animate-fade-up" style={{ animationDelay: "240ms" }}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={tx.heroPlaceholder}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
            <Button type="submit" className="whitespace-nowrap">
              {tx.heroSubmit} <ArrowRight size={16} />
            </Button>
          </form>
          <p className="mt-3 text-xs text-ink-400">{tx.heroNote}</p>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat value={lang === "en" ? "10,000+" : "10 000+"} label={tx.statStores} />
            <Stat value="15×" label={tx.statSpeed} />
            <Stat value={lang === "en" ? "40+ hrs" : "40+ ч"} label={tx.statHours} />
            <Stat value={lang === "en" ? "$1,000+" : "$1 000+"} label={tx.statSavings} />
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{tx.howEyebrow}</Eyebrow>
            <SectionTitle>{tx.howTitle}</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS[lang].map((s, i) => (
              <div key={s.title} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <s.icon size={20} />
                </div>
                <div className="mt-4 text-xs font-bold text-brand-600 dark:text-brand-400">{tx.stepLabel} {i + 1}</div>
                <h3 className="mt-1 font-semibold text-ink-950 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Core features */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{tx.featuresEyebrow}</Eyebrow>
            <SectionTitle>{tx.featuresTitle}</SectionTitle>
            <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.featuresSub}</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES[lang].map((f) => (
              <Card key={f.title} className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <f.icon size={19} />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Extra tools for dropshippers */}
      <section className="border-y border-ink-200 bg-gradient-to-b from-ink-50 to-white py-20 dark:border-ink-800 dark:from-ink-900/40 dark:to-ink-950">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{tx.toolsEyebrow}</Eyebrow>
            <SectionTitle>{tx.toolsTitle}</SectionTitle>
            <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.toolsSub}</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {EXTRA_TOOLS[lang].map((item) => (
              <Card key={item.title} className="flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <item.icon size={19} />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-ink-500 dark:text-ink-400">{item.body}</p>
                <LinkButton href={item.to} variant="outline" className="mt-5 self-start">
                  {item.cta} <ArrowRight size={14} />
                </LinkButton>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits / ROI */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{tx.benefitsEyebrow}</Eyebrow>
            <SectionTitle>{tx.benefitsTitle}</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <BenefitCard icon={Clock} title={tx.benefitTimeTitle} body={tx.benefitTimeBody} />
            <BenefitCard icon={TrendingUp} title={tx.benefitConvTitle} body={tx.benefitConvBody} />
            <BenefitCard icon={DollarSign} title={tx.benefitCostTitle} body={tx.benefitCostBody} />
          </div>
        </Container>
      </section>

      {/* Differentiators */}
      <section className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>{tx.diffEyebrow}</Eyebrow>
              <SectionTitle>{tx.diffTitle}</SectionTitle>
              <p className="mt-4 text-ink-500 dark:text-ink-400">{tx.diffBody}</p>
            </div>
            <ul className="space-y-4">
              {DIFFERENTIATORS[lang].map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400">
                    <Check size={14} />
                  </span>
                  <span className="text-sm text-ink-600 dark:text-ink-300">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{tx.pricingEyebrow}</Eyebrow>
            <SectionTitle>{tx.pricingTitle}</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRICING[lang].map((plan, i) => (
              <PricingCard
                key={plan.name}
                plan={plan.plan}
                name={plan.name}
                price={i === 0 ? "$0" : i === 1 ? "$39" : "$99"}
                period={plan.period}
                body={plan.body}
                features={plan.features}
                cta={plan.cta}
                highlighted={i === 1}
                mostPopularLabel={tx.mostPopular}
                lang={lang}
                checkoutErrorText={tx.checkoutError}
                onShowDemoModal={() => setCheckoutModalOpen(true)}
              />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-ink-500 dark:text-ink-400">
            {tx.havePromoCode} <Link to="/redeem" className="font-medium text-brand-600 hover:underline dark:text-brand-400">{tx.redeemLink}</Link>
          </p>
        </Container>
      </section>

      <Modal open={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title={tx.checkoutDemoTitle}>
        <p>{tx.checkoutDemoP1}</p>
        <p className="mt-2">{tx.checkoutDemoP2}</p>
        <Button className="mt-4 w-full" onClick={() => setCheckoutModalOpen(false)}>{tx.checkoutDemoGotIt}</Button>
      </Modal>

      {/* FAQ */}
      <section id="faq" className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container className="max-w-3xl">
          <div className="text-center">
            <Eyebrow>{tx.faqEyebrow}</Eyebrow>
            <SectionTitle>{tx.faqTitle}</SectionTitle>
          </div>
          <div className="mt-10 divide-y divide-ink-200 dark:divide-ink-800">
            {FAQS[lang].map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <Container>
          <div className="rounded-3xl bg-ink-950 px-8 py-14 text-center dark:bg-ink-900">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">{tx.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-md text-ink-300">{tx.ctaSub}</p>
            <LinkButton href="/store-builder" className="mt-7">
              {tx.ctaButton} <ArrowRight size={16} />
            </LinkButton>
          </div>
        </Container>
      </section>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, body }: { icon: typeof Clock; title: string; body: string }) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{body}</p>
    </Card>
  );
}

function PricingCard({
  plan, name, price, period, body, features, highlighted, cta, mostPopularLabel, lang, checkoutErrorText, onShowDemoModal,
}: {
  plan: Plan; name: string; price: string; period: string; body: string; features: string[]; highlighted?: boolean;
  cta: string; mostPopularLabel: string; lang: Lang; checkoutErrorText: string; onShowDemoModal: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!getBackendUrl()) {
      onShowDemoModal();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await startCheckout(plan, lang);
    } catch (err) {
      setError(err instanceof Error ? err.message : checkoutErrorText);
      setLoading(false);
    }
  }

  return (
    <div className={`relative rounded-2xl border p-7 ${highlighted ? "border-brand-400 bg-ink-950 text-white shadow-xl shadow-brand-500/20" : "border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/60"}`}>
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">{mostPopularLabel}</span>
      )}
      <h3 className={`font-semibold ${highlighted ? "text-white" : "text-ink-950 dark:text-white"}`}>{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`font-display text-4xl font-semibold ${highlighted ? "text-white" : "text-ink-950 dark:text-white"}`}>{price}</span>
        <span className={highlighted ? "text-ink-400" : "text-ink-400"}>{period}</span>
      </div>
      <p className={`mt-2 text-sm ${highlighted ? "text-ink-300" : "text-ink-500 dark:text-ink-400"}`}>{body}</p>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2 text-sm ${highlighted ? "text-ink-200" : "text-ink-600 dark:text-ink-300"}`}>
            <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {f}
          </li>
        ))}
      </ul>
      {plan === "starter" ? (
        <LinkButton href="/store-builder" variant={highlighted ? "primary" : "outline"} className="mt-7 w-full">
          {cta}
        </LinkButton>
      ) : (
        <Button variant={highlighted ? "primary" : "outline"} className="mt-7 w-full" onClick={handleClick} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={15} />} {cta}
        </Button>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="font-medium text-ink-900 dark:text-white">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{a}</p>}
    </div>
  );
}
