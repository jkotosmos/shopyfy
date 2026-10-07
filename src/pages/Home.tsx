import { useState, type CSSProperties } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, Wand2, LayoutTemplate, FileText, PackagePlus, ShoppingCart, UploadCloud,
  TrendingUp, Calculator, MessageSquareText, Bookmark, Search,
  ChevronDown, Check, Link2, BrainCircuit, Loader2, KeyRound, Clapperboard, Scale, Wallet, ListChecks,
} from "lucide-react";
import { Button, Container, Eyebrow, LinkButton, Modal, SectionTitle } from "../components/ui";
import {
  Barcode, HandlingMarks, ParcelMark, Perforation, Signature, SplitFlap, Stamp, Tape, Ticker, trackingNumber, useInView,
} from "../components/logistics";
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
    { icon: TrendingUp, title: "Поиск трендовых товаров", body: "Подборка трендовых ниш плюс поиск по ключевому слову — каждое утверждение ведёт на Google Trends, TikTok, Meta Ad Library, Pinterest и другие источники.", to: "/trends", cta: "Смотреть тренды" },
    { icon: Search, title: "SEO-анализ сайта конкурента", body: "Отчёт в духе премиум-версии SimilarWeb: трафик, гео, ключевые слова, бэклинки, соцсети, похожие сайты и технологии — по любому домену.", to: "/tools/site-analyzer", cta: "Проанализировать" },
    { icon: Calculator, title: "Калькулятор маржи", body: "Себестоимость, доставка, комиссия платёжки и реклама — реальная маржа или цена под целевую маржу.", to: "/tools/profit-calculator", cta: "Посчитать" },
    { icon: Wallet, title: "Тестовый бюджет рекламы", body: "Точка безубыточности, бюджет теста и чёткий вердикт «убить или масштабировать» по фактическим расходам и продажам.", to: "/tools/ad-budget", cta: "Рассчитать" },
    { icon: MessageSquareText, title: "Генератор рекламных текстов", body: "Пять рекламных ракурсов (любопытство, срочность, соцдоказательство, до/после…) плюс хэштеги для TikTok и Instagram.", to: "/tools/ad-copy", cta: "Сгенерировать" },
    { icon: Clapperboard, title: "Сценарии для видео-рекламы", body: "UGC-сценарии для TikTok/Reels: хук, покадровая раскадровка с текстом на экране и озвучкой, призыв к действию.", to: "/tools/video-script", cta: "Написать сценарий" },
    { icon: Scale, title: "Генератор политик магазина", body: "Черновики политики конфиденциальности, условий и возврата — с пометкой, что это не юридическая консультация.", to: "/tools/policy-generator", cta: "Сгенерировать" },
    { icon: Bookmark, title: "Вотчлист товаров", body: "Сохраняйте товары, которые изучаете, с заметками — хранится локально в браузере, аккаунт не нужен.", to: "/saved", cta: "Открыть" },
  ],
  en: [
    { icon: TrendingUp, title: "Trending product research", body: "Curated trending niches plus keyword search — every claim links out to Google Trends, TikTok, Meta Ad Library, Pinterest, and more.", to: "/trends", cta: "See trends" },
    { icon: Search, title: "Competitor site SEO analysis", body: "A report in the spirit of premium SimilarWeb: traffic, geography, keywords, backlinks, social, similar sites, and tech stack — for any domain.", to: "/tools/site-analyzer", cta: "Analyze" },
    { icon: Calculator, title: "Margin calculator", body: "Supplier cost, shipping, payment fees, and ad spend — your real margin, or the price you need for a target margin.", to: "/tools/profit-calculator", cta: "Calculate" },
    { icon: Wallet, title: "Ad test budget", body: "Break-even cost per sale, a test budget, and a clear kill-or-scale verdict based on your actual spend and sales.", to: "/tools/ad-budget", cta: "Calculate" },
    { icon: MessageSquareText, title: "Ad copy generator", body: "Five ad angles (curiosity, urgency, social proof, before/after…) plus hashtags for TikTok and Instagram.", to: "/tools/ad-copy", cta: "Generate" },
    { icon: Clapperboard, title: "Video ad scripts", body: "UGC scripts for TikTok/Reels: hook, shot-by-shot breakdown with on-screen text and voiceover, closing CTA.", to: "/tools/video-script", cta: "Write a script" },
    { icon: Scale, title: "Store policy generator", body: "Draft privacy, terms, and refund policies — clearly labeled as a starting point, not legal advice.", to: "/tools/policy-generator", cta: "Generate" },
    { icon: Bookmark, title: "Product watchlist", body: "Save products you're researching with notes — stored locally in your browser, no account needed.", to: "/saved", cta: "Open" },
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
    { q: "Данные о трендах в реальном времени?", a: "Подборка трендовых ниш — это иллюстративная отправная точка, явно помеченная как ориентировочная. Каждая карточка — и любое ваше ключевое слово — ведёт на реальный источник (Google Trends, TikTok, Meta Ad Library и т.д.), а с подключённым бэкендом страница трендов показывает реальные данные eBay и Meta Ad Library." },
    { q: "Можно ли доработать сгенерированный магазин?", a: "Да — ничего не заблокировано. После генерации можно переписать текст, заменить изображения, поменять цвета и структуру, добавить или убрать секции." },
    { q: "Это заменяет найм дизайнера или разработчика?", a: "Для большинства стартовых магазинов — да: AI-конструктор магазина/страниц, блоки допродаж и генерация текстов закрывают то, для чего обычно нанимают небольшую команду." },
  ],
  en: [
    { q: "Do I need to know how to code?", a: "No. The store, product pages, and every Shopyfy tool are built in a visual editor with no code." },
    { q: "What product links can I paste?", a: "Product pages from AliExpress, Amazon, and Alibaba, plus existing Shopify product links. No link yet? Just type a product name." },
    { q: "Is the trend data real-time?", a: "The curated trending-niche list is an illustrative starting point, clearly labeled as such. Every card — and any keyword you search — links to a real source (Google Trends, TikTok, Meta Ad Library, etc.), and with the backend connected the trends page shows real eBay and Meta Ad Library data." },
    { q: "Can I edit the generated store?", a: "Yes — nothing is locked. After generation you can rewrite copy, swap images, change colors and structure, and add or remove sections." },
    { q: "Does this replace hiring a designer or developer?", a: "For most starter stores, yes: the AI store/page builder, upsell blocks, and copy generation cover what a small team is usually hired for." },
  ],
};

