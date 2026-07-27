import { makeRng, pick, pickMany, randInt } from "./seed";
import { detectNiche, type Niche } from "./niches";

export type SourceMarketplace = "AliExpress" | "Amazon" | "Alibaba" | "Shopify" | "по ссылке" | "по названию товара";

export interface GeneratedStore {
  input: string;
  source: SourceMarketplace;
  productName: string;
  niche: Niche;
  storeName: string;
  domainSuggestion: string;
  tagline: string;
  heroHeadline: string;
  heroSub: string;
  description: string;
  usps: string[];
  collections: string[];
  pageSections: string[];
  bundleUpsell: { title: string; discount: string };
  cartUpsell: { title: string; addOn: string; price: string };
  cost: number;
  price: number;
  marginPct: number;
  marketScore: number;
  competitionLabel: string;
  buildSteps: string[];
}

const NOISE_TOKENS = new Set([
  "dp", "gp", "product", "products", "item", "items", "i", "html", "htm", "pdt", "pd",
  "ref", "the", "for", "and", "with", "new", "hot", "sale", "free", "shipping",
  "store", "shop", "official", "wholesale", "detail", "detail_page", "aliexpress",
  "amazon", "alibaba", "shopify", "www", "com", "net", "org", "search", "wholesale2",
  "spm", "sku", "id", "index",
]);

function looksLikeCode(token: string): boolean {
  // e.g. B08N5WRWNW, 1005006, 32849xyz1 — SKUs / ASINs / numeric ids
  if (/^\d+$/.test(token)) return true;
  if (/^[a-z]\d[a-z0-9]{6,}$/i.test(token)) return true;
  if (/^[a-z]{1,3}\d{3,}$/i.test(token)) return true;
  return false;
}

function titleCase(words: string[]): string {
  return words
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
}

function detectSource(url: URL | null, raw: string): SourceMarketplace {
  const host = url?.hostname.toLowerCase() ?? "";
  if (host.includes("aliexpress")) return "AliExpress";
  if (host.includes("amazon")) return "Amazon";
  if (host.includes("alibaba")) return "Alibaba";
  if (host.includes("myshopify") || host.includes("shopify")) return "Shopify";
  if (url) return "по ссылке";
  return raw.trim() ? "по названию товара" : "по названию товара";
}

function extractProductWords(url: URL): string[] {
  const segments = decodeURIComponent(url.pathname)
    .split(/[/]/)
    .flatMap((seg) => seg.split(/[-_+.]/))
    .map((w) => w.trim())
    .filter(Boolean);

  const words = segments.filter((w) => {
    if (NOISE_TOKENS.has(w.toLowerCase())) return false;
    if (looksLikeCode(w)) return false;
    if (!/[a-zA-Z]/.test(w)) return false;
    return true;
  });

  if (words.length >= 2) return words.slice(0, 6);

  // fall back to query params that often carry the search/product text
  const q = url.searchParams.get("keywords") || url.searchParams.get("SearchText") || url.searchParams.get("q");
  if (q) {
    return q.split(/[\s\-_+.]/).filter((w) => w && !NOISE_TOKENS.has(w.toLowerCase())).slice(0, 6);
  }
  return words;
}

const FALLBACK_PRODUCTS = [
  "Портативный вентилятор на шею", "Магнитный органайзер для кабелей", "LED-проектор галактики",
  "Корректор осанки", "Силиконовый набор кухонных гаджетов", "Мини-массажёр для лица",
  "Складная подставка для телефона", "Перчатка для вычёсывания шерсти", "Набор резинок для фитнеса",
  "Автомобильная шторка от солнца", "Складная бутылка для воды", "Умная маска для сна",
];

function resolveProductName(input: string): { name: string; url: URL | null } {
  let url: URL | null = null;
  try {
    url = new URL(input.trim());
  } catch {
    url = null;
  }

  if (!url) {
    const clean = input.trim();
    return { name: clean.length > 2 ? titleCase(clean.split(/\s+/)) : pick(makeRng(input || "seed"), FALLBACK_PRODUCTS), url: null };
  }

  const words = extractProductWords(url);
  if (words.length === 0) {
    return { name: pick(makeRng(input), FALLBACK_PRODUCTS), url };
  }
  return { name: titleCase(words), url };
}

const STORE_NAME_TEMPLATES = [
  (w: string) => `${w}ify`,
  (w: string) => `Get${w}`,
  (w: string) => `${w} Haven`,
  (w: string) => `The ${w} Edit`,
  (w: string) => `${w} Co.`,
  (w: string) => `My${w}`,
  (w: string) => `${w} Studio`,
  (w: string) => `Daily ${w}`,
  (w: string) => `${w} Nest`,
  (w: string) => `Urban ${w}`,
];

const TAGLINES = [
  "Небольшое улучшение — большая разница.",
  "Та самая вещь, о которой все спрашивают.",
  "Для тех, кто замечает детали.",
  "Повседневные вещи на новом уровне.",
  "Потому что хороший дизайн не должен быть редкостью.",
  "Ваш новый фаворит уже в пути.",
  "Просто. Полезно. Реально работает.",
  "Создано под то, как вы живёте на самом деле.",
];

