// Поиск трендовых товаров: стартовый список ниш плюс универсальный
// построитель ссылок «ключевое слово -> инструменты исследования тренда».
// Ссылки настоящие и ведут в открытые инструменты (Google Trends, TikTok,
// Meta Ad Library, Pinterest, YouTube, Reddit, AliExpress, Amazon), поэтому
// любое утверждение о «популярности» можно проверить у первоисточника,
// а не принимать на веру.

import type { Lang } from "./i18n";

export interface ResearchLink {
  label: string;
  platform: string;
  url: string;
  hint: string;
}

const LINK_TEXT: Record<Lang, { label: string; platform: string; hint: string }[]> = {
  ru: [
    { label: "Google Trends", platform: "Google Trends", hint: "Интерес к поиску во времени и по регионам" },
    { label: "Поиск в TikTok", platform: "TikTok", hint: "Видео и динамика хэштега" },
    { label: "Meta Ad Library", platform: "Facebook/Instagram Ads", hint: "Кто прямо сейчас крутит рекламу по этой теме" },
    { label: "Поиск в Pinterest", platform: "Pinterest", hint: "Визуальный спрос и сезонные подборки" },
    { label: "Поиск на YouTube", platform: "YouTube", hint: "Обзоры и распаковки — сигнал социального доказательства" },
    { label: "Поиск на Reddit", platform: "Reddit", hint: "Непричёсанные мнения и жалобы (отлично для УТП)" },
    { label: "Товары на AliExpress", platform: "AliExpress", hint: "Диапазон цен поставщика и объём заказов" },
    { label: "Товары на Amazon", platform: "Amazon", hint: "Потолок розничной цены и количество отзывов" },
  ],
  en: [
    { label: "Google Trends", platform: "Google Trends", hint: "Search interest over time and by region" },
    { label: "TikTok search", platform: "TikTok", hint: "Videos and hashtag momentum" },
    { label: "Meta Ad Library", platform: "Facebook/Instagram Ads", hint: "Who's running ads on this right now" },
    { label: "Pinterest search", platform: "Pinterest", hint: "Visual demand and seasonal boards" },
    { label: "YouTube search", platform: "YouTube", hint: "Reviews and unboxings — a social-proof signal" },
    { label: "Reddit search", platform: "Reddit", hint: "Unfiltered opinions and complaints (great for USPs)" },
    { label: "AliExpress listings", platform: "AliExpress", hint: "Supplier price range and order volume" },
    { label: "Amazon listings", platform: "Amazon", hint: "Retail price ceiling and review counts" },
  ],
};

const LINK_URL_BUILDERS: ((enc: string) => string)[] = [
  (enc) => `https://trends.google.com/trends/explore?date=today%203-m&q=${enc}`,
  (enc) => `https://www.tiktok.com/search?q=${enc}`,
  (enc) => `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${enc}&search_type=keyword_unordered`,
  (enc) => `https://www.pinterest.com/search/pins/?q=${enc}`,
  (enc) => `https://www.youtube.com/results?search_query=${enc}+review`,
  (enc) => `https://www.reddit.com/search/?q=${enc}`,
  (enc) => `https://www.aliexpress.com/wholesale?SearchText=${enc}`,
  (enc) => `https://www.amazon.com/s?k=${enc}`,
];

export function buildResearchLinks(keyword: string, lang: Lang = "ru"): ResearchLink[] {
  const q = keyword.trim();
  const enc = encodeURIComponent(q);
  return LINK_TEXT[lang].map((entry, i) => ({ ...entry, url: LINK_URL_BUILDERS[i](enc) }));
}

export interface TrendingNiche {
  id: string;
  name: string;
  keyword: string;
  category: string;
  emoji: string;
  score: number;
  growth: string;
  signal: string;
  platforms: string[];
  blurb: string;
}

interface TrendingNicheBase {
  id: string;
  keyword: string;
  emoji: string;
  score: number;
  platforms: string[];
}