const PRICING: Record<Lang, { plan: Plan; name: string; shipClass: string; period: string; body: string; features: string[]; cta: string }[]> = {
  ru: [
    { plan: "starter", name: "Starter", shipClass: "Обычная посылка", period: "/мес", body: "Попробуйте AI-конструктор магазина и все инструменты исследования.", features: ["1 сгенерированный магазин", "Инструмент поиска трендов", "Калькулятор маржи", "Генератор рекламных текстов"], cta: "Начать бесплатно" },
    { plan: "growth", name: "Growth", shipClass: "Экспресс", period: "/мес", body: "Для дропшипперов, активно запускающих магазины.", features: ["Неограниченное число магазинов", "Импорт в Shopify в один клик", "Конструктор bundle- и cart-допродаж", "Вотчлист сохранённых товаров", "Приоритетная поддержка"], cta: "Купить Growth" },
    { plan: "pro", name: "Pro", shipClass: "Грузовой контейнер", period: "/мес", body: "Для команд, ведущих несколько магазинов.", features: ["Всё из Growth", "Несколько мест в команде", "Массовая генерация страниц товаров", "Библиотека кастомных секций"], cta: "Купить Pro" },
  ],
  en: [
    { plan: "starter", name: "Starter", shipClass: "Standard parcel", period: "/mo", body: "Try the AI store builder and every research tool.", features: ["1 generated store", "Trend research tool", "Margin calculator", "Ad copy generator"], cta: "Start free" },
    { plan: "growth", name: "Growth", shipClass: "Express", period: "/mo", body: "For dropshippers actively launching stores.", features: ["Unlimited stores", "One-click Shopify import", "Bundle & cart upsell builder", "Saved products watchlist", "Priority support"], cta: "Buy Growth" },
    { plan: "pro", name: "Pro", shipClass: "Freight container", period: "/mo", body: "For teams running multiple stores.", features: ["Everything in Growth", "Multiple team seats", "Bulk product page generation", "Custom section library"], cta: "Buy Pro" },
  ],
};

interface HomeText {
  heroBadge: string; heroTitlePrefix: string; heroTitleAccent: string; heroSub: string;
  heroPlaceholder: string; heroSubmit: string; heroNote: string;
  ticker: string[];
  routeWords: string[]; routeCaptions: string[];
  waybillKind: string; trackLabel: string; fromLabel: string; accepting: string; toLabel: string; toValue: string;
  contentsLabel: string; contentsValue: string; etaLabel: string; etaValue: string; codeLabel: string; codeValue: string;
  demoStamp: string;
  manifest: { value: string; label: string }[];
  howEyebrow: string; howTitle: string; stepLabel: string; routeMeta: string;
  featuresEyebrow: string; featuresTitle: string; featuresSub: string;
  inventoryTitle: string; formCode: string; colNo: string; colItem: string; colWhat: string; colQty: string; qty: string;
  inventoryTotal: string; signatureLabel: string; checkedStamp: string;
  toolsEyebrow: string; toolsTitle: string; toolsSub: string;
  launchPlanTag: string; launchPlanBannerTitle: string; launchPlanBannerBody: string; launchPlanBannerCta: string;
  benefitsEyebrow: string; benefitsTitle: string;
  benefitTimeTitle: string; benefitTimeBody: string;
  benefitConvTitle: string; benefitConvBody: string;
  benefitCostTitle: string; benefitCostBody: string;
  receiptTitle: string; receiptLines: [string, string][]; receiptTotal: [string, string]; receiptThanks: string;
  diffEyebrow: string; diffTitle: string; diffBody: string; templateLabel: string; rejectedStamp: string;
  pricingEyebrow: string; pricingTitle: string; mostPopular: string; planLabel: string;
  havePromoCode: string; redeemLink: string;
  checkoutDemoTitle: string; checkoutDemoP1: string; checkoutDemoP2: string; checkoutDemoGotIt: string;
  checkoutError: string;
  faqEyebrow: string; faqTitle: string; ticketLabel: string;
  ctaTitle: string; ctaSub: string; ctaButton: string; ctaHandle: string;
}