const USP_TEMPLATES = [
  (p: string) => `Материалы премиум-класса делают ${p} заметно долговечнее типичных аналогов`,
  (p: string) => `Бесплатная доставка по всему миру и возврат в течение 30 дней на каждый заказ ${p}`,
  (_p: string) => `Средний рейтинг 4.7★ по первым отзывам покупателей`,
  (_p: string) => `Отправляется в неприметной эко-упаковке в течение 24 часов`,
  (_p: string) => `Продуман для ежедневного использования без привыкания`,
  (_p: string) => `Ограниченная первая партия — обычно раскупается за 2 недели`,
  (_p: string) => `Компактный для путешествий и достаточно прочный для ежедневного использования`,
  (_p: string) => `Год гарантии и реальная поддержка живых людей`,
];

const SECTION_POOL = [
  "Hero-баннер с видео товара",
  "Блок «проблема → решение»",
  "Сетка ключевых преимуществ",
  "Слайдер «до / после»",
  "Карусель отзывов покупателей",
  "Галерея UGC-контента из Instagram/TikTok",
  "Таблица сравнения размеров/характеристик",
  "Блок часто задаваемых вопросов",
  "Плашки доверия и гарантии",
  "Липкая панель «добавить в корзину»",
  "Баннер обратного отсчёта до допродажи",
  "Блок «комплект и экономия»",
];

const COLLECTION_POOL = [
  "Хиты продаж", "Новинки", "До $30", "Выбор редакции",
  "В тренде на этой неделе", "Идеи подарков", "Комплекты со скидкой", "Снова в наличии",
];

const BUILD_STEPS = [
  "Читаем ссылку на товар…",
  "Сверяем с 1200+ похожими товарами…",
  "Анализируем спрос и конкуренцию…",
  "Придумываем название и стиль бренда…",
  "Пишем тексты для страницы товара…",
  "Генерируем секции и структуру страницы…",
  "Собираем комплект-предложения и допродажи в корзине…",
  "Оптимизируем под мобильную конверсию…",
  "Магазин готов ✅",
];

export function generateStore(rawInput: string): GeneratedStore {
  const { name: productName, url } = resolveProductName(rawInput);
  const source = detectSource(url, rawInput);
  const niche = detectNiche(`${rawInput} ${productName}`);
  const rng = makeRng(rawInput.trim().toLowerCase() || productName);

  const keyWord = productName.split(" ").filter((w) => w.length > 3)[0] || productName.split(" ")[0] || "Store";
  const storeName = pick(rng, STORE_NAME_TEMPLATES)(keyWord);
  const domainSuggestion = `${storeName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}.com`;

  const tagline = pick(rng, TAGLINES);
  const heroHeadline = `${productName}: ${tagline.replace(/\.$/, "")}`;
  const heroSub = `Узнайте, почему покупатели выбирают ${productName.toLowerCase()}. Вот что это даёт: ${niche.benefit}.`;

  const description = `${productName} был выбран потому, что решает реальную, регулярно возникающую проблему, связанную с идеей «${niche.benefit}». Наш ИИ проанализировал цены, отзывы и рекламную активность в категории перед тем, как сгенерировать страницу, отвечающую на возражения покупателя по порядку: что это, чем отличается, доказательства эффективности и простой способ попробовать.`;

  const usps = pickMany(rng, USP_TEMPLATES, 3).map((fn) => fn(productName));
  const collections = ["Хиты продаж", ...pickMany(rng, COLLECTION_POOL.slice(1), 3)];
  const pageSections = pickMany(rng, SECTION_POOL, 6);

  const bundleDiscountPct = randInt(rng, 10, 20);
  const bundleUpsell = {
    title: `Купи 2, экономь ${bundleDiscountPct}%`,
    discount: `Комплект из 3 → экономия ${bundleDiscountPct + 8}%`,
  };
  const cartUpsell = {
    title: `Дополните комплект`,
    addOn: `Добавить дорожный чехол`,
    price: `+$${randInt(rng, 6, 14)}.99`,
  };

  const [costMin, costMax] = niche.costRange;
  const cost = Math.round((costMin + rng() * (costMax - costMin)) * 100) / 100;
  const markup = 2.6 + rng() * 2.2; // typical dropshipping markup range
  const price = Math.round(cost * markup * 100) / 100;
  const marginPct = Math.round(((price - cost) / price) * 100);

  const marketScore = randInt(rng, 58, 96);
  const competitionLabel = marketScore > 85 ? "Высокий спрос, умеренная конкуренция" : marketScore > 70 ? "Стабильный спрос, конкуренция ниже средней" : "Нишевый спрос, низкая конкуренция";

  return {
    input: rawInput,
    source,
    productName,
    niche,
    storeName,
    domainSuggestion,
    tagline,
    heroHeadline,
    heroSub,
    description,
    usps,
    collections,
    pageSections,
    bundleUpsell,
    cartUpsell,
    cost,
    price,
    marginPct,
    marketScore,
    competitionLabel,
    buildSteps: BUILD_STEPS,
  };
}