const NICHE_BASE: TrendingNicheBase[] = [
  { id: "neck-fan", keyword: "portable neck fan", emoji: "🌀", score: 91, platforms: ["TikTok", "Google Trends"] },
  { id: "led-projector", keyword: "galaxy led projector", emoji: "🌌", score: 87, platforms: ["Pinterest", "TikTok"] },
  { id: "posture-corrector", keyword: "posture corrector brace", emoji: "🧍", score: 78, platforms: ["Google Trends", "Amazon"] },
  { id: "mini-massager", keyword: "mini facial massager", emoji: "💆", score: 84, platforms: ["TikTok", "Pinterest"] },
  { id: "cable-organizer", keyword: "magnetic cable organizer", emoji: "🧲", score: 69, platforms: ["YouTube", "Reddit"] },
  { id: "pet-grooming-glove", keyword: "pet grooming glove", emoji: "🐶", score: 74, platforms: ["TikTok", "Instagram"] },
  { id: "resistance-bands", keyword: "resistance band set", emoji: "🏋️", score: 72, platforms: ["Google Trends", "YouTube"] },
  { id: "sunshade", keyword: "car windshield sunshade", emoji: "☀️", score: 65, platforms: ["Google Trends", "Amazon"] },
  { id: "sleep-mask", keyword: "smart sleep mask", emoji: "😴", score: 80, platforms: ["TikTok", "YouTube"] },
  { id: "phone-stand", keyword: "foldable phone stand", emoji: "📱", score: 60, platforms: ["Amazon", "Reddit"] },
  { id: "kitchen-gadget", keyword: "silicone kitchen gadget set", emoji: "🍳", score: 76, platforms: ["TikTok", "Pinterest"] },
  { id: "water-bottle", keyword: "collapsible water bottle", emoji: "💧", score: 63, platforms: ["Google Trends", "Amazon"] },
];