const HOME_TEXT: Record<Lang, HomeText> = {
  ru: {
    heroBadge: "AI-конструктор магазина для дропшипперов",
    heroTitlePrefix: "Превратите любую ссылку на товар в магазин, который",
    heroTitleAccent: "продаёт",
    heroSub: "Вставьте ссылку с AliExpress, Amazon, Alibaba или Shopify. ИИ Shopyfy соберёт главную страницу, страницы товаров, допродажи и тексты — а затем вы импортируете всё прямо в Shopify.",
    heroPlaceholder: "Ссылка на товар или его название…",
    heroSubmit: "Собрать мой магазин",
    heroNote: "Регистрация для демо не нужна · около 10 секунд",
    ticker: [
      "Приём ссылок открыт",
      "AliExpress · Amazon · Alibaba · Shopify",
      "Ссылка → магазин ≈ 10 сек",
      "Без кода и без регистрации",
      "Реальные данные: eBay + Meta Ad Library",
      "10 инструментов для дропшиппинга",
      "Тарифы от $0",
    ],
    routeWords: ["Ссылка", "Магазин", "Продажи"],
    routeCaptions: ["Пункт A · ваш товар", "Пункт B · Shopify", "Пункт C · покупатель"],
    waybillKind: "Накладная", trackLabel: "Трек №", fromLabel: "Отправитель · ссылка на товар", accepting: "Принимаем",
    toLabel: "Получатель", toValue: "Ваш магазин на Shopify",
    contentsLabel: "Вложение", contentsValue: "Главная · товары · допродажи · тексты",
    etaLabel: "Срок", etaValue: "≈ 10 сек", codeLabel: "Код", codeValue: "0 строк",
    demoStamp: "Демо · бесплатно",
    manifest: [
      { value: "≈10 с", label: "от ссылки до демо-магазина" },
      { value: "0", label: "строк кода" },
      { value: "10", label: "инструментов в комплекте" },
      { value: "$0", label: "старт на тарифе Starter" },
    ],
    howEyebrow: "Как это работает", howTitle: "От ссылки до готового магазина за четыре пункта", stepLabel: "Пункт", routeMeta: "Маршрут · 4 пункта · без пересадок",
    featuresEyebrow: "Основные функции", featuresTitle: "Всё в одном приложении вместо пяти", featuresSub: "Тема, конструктор страниц и приложения для допродаж — заменены единым ИИ-процессом.",
    inventoryTitle: "Опись вложения", formCode: "Форма SY-107", colNo: "№", colItem: "Наименование", colWhat: "Что делает", colQty: "Кол-во", qty: "1 шт.",
    inventoryTotal: "Итого: 6 позиций в одной посылке", signatureLabel: "Подпись отправителя", checkedStamp: "Проверено",
    toolsEyebrow: "Не только конструктор магазина", toolsTitle: "Склад инструментов для исследования рынка", toolsSub: "Найдите, что в тренде, правильно посчитайте цену и напишите рекламу — ещё до того, как потратите хоть доллар.",
    launchPlanTag: "Маршрутный лист", launchPlanBannerTitle: "Не знаете, с чего начать?", launchPlanBannerBody: "Пошаговый план запуска магазина: от поиска товара до масштабирования рекламы, с прогрессом и ссылками на все инструменты.",
    launchPlanBannerCta: "Открыть план запуска",
    benefitsEyebrow: "Почему это того стоит", benefitsTitle: "Время, деньги и конверсия — одним чеком",
    benefitTimeTitle: "Экономия времени", benefitTimeBody: "Создавайте страницы товаров до 15× быстрее и экономьте 40+ часов по сравнению с ручной сборкой магазина.",
    benefitConvTitle: "Рост конверсии", benefitConvBody: "Секции и текстовые паттерны, основанные на том, что работает у успешных e-commerce брендов.",
    benefitCostTitle: "Сокращение расходов", benefitCostBody: "Одно приложение заменяет несколько Shopify-приложений плюс услуги разработчика, дизайнера и копирайтера — часто это $100+/мес и $1 000+ на найме.",
    receiptTitle: "Кассовый чек",
    receiptLines: [
      ["Страницы товаров", "до 15× быстрее"],
      ["Время на магазин", "−40+ ч"],
      ["Приложения Shopify", "−$100+/мес"],
      ["Найм команды", "−$1 000+"],
      ["Секции и тексты", "как у топ-брендов"],
    ],
    receiptTotal: ["Итого", "время + деньги + конверсия"],
    receiptThanks: "Спасибо, приходите ещё!",
    diffEyebrow: "Не очередной генератор шаблонов", diffTitle: "Построено вокруг вашего товара, а не переработанного макета",
    diffBody: "Обычные AI-конструкторы сайтов переиспользуют одну и ту же горстку шаблонов для всех. Shopyfy сначала анализирует конкретный товар и проводит лёгкое исследование рынка, поэтому структура, тексты и предложения реально соответствуют тому, что вы продаёте.",
    templateLabel: "Шаблон «для всех»", rejectedStamp: "Отклонено",
    pricingEyebrow: "Тарифы", pricingTitle: "Начните бесплатно, обновитесь, когда начнёте продавать", mostPopular: "Хит", planLabel: "Тариф",
    havePromoCode: "Уже есть промокод?", redeemLink: "Активировать",
    checkoutDemoTitle: "Оплата", checkoutDemoGotIt: "Понятно",
    checkoutDemoP1: "В полноценном продукте эта кнопка ведёт на страницу оплаты Stripe. После оплаты промокод для активации тарифа приходит на email — деньги поступают напрямую на счёт владельца сайта, минуя нас.",
    checkoutDemoP2: "Этот прототип развёрнут без бэкенда для оплаты, поэтому здесь показано только объяснение процесса.",
    checkoutError: "Не удалось перейти к оплате.",
    faqEyebrow: "Справочное бюро", faqTitle: "Отвечаем на частые вопросы", ticketLabel: "Талон",
    ctaTitle: "Вставьте ссылку. Увидьте свой магазин за секунды.", ctaSub: "Без карты, без регистрации — демо работает полностью в вашем браузере.", ctaButton: "Собрать мой магазин",
    ctaHandle: "Обращаться бережно: внутри ваша идея",
  },
  en: {
    heroBadge: "AI store builder for dropshippers",
    heroTitlePrefix: "Turn any product link into a store that",
    heroTitleAccent: "sells",
    heroSub: "Paste a link from AliExpress, Amazon, Alibaba, or Shopify. Shopyfy's AI builds the homepage, product pages, upsells, and copy — then you import it straight into Shopify.",
    heroPlaceholder: "A product link or product name…",
    heroSubmit: "Build my store",
    heroNote: "No signup needed for the demo · about 10 seconds",
    ticker: [
      "Now accepting links",
      "AliExpress · Amazon · Alibaba · Shopify",
      "Link → store in ≈ 10 sec",
      "No code, no signup",
      "Real data: eBay + Meta Ad Library",
      "10 dropshipping tools",
      "Plans from $0",
    ],
    routeWords: ["Link", "Store", "Sales"],
    routeCaptions: ["Point A · your product", "Point B · Shopify", "Point C · the buyer"],
    waybillKind: "Waybill", trackLabel: "Tracking no.", fromLabel: "Sender · product link", accepting: "Accepting",
    toLabel: "Recipient", toValue: "Your Shopify store",
    contentsLabel: "Contents", contentsValue: "Homepage · products · upsells · copy",
    etaLabel: "ETA", etaValue: "≈ 10 sec", codeLabel: "Code", codeValue: "0 lines",
    demoStamp: "Demo · free",
    manifest: [
      { value: "≈10 s", label: "from link to demo store" },
      { value: "0", label: "lines of code" },
      { value: "10", label: "tools included" },
      { value: "$0", label: "to start on Starter" },
    ],
    howEyebrow: "How it works", howTitle: "From link to finished store in four stops", stepLabel: "Stop", routeMeta: "Route · 4 stops · non-stop",
    featuresEyebrow: "Core features", featuresTitle: "One app instead of five", featuresSub: "Theme, page builder, and upsell apps — replaced by a single AI process.",
    inventoryTitle: "Packing list", formCode: "Form SY-107", colNo: "No.", colItem: "Item", colWhat: "What it does", colQty: "Qty", qty: "1 pc",
    inventoryTotal: "Total: 6 items, one parcel", signatureLabel: "Sender's signature", checkedStamp: "Checked",
    toolsEyebrow: "More than a store builder", toolsTitle: "A warehouse of market-research tools", toolsSub: "Find what's trending, price it right, and write the ads — before you spend a single dollar.",
    launchPlanTag: "Route sheet", launchPlanBannerTitle: "Not sure where to start?", launchPlanBannerBody: "A step-by-step launch plan: from product research to scaling ads, with progress tracking and links to every tool.",
    launchPlanBannerCta: "Open the launch plan",
    benefitsEyebrow: "Why it's worth it", benefitsTitle: "Time, money, and conversion — on one receipt",
    benefitTimeTitle: "Save time", benefitTimeBody: "Build product pages up to 15× faster and save 40+ hours versus building a store by hand.",
    benefitConvTitle: "Higher conversion", benefitConvBody: "Sections and copy patterns based on what works for successful e-commerce brands.",
    benefitCostTitle: "Lower costs", benefitCostBody: "One app replaces several Shopify apps plus a developer, designer, and copywriter — often $100+/mo and $1,000+ in hiring.",
    receiptTitle: "Receipt",
    receiptLines: [
      ["Product pages", "up to 15× faster"],
      ["Time per store", "−40+ hrs"],
      ["Shopify apps", "−$100+/mo"],
      ["Hiring a team", "−$1,000+"],
      ["Sections & copy", "top-brand patterns"],
    ],
    receiptTotal: ["Total", "time + money + conversion"],
    receiptThanks: "Thank you, come again!",
    diffEyebrow: "Not another template generator", diffTitle: "Built around your product, not a reworked layout",
    diffBody: "Typical AI site builders reuse the same handful of templates for everyone. Shopyfy analyzes the specific product first and does light market research, so the structure, copy, and offers actually match what you're selling.",
    templateLabel: "One template for everyone", rejectedStamp: "Rejected",
    pricingEyebrow: "Pricing", pricingTitle: "Start free, upgrade once you start selling", mostPopular: "Best seller", planLabel: "Plan",
    havePromoCode: "Already have a promo code?", redeemLink: "Activate it",
    checkoutDemoTitle: "Checkout", checkoutDemoGotIt: "Got it",
    checkoutDemoP1: "In a full product, this button goes to Stripe's payment page. After payment, a promo code to activate the plan is emailed to you — the money goes straight to the site owner's account, never through us.",
    checkoutDemoP2: "This prototype is deployed without a payments backend, so this is shown for explanation only.",
    checkoutError: "Couldn't start checkout.",
    faqEyebrow: "Information desk", faqTitle: "Frequently asked questions", ticketLabel: "Ticket",
    ctaTitle: "Paste a link. See your store in seconds.", ctaSub: "No card, no signup — the demo runs entirely in your browser.", ctaButton: "Build my store",
    ctaHandle: "Handle with care: your idea inside",
  },
};

const PLATFORMS = ["AliExpress", "Amazon", "Alibaba", "Shopify"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

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
      {/* ═════════ Hero: route headline + live waybill ═════════ */}
      <section className="relative overflow-hidden">
        <Ticker
          items={tx.ticker}
          className="border-b-2 border-ink-950 bg-ink-950 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#fffdf8] dark:border-ink-700 dark:bg-black"
        />
        <div className="surface-grid pointer-events-none absolute inset-0 top-10 [mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)]" aria-hidden="true" />

        <Container className="relative grid gap-14 pt-12 pb-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:pt-16 lg:pb-20">
          <div>
            <div className="animate-fade-up">
              <Eyebrow>{tx.heroBadge}</Eyebrow>
            </div>
            <h1 className="relative mt-2">
              <span className="sr-only">
                {tx.heroTitlePrefix} {tx.heroTitleAccent}
              </span>
              <span aria-hidden="true" className="relative block">
                <span className="absolute bottom-8 left-[10px] top-6 w-0 border-l-[3px] border-dashed border-ink-950 dark:border-ink-500" />
                {tx.routeWords.map((word, i) => {
                  const last = i === tx.routeWords.length - 1;
                  return (
                    <span key={word} className="animate-fade-up relative block pb-4 pl-10 sm:pl-12" style={{ animationDelay: `${120 + i * 140}ms` }}>
                      <span
                        className={`absolute left-0 top-[26px] h-6 w-6 rounded-full border-[3px] border-ink-950 dark:border-ink-200 ${
                          last ? "bg-brand-400" : "bg-[#fffdf8] dark:bg-ink-900"
                        }`}
                      />
                      <span className="caption block">{tx.routeCaptions[i]}</span>
                      <span
                        className={`mt-1 inline-block font-display text-[clamp(40px,6.2vw,80px)] font-black uppercase leading-[0.98] tracking-[-0.045em] ${
                          last
                            ? "-rotate-[1.5deg] border-[3px] border-ink-950 bg-brand-400 px-3 pb-1 text-ink-950 shadow-[6px_6px_0_0_var(--color-ink-950)] dark:shadow-[6px_6px_0_0_#000]"
                            : "text-ink-950 dark:text-[#f6f1e7]"
                        }`}
                      >
                        {word}
                      </span>
                    </span>
                  );
                })}
              </span>
            </h1>
            <p className="animate-fade-up mt-4 max-w-xl text-[17px] leading-relaxed text-ink-600 dark:text-ink-300" style={{ animationDelay: "560ms" }}>
              {tx.heroSub}
            </p>
          </div>

          <Waybill tx={tx} url={url} setUrl={setUrl} onSubmit={handleGenerate} />
        </Container>

        {/* Cargo manifest — only facts the prototype can actually back up */}
        <div className="surface-label relative border-y-2 border-ink-950 dark:border-ink-700">
          <Container className="grid grid-cols-2 lg:grid-cols-4">
            {tx.manifest.map((m, i) => (
              <div
                key={m.label}
                className={`py-6 pl-4 sm:pl-6 ${i % 2 === 1 ? "border-l-2 border-ink-950 dark:border-ink-700" : ""} ${
                  i >= 2 ? "border-t-2 border-ink-950 lg:border-t-0 dark:border-ink-700" : ""
                } ${i === 2 ? "lg:border-l-2" : ""} ${i === 0 ? "pl-0 sm:pl-0" : ""}`}
              >
                <div className="caption">{pad2(i + 1)} / {pad2(tx.manifest.length)}</div>
                <div className="mt-2 font-display text-3xl font-black tracking-[-0.04em] text-ink-950 sm:text-4xl dark:text-white">{m.value}</div>
                <div className="mt-1 text-sm text-ink-600 dark:text-ink-300">{m.label}</div>
              </div>
            ))}
          </Container>
        </div>
      </section>

      {/* ═════════ How it works: a delivery route ═════════ */}
      <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>{tx.howEyebrow}</Eyebrow>
              <SectionTitle>{tx.howTitle}</SectionTitle>
            </div>
            <p className="caption shrink-0">{tx.routeMeta}</p>
          </div>

          {/* desktop: horizontal route with a parcel travelling between stops */}
          <div className="relative mt-16 hidden lg:block">
            <div className="absolute left-[12.5%] right-[12.5%] top-[27px] border-t-[3px] border-dashed border-ink-950 dark:border-ink-500" aria-hidden="true">
              <span className="parcel-x absolute top-0 -translate-x-1/2 -translate-y-[calc(100%+14px)]">
                <ParcelMark className="h-10 w-10 drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)]" />
              </span>
            </div>
            <ol className="relative grid grid-cols-4 gap-6">
              {STEPS[lang].map((s, i) => (
                <li key={s.title} className="text-center">
                  <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-ink-950 bg-[#fffdf8] text-ink-950 dark:border-ink-200 dark:bg-ink-900 dark:text-white">
                    <s.icon size={22} />
                  </span>
                  <p className="caption mt-4">{tx.stepLabel} {pad2(i + 1)}</p>
                  <h3 className="mt-2 font-display text-[17px] font-bold leading-snug tracking-[-0.02em] text-ink-950 dark:text-white">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-relaxed text-ink-600 dark:text-ink-300">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* mobile/tablet: vertical route */}
          <ol className="relative mt-12 space-y-8 lg:hidden">
            <span className="absolute bottom-6 left-[25px] top-6 border-l-[3px] border-dashed border-ink-950 dark:border-ink-500" aria-hidden="true" />
            {STEPS[lang].map((s, i) => (
              <li key={s.title} className="relative flex gap-5">
                <span className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] border-ink-950 bg-[#fffdf8] text-ink-950 dark:border-ink-200 dark:bg-ink-900 dark:text-white">
                  <s.icon size={20} />
                </span>
                <div className="pt-1">
                  <p className="caption">{tx.stepLabel} {pad2(i + 1)}</p>
                  <h3 className="mt-1 font-display text-base font-bold tracking-[-0.02em] text-ink-950 dark:text-white">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ═════════ Core features: a parcel packing list (опись вложения) ═════════ */}
      <section className="surface-kraft border-y-2 border-ink-950 py-20 sm:py-24 dark:border-ink-700">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{tx.featuresEyebrow}</Eyebrow>
            <SectionTitle>{tx.featuresTitle}</SectionTitle>
            <p className="mt-4 text-ink-800 dark:text-ink-200">{tx.featuresSub}</p>
          </div>
          <PackingList tx={tx} lang={lang} />
        </Container>
      </section>

      {/* ═════════ Tools: warehouse shelf ═════════ */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>{tx.toolsEyebrow}</Eyebrow>
            <SectionTitle>{tx.toolsTitle}</SectionTitle>
            <p className="mt-4 text-ink-600 dark:text-ink-300">{tx.toolsSub}</p>
          </div>

          <Link
            to="/launch-plan"
            className="press group relative mt-10 flex flex-col gap-5 overflow-hidden rounded-2xl border-2 border-ink-950 bg-brand-400 p-6 text-ink-950 sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-brand-400"
          >
            <div className="flex items-start gap-5">
              <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-ink-950 bg-[#fffdf8] sm:flex">
                <ListChecks size={24} />
              </span>
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">● ● ● ○ {tx.launchPlanTag}</span>
                <h3 className="mt-1.5 font-display text-xl font-bold tracking-[-0.02em] sm:text-2xl">{tx.launchPlanBannerTitle}</h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-900">{tx.launchPlanBannerBody}</p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-2 self-start rounded-md border-2 border-ink-950 bg-ink-950 px-4 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-[#fffdf8] transition-transform group-hover:translate-x-1 sm:self-auto">
              {tx.launchPlanBannerCta} <ArrowRight size={14} />
            </span>
          </Link>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXTRA_TOOLS[lang].map((item, i) => (
              <Link
                key={item.title}
                to={item.to}
                className="lift surface-label group flex flex-col overflow-hidden rounded-2xl border-[1.5px] border-ink-950 dark:border-ink-700"
              >
                <span className="surface-kraft relative block h-5 border-b-[1.5px] border-ink-950 dark:border-ink-700" aria-hidden="true">
                  <span className="absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-kraft-500/70 dark:bg-kraft-600/70" />
                </span>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-ink-500 dark:text-ink-400">A-{pad2(i + 1)}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-md border-[1.5px] border-ink-950 bg-brand-400 text-ink-950 transition-transform group-hover:-rotate-6 dark:border-brand-400">
                      <item.icon size={17} />
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[15px] font-bold leading-snug tracking-[-0.02em] text-ink-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">{item.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink-950 underline decoration-2 underline-offset-4 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                    {item.cta} <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ═════════ Benefits: a receipt ═════════ */}
      <section className="relative overflow-hidden bg-ink-950 py-20 text-[#ede7da] sm:py-24 dark:bg-black">
        <Container className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <Eyebrow tone="paper">{tx.benefitsEyebrow}</Eyebrow>
            <h2 className="font-display text-[26px] font-bold leading-[1.12] tracking-[-0.025em] text-[#fffdf8] sm:text-[38px]">{tx.benefitsTitle}</h2>
            <ol className="mt-10 space-y-7">
              {[
                [tx.benefitTimeTitle, tx.benefitTimeBody],
                [tx.benefitConvTitle, tx.benefitConvBody],
                [tx.benefitCostTitle, tx.benefitCostBody],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-5">
                  <span className="font-display text-3xl font-black leading-none text-brand-400">{pad2(i + 1)}</span>
                  <div className="border-l border-white/15 pl-5">
                    <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-[#fffdf8]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-300">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <Receipt tx={tx} />
        </Container>
      </section>

      {/* ═════════ Differentiators: the generic template gets rejected ═════════ */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>{tx.diffEyebrow}</Eyebrow>
            <SectionTitle>{tx.diffTitle}</SectionTitle>
            <p className="mt-4 text-ink-600 dark:text-ink-300">{tx.diffBody}</p>
            <ul className="mt-8 space-y-4">
              {DIFFERENTIATORS[lang].map((d) => (
                <li key={d} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-2 border-ink-950 bg-brand-400 text-ink-950 dark:border-brand-400">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink-800 dark:text-ink-200">{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <RejectedTemplate tx={tx} />
        </Container>
      </section>

      {/* ═════════ Pricing: luggage tags ═════════ */}
      <section id="pricing" className="scroll-mt-20 border-t-2 border-ink-950 py-20 sm:py-24 dark:border-ink-700">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>{tx.pricingEyebrow}</Eyebrow>
            <SectionTitle>{tx.pricingTitle}</SectionTitle>
          </div>
          <div className="relative mt-16">
            <div className="absolute inset-x-4 -top-1 hidden h-2 rounded-full border-2 border-ink-950 bg-kraft-400 lg:block dark:border-ink-600 dark:bg-kraft-600" aria-hidden="true" />
            <div className="grid gap-10 lg:grid-cols-3 lg:gap-7 lg:pt-12">
              {PRICING[lang].map((plan, i) => (
                <PricingCard
                  key={plan.name}
                  plan={plan.plan}
                  name={plan.name}
                  shipClass={plan.shipClass}
                  planLabel={tx.planLabel}
                  price={i === 0 ? "$0" : i === 1 ? "$39" : "$99"}
                  period={plan.period}
                  body={plan.body}
                  features={plan.features}
                  cta={plan.cta}
                  highlighted={i === 1}
                  tilt={i === 0 ? -1.2 : i === 1 ? 0.6 : 1.4}
                  mostPopularLabel={tx.mostPopular}
                  lang={lang}
                  checkoutErrorText={tx.checkoutError}
                  onShowDemoModal={() => setCheckoutModalOpen(true)}
                />
              ))}
            </div>
          </div>
          <p className="mt-12 text-center text-sm text-ink-600 dark:text-ink-300">
            {tx.havePromoCode}{" "}
            <Link to="/redeem" className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink-950 underline decoration-brand-400 decoration-[3px] underline-offset-4 dark:text-white">
              {tx.redeemLink} →
            </Link>
          </p>
        </Container>
      </section>

      <Modal open={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title={tx.checkoutDemoTitle}>
        <p>{tx.checkoutDemoP1}</p>
        <p className="mt-2">{tx.checkoutDemoP2}</p>
        <Button className="mt-5 w-full" onClick={() => setCheckoutModalOpen(false)}>{tx.checkoutDemoGotIt}</Button>
      </Modal>

      {/* ═════════ FAQ: information desk tickets ═════════ */}
      <section id="faq" className="scroll-mt-20 border-t-2 border-ink-950 py-20 sm:py-24 dark:border-ink-700">
        <Container className="max-w-3xl">
          <div className="text-center">
            <Eyebrow>{tx.faqEyebrow}</Eyebrow>
            <SectionTitle>{tx.faqTitle}</SectionTitle>
          </div>
          <div className="mt-12 space-y-3">
            {FAQS[lang].map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} number={`${tx.ticketLabel} A-${pad2(i + 1)}`} />
            ))}
          </div>
        </Container>
      </section>

      {/* ═════════ Final CTA: the side of a shipping box ═════════ */}
      <section className="pb-20 pt-4 sm:pb-24">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border-2 border-ink-950 bg-brand-400 px-6 py-10 text-ink-950 shadow-[10px_10px_0_0_var(--color-ink-950)] sm:px-12 sm:py-14 dark:border-brand-400 dark:shadow-[10px_10px_0_0_#000]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <HandlingMarks className="h-11 text-ink-950" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">{trackingNumber("cta")}</span>
            </div>
            <h2 className="mt-8 max-w-3xl font-display text-[30px] font-black leading-[1.05] tracking-[-0.035em] sm:text-[52px]">{tx.ctaTitle}</h2>
            <p className="mt-4 max-w-lg text-base text-ink-900">{tx.ctaSub}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <LinkButton href="/store-builder" variant="secondary" className="!px-6 !py-4 !text-[14px]">
                {tx.ctaButton} <ArrowRight size={16} />
              </LinkButton>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">↑↑ {tx.ctaHandle}</span>
            </div>
            <Barcode value="final-cta" className="mt-10 h-12 w-full text-ink-950 opacity-90" modules={220} />
          </div>
        </Container>
      </section>
    </div>
  );
}

/* ───────────── Hero waybill (the actual input form) ───────────── */

function Waybill({
  tx, url, setUrl, onSubmit,
}: {
  tx: HomeText; url: string; setUrl: (v: string) => void; onSubmit: (e: React.FormEvent) => void;
}) {
  const track = trackingNumber(url.trim());
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:justify-self-end">
      <Tape className="-left-6 -top-3 -rotate-[24deg]" />
      <Tape className="-right-7 -top-2 rotate-[18deg]" />
      <form
        onSubmit={onSubmit}
        className="surface-label animate-stick relative rounded-2xl border-2 border-ink-950 shadow-[10px_10px_0_0_var(--color-ink-950)] dark:border-ink-600 dark:shadow-[10px_10px_0_0_#000]"
        style={{ "--stick-rot": "1.2deg", animationDelay: "200ms" } as CSSProperties}
      >
        <div className="flex items-center justify-between border-b-2 border-ink-950 px-5 py-3 dark:border-ink-600">
          <span className="flex items-center gap-2 font-mono text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink-950 dark:text-white">
            <ParcelMark className="h-6 w-6" /> Shopyfy Express
          </span>
          <span className="rounded-sm bg-ink-950 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#fffdf8] dark:bg-ink-100 dark:text-ink-950">
            {tx.waybillKind}
          </span>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="caption">{tx.trackLabel}</span>
            <span className="font-mono text-[15px] font-bold tracking-[0.08em] text-ink-950 tabular-nums dark:text-white">{track}</span>
          </div>
          <Barcode value={url.trim() || "shopyfy"} className="mt-2 h-14 w-full text-ink-950 dark:text-ink-100" />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] border-t-2 border-ink-950 dark:border-ink-600">
          <label className="col-span-2 block border-b-[1.5px] border-ink-950 px-5 py-3.5 dark:border-ink-600">
            <span className="caption">{tx.fromLabel}</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={tx.heroPlaceholder}
              className="mt-1.5 w-full border-0 border-b-2 border-dashed border-ink-300 bg-transparent px-0 pb-1.5 pt-0.5 text-base text-ink-950 outline-none placeholder:text-ink-400 focus:border-brand-500 dark:border-ink-600 dark:text-white"
            />
            <span className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="caption">{tx.accepting}:</span>
              <SplitFlap words={PLATFORMS} length={10} className="text-[11px]" />
            </span>
          </label>
          <Field label={tx.toLabel} value={tx.toValue} className="border-b-[1.5px] border-r-[1.5px]" />
          <Field label={tx.etaLabel} value={tx.etaValue} className="border-b-[1.5px]" mono />
          <Field label={tx.contentsLabel} value={tx.contentsValue} className="border-r-[1.5px]" />
          <Field label={tx.codeLabel} value={tx.codeValue} mono />
        </div>

        <div className="px-5 pb-5 pt-5">
          <Perforation scissors className="-mx-5 mb-5" />
          <Button type="submit" className="w-full !py-3.5 !text-[14px]">
            {tx.heroSubmit} <ArrowRight size={16} />
          </Button>
          <p className="caption mt-3 text-center">{tx.heroNote}</p>
        </div>

        <Stamp tone="real" size="lg" rotate={-11} animate className="pointer-events-none absolute right-3 top-[150px] sm:-right-5">
          {tx.demoStamp}
        </Stamp>
      </form>
    </div>
  );
}

function Field({ label, value, className = "", mono = false }: { label: string; value: string; className?: string; mono?: boolean }) {
  return (
    <div className={`border-ink-950 px-5 py-3 dark:border-ink-600 ${className}`}>
      <span className="caption">{label}</span>
      <p className={`mt-1 text-sm font-semibold text-ink-950 dark:text-white ${mono ? "whitespace-nowrap font-mono" : ""}`}>{value}</p>
    </div>
  );
}

/* ───────────── Packing list (опись вложения, form Ф-107 homage) ───────────── */

function PackingList({ tx, lang }: { tx: HomeText; lang: Lang }) {
  const [stampRef, stamped] = useInView<HTMLDivElement>(0.15);
  return (
    <div className="relative mx-auto mt-12 max-w-5xl">
      <Tape className="-left-4 -top-3 -rotate-[14deg]" />
      <Tape className="-right-4 -top-3 rotate-[11deg]" />
      <div className="surface-label relative -rotate-[0.35deg] rounded-xl border-2 border-ink-950 shadow-[10px_10px_0_0_var(--color-ink-950)] dark:border-ink-600 dark:shadow-[10px_10px_0_0_#000]">
        <div className="flex flex-col gap-3 border-b-2 border-ink-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-ink-600">
          <div>
            <h3 className="font-display text-xl font-black uppercase tracking-[-0.02em] text-ink-950 dark:text-white">{tx.inventoryTitle}</h3>
            <p className="caption mt-1">{tx.formCode} · Shopyfy Express</p>
          </div>
          <div className="w-full max-w-[220px] text-ink-950 dark:text-ink-100">
            <Barcode value="packing-list" className="h-8 w-full" />
            <p className="mt-1 font-mono text-[10px] font-bold tracking-[0.14em]">{trackingNumber("packing-list")}</p>
          </div>
        </div>

        <div className="hidden grid-cols-[64px_minmax(0,1.1fr)_minmax(0,2fr)_80px] border-b-[1.5px] border-ink-950 px-7 py-2.5 md:grid dark:border-ink-600">
          <span className="caption">{tx.colNo}</span>
          <span className="caption">{tx.colItem}</span>
          <span className="caption">{tx.colWhat}</span>
          <span className="caption text-right">{tx.colQty}</span>
        </div>

        <ol>
          {CORE_FEATURES[lang].map((f, i) => (
            <li
              key={f.title}
              className="grid grid-cols-[44px_1fr] gap-x-3 gap-y-1 border-b-[1.5px] border-dashed border-ink-300 px-5 py-4 last:border-b-0 md:grid-cols-[64px_minmax(0,1.1fr)_minmax(0,2fr)_80px] md:items-center md:gap-x-0 md:px-7 dark:border-ink-700"
            >
              <span className="font-mono text-sm font-bold text-ink-400 md:row-auto">{pad2(i + 1)}</span>
              <span className="flex items-center gap-2.5 font-semibold text-ink-950 md:pr-4 dark:text-white">
                <f.icon size={17} className="shrink-0 text-brand-600 dark:text-brand-400" />
                {f.title}
              </span>
              <span className="col-start-2 text-sm leading-relaxed text-ink-600 md:col-start-auto md:pr-6 dark:text-ink-300">{f.body}</span>
              <span className="col-start-2 font-mono text-[12px] font-bold text-ink-950 md:col-start-auto md:text-right dark:text-white">{tx.qty}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-6 border-t-2 border-ink-950 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 dark:border-ink-600">
          <p className="font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink-950 dark:text-white">{tx.inventoryTotal}</p>
          <div ref={stampRef} className="relative min-w-[230px]">
            <Signature className="h-10 w-40 text-accent-700 dark:text-accent-300" />
            <div className="mt-1 border-t-[1.5px] border-ink-950 pt-1 dark:border-ink-500">
              <span className="caption">{tx.signatureLabel}</span>
            </div>
            <Stamp
              tone="real"
              size="lg"
              rotate={-9}
              animate={stamped}
              className={`pointer-events-none absolute -top-3 right-0 ${stamped ? "" : "opacity-0"}`}
            >
              ✓ {tx.checkedStamp}
            </Stamp>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Receipt ───────────── */

function Receipt({ tx }: { tx: HomeText }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px] rotate-[2deg] drop-shadow-[0_26px_28px_rgba(0,0,0,0.55)]">
      <div className="zigzag-y bg-[#fffdf8] px-7 py-10 font-mono text-[12px] text-ink-950">
        <div className="text-center">
          <div className="flex justify-center">
            <ParcelMark className="h-8 w-8" />
          </div>
          <p className="mt-2 font-display text-lg font-black tracking-[-0.02em]">shopyfy</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em]">{tx.receiptTitle} № 0042</p>
        </div>
        <div className="my-4 border-t-2 border-dashed border-ink-950" />
        <ul className="space-y-2.5">
          {tx.receiptLines.map(([item, value]) => (
            <li key={item} className="flex items-end gap-1.5 uppercase">
              <span className="shrink-0">{item}</span>
              <span className="mb-[3px] flex-1 border-b-2 border-dotted border-ink-400" />
              <span className="shrink-0 text-right font-bold">{value}</span>
            </li>
          ))}
        </ul>
        <div className="my-4 border-t-[3px] border-double border-ink-950" />
        <div className="flex items-end justify-between gap-3 uppercase">
          <span className="text-[15px] font-extrabold">{tx.receiptTotal[0]}</span>
          <span className="text-right font-bold">{tx.receiptTotal[1]}</span>
        </div>
        <Barcode value="receipt-0042" className="mt-6 h-12 w-full" />
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.2em]">{tx.receiptThanks}</p>
      </div>
    </div>
  );
}

/* ───────────── Generic template, stamped REJECTED ───────────── */

function RejectedTemplate({ tx }: { tx: HomeText }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[500px]">
      <div className="surface-label rotate-[1.2deg] rounded-xl border-2 border-ink-950 p-4 shadow-[8px_8px_0_0_var(--color-ink-950)] dark:border-ink-600 dark:shadow-[8px_8px_0_0_#000]" aria-hidden="true">
        <div className="flex items-center gap-1.5 border-b-[1.5px] border-ink-200 pb-3 dark:border-ink-700">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300 dark:bg-ink-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300 dark:bg-ink-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-300 dark:bg-ink-600" />
          <span className="ml-3 h-3 flex-1 rounded-sm bg-ink-100 dark:bg-ink-800" />
        </div>
        <div className="mt-4 space-y-3 opacity-80">
          <div className="flex items-center justify-between">
            <span className="h-3 w-20 rounded-sm bg-ink-200 dark:bg-ink-700" />
            <span className="flex gap-2">
              <span className="h-2.5 w-10 rounded-sm bg-ink-200 dark:bg-ink-700" />
              <span className="h-2.5 w-10 rounded-sm bg-ink-200 dark:bg-ink-700" />
              <span className="h-2.5 w-10 rounded-sm bg-ink-200 dark:bg-ink-700" />
            </span>
          </div>
          <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-md bg-ink-100 dark:bg-ink-800">
            <span className="h-3.5 w-48 rounded-sm bg-ink-300 dark:bg-ink-600" />
            <span className="h-2.5 w-32 rounded-sm bg-ink-200 dark:bg-ink-700" />
            <span className="mt-1 h-5 w-20 rounded-sm bg-ink-300 dark:bg-ink-600" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((k) => (
              <div key={k} className="space-y-1.5 rounded-md border border-ink-200 p-2 dark:border-ink-700">
                <span className="block h-10 rounded-sm bg-ink-100 dark:bg-ink-800" />
                <span className="block h-2 w-3/4 rounded-sm bg-ink-200 dark:bg-ink-700" />
                <span className="block h-2 w-1/2 rounded-sm bg-ink-200 dark:bg-ink-700" />
              </div>
            ))}
          </div>
          <p className="caption pt-1 text-center">{tx.templateLabel}</p>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Stamp tone="demo" size="xl" rotate={-14} animate={inView} className={inView ? "" : "opacity-0"}>
          {tx.rejectedStamp}
        </Stamp>
      </div>
    </div>
  );
}

/* ───────────── Pricing luggage tag ───────────── */

function PricingCard({
  plan, name, shipClass, planLabel, price, period, body, features, highlighted, tilt, cta, mostPopularLabel, lang, checkoutErrorText, onShowDemoModal,
}: {
  plan: Plan; name: string; shipClass: string; planLabel: string; price: string; period: string; body: string; features: string[]; highlighted?: boolean; tilt: number;
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
    <div className="group relative" style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
      {/* string up to the rail */}
      <span className="absolute -top-12 left-1/2 hidden h-[64px] w-[2px] -translate-x-1/2 bg-ink-950 lg:block dark:bg-ink-500" aria-hidden="true" />
      <div className="origin-top transition-transform duration-300 lg:rotate-[var(--tilt)] lg:group-hover:rotate-0">
        <div className="tag-shape bg-ink-950 p-[2px] dark:bg-ink-600">
          <div className={`tag-shape relative px-6 pb-7 pt-14 ${highlighted ? "bg-brand-400 text-ink-950" : "surface-label text-ink-950 dark:text-white"}`}>
            <span className="tag-eyelet" aria-hidden="true" />
            {highlighted && (
              <Stamp tone="ink" size="lg" rotate={8} className="absolute right-5 top-6">
                ★ {mostPopularLabel}
              </Stamp>
            )}
            <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${highlighted ? "text-ink-900" : "text-ink-500 dark:text-ink-400"}`}>
              {planLabel} · {shipClass}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em]">{name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-5xl font-black tracking-[-0.05em]">{price}</span>
              <span className={`font-mono text-sm ${highlighted ? "text-ink-900" : "text-ink-500 dark:text-ink-400"}`}>{period}</span>
            </div>
            <p className={`mt-2 text-sm ${highlighted ? "text-ink-900" : "text-ink-600 dark:text-ink-300"}`}>{body}</p>
            <div className={`my-5 border-t-2 border-dashed ${highlighted ? "border-ink-950/40" : "border-ink-300 dark:border-ink-700"}`} />
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li key={f} className={`flex items-start gap-2.5 text-sm ${highlighted ? "text-ink-950" : "text-ink-800 dark:text-ink-200"}`}>
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border-[1.5px] ${
                      highlighted ? "border-ink-950 bg-ink-950 text-brand-400" : "border-ink-950 text-ink-950 dark:border-ink-300 dark:text-white"
                    }`}
                  >
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            {plan === "starter" ? (
              <LinkButton href="/store-builder" variant="outline" className="mt-7 w-full">
                {cta}
              </LinkButton>
            ) : (
              <Button variant={highlighted ? "secondary" : "outline"} className="mt-7 w-full" onClick={handleClick} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={15} />} {cta}
              </Button>
            )}
            {error && <p className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── FAQ ticket ───────────── */

function FaqItem({ q, a, number }: { q: string; a: string; number: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`surface-label flex overflow-hidden rounded-xl border-[1.5px] border-ink-950 transition-shadow dark:border-ink-700 ${open ? "shadow-[5px_5px_0_0_var(--color-ink-950)] dark:shadow-[5px_5px_0_0_#000]" : ""}`}>
      <div className={`hidden w-24 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-ink-300 px-2 py-4 text-center sm:flex dark:border-ink-700 ${open ? "bg-brand-400 text-ink-950" : ""}`}>
        <span className="font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.12em]">{number}</span>
      </div>
      <div className="min-w-0 flex-1">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
          <span className="font-display text-[15px] font-bold tracking-[-0.015em] text-ink-950 dark:text-white">{q}</span>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink-950 transition-transform dark:border-ink-400 ${open ? "rotate-180 bg-ink-950 text-[#fffdf8] dark:bg-ink-100 dark:text-ink-950" : ""}`}>
            <ChevronDown size={15} />
          </span>
        </button>
        {open && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{a}</p>}
      </div>
    </div>
  );
}