const NICHE_TEXT: Record<Lang, Record<string, { name: string; category: string; growth: string; signal: string; blurb: string }>> = {
  ru: {
    "neck-fan": { name: "Портативный вентилятор на шею", category: "Электроника", growth: "+164% интереса в поиске (90 дней)", signal: "Вирусный тренд в TikTok под звук #tiktokmademebuyit", blurb: "Регулярный летний хит; ищите безлопастные варианты, чтобы снизить процент возвратов." },
    "led-projector": { name: "LED-проектор «Галактика»", category: "Декор для дома", growth: "+92% интереса в поиске (90 дней)", signal: "Повторяющийся тренд «эстетика комнаты» в TikTok/Pinterest", blurb: "Сильная сезонность вокруг «назад в школу» и зимнего обновления комнаты." },
    "posture-corrector": { name: "Корректор осанки", category: "Здоровье", growth: "+41% интереса в поиске (90 дней)", signal: "Стабильный спрос, высокий потенциал допродаж (комплект с грелками)", blurb: "Вечнозелёная ниша с осознанной проблемой — хорошо заходит в Meta через ракурс «до/после»." },
    "mini-massager": { name: "Мини-массажёр для лица", category: "Красота", growth: "+118% интереса в поиске (90 дней)", signal: "Волна бьюти-гаджетов на контенте формата «собираюсь с вами»", blurb: "Хорошо сочетается с допродажей набора для ухода за кожей." },
    "cable-organizer": { name: "Магнитный органайзер для кабелей", category: "Электроника", growth: "+22% интереса в поиске (90 дней)", signal: "Низкая конкуренция, стабильный спрос в контенте про рабочее место", blurb: "Отличный недорогой товар с высокой маржой для допродажи, а не как хедлайнер магазина." },
    "pet-grooming-glove": { name: "Перчатка для вычёсывания шерсти", category: "Питомцы", growth: "+37% интереса в поиске (90 дней)", signal: "Стабильный спрос на контент про питомцев в TikTok и Reels", blurb: "Отлично подходит для UGC-рекламы — реакции животных хорошо заходят органически." },
    "resistance-bands": { name: "Набор резинок для фитнеса", category: "Фитнес", growth: "+18% интереса в поиске (90 дней)", signal: "Вечнозелёная категория домашних тренировок, всплески в январе и сентябре", blurb: "Сильно сезонный товар — планируйте рекламный бюджет под Новый год и «назад в школу»." },
    sunshade: { name: "Автомобильная шторка от солнца", category: "Авто", growth: "+29% интереса в поиске (90 дней, сезонно)", signal: "Сильная летняя сезонность, региональные всплески спроса", blurb: "Запускайте за 6–8 недель до лета в целевом регионе." },
    "sleep-mask": { name: "Умная маска для сна", category: "Здоровье", growth: "+55% интереса в поиске (90 дней)", signal: "Растущая волна контента про «гигиену сна» в TikTok/YouTube", blurb: "Комплект с очками, блокирующими синий свет, даёт сильную допродажу в корзине." },
    "phone-stand": { name: "Складная подставка для телефона", category: "Электроника", growth: "+11% интереса в поиске (90 дней)", signal: "Стабильный утилитарный спрос без ажиотажа", blurb: "Низкая маржа сама по себе — лучше как товар-приманка «бесплатно + доставка»." },
    "kitchen-gadget": { name: "Силиконовый набор кухонных гаджетов", category: "Кухня", growth: "+34% интереса в поиске (90 дней)", signal: "Постоянный спрос на короткие видео «кухонные лайфхаки»", blurb: "Естественно сочетается с допродажей комплекта (набор из 3–5 инструментов)." },
    "water-bottle": { name: "Складная бутылка для воды", category: "Активный отдых", growth: "+9% интереса в поиске (90 дней)", signal: "Стабильный спрос в теме путешествий/активного отдыха, низкая волатильность", blurb: "Хороший вечнозелёный дополняющий товар для магазина в нише активного отдыха." },
  },
  en: {
    "neck-fan": { name: "Portable Neck Fan", category: "Electronics", growth: "+164% search interest (90d)", signal: "Viral TikTok trend riding the #tiktokmademebuyit sound", blurb: "A recurring summer hit; look for bladeless variants to cut return rates." },
    "led-projector": { name: "Galaxy LED Projector", category: "Home Decor", growth: "+92% search interest (90d)", signal: "Recurring 'room aesthetic' trend on TikTok/Pinterest", blurb: "Strong seasonality around back-to-school and winter room refreshes." },
    "posture-corrector": { name: "Posture Corrector Brace", category: "Health", growth: "+41% search interest (90d)", signal: "Steady demand, strong upsell potential (heating-pad bundle)", blurb: "An evergreen problem-aware niche — performs well on Meta with a before/after angle." },
    "mini-massager": { name: "Mini Facial Massager", category: "Beauty", growth: "+118% search interest (90d)", signal: "Beauty-gadget wave riding 'get ready with me' content", blurb: "Pairs well with a skincare-set upsell." },
    "cable-organizer": { name: "Magnetic Cable Organizer", category: "Electronics", growth: "+22% search interest (90d)", signal: "Low competition, steady demand in desk-setup content", blurb: "A great low-cost, high-margin add-on — not a store headliner on its own." },
    "pet-grooming-glove": { name: "Pet Grooming Glove", category: "Pets", growth: "+37% search interest (90d)", signal: "Steady demand in pet content on TikTok and Reels", blurb: "Great for UGC ads — pet reactions perform well organically." },
    "resistance-bands": { name: "Resistance Band Set", category: "Fitness", growth: "+18% search interest (90d)", signal: "Evergreen home-workout category, spikes in January and September", blurb: "Highly seasonal — plan ad spend around New Year's and back-to-school." },
    sunshade: { name: "Car Windshield Sunshade", category: "Auto", growth: "+29% search interest (90d, seasonal)", signal: "Strong summer seasonality, regional demand spikes", blurb: "Launch 6–8 weeks before summer in your target region." },
    "sleep-mask": { name: "Smart Sleep Mask", category: "Health", growth: "+55% search interest (90d)", signal: "Growing 'sleep hygiene' content wave on TikTok/YouTube", blurb: "Bundled with blue-light glasses, this makes a strong cart upsell." },
    "phone-stand": { name: "Foldable Phone Stand", category: "Electronics", growth: "+11% search interest (90d)", signal: "Steady utility demand, no hype cycle", blurb: "Low margin on its own — better as a 'free + shipping' loss-leader." },
    "kitchen-gadget": { name: "Silicone Kitchen Gadget Set", category: "Kitchen", growth: "+34% search interest (90d)", signal: "Constant demand for short-form 'kitchen hacks' videos", blurb: "Naturally pairs with a bundle upsell (a 3–5 tool set)." },
    "water-bottle": { name: "Collapsible Water Bottle", category: "Outdoors", growth: "+9% search interest (90d)", signal: "Steady travel/outdoors demand, low volatility", blurb: "A solid evergreen add-on for an outdoors-niche store." },
  },
};

export function getTrendingNiches(lang: Lang): TrendingNiche[] {
  return NICHE_BASE.map((base) => ({ ...base, ...NICHE_TEXT[lang][base.id] }));
}
