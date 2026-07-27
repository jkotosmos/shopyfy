// Поиск трендовых товаров: стартовый список ниш плюс универсальный
// построитель ссылок «ключевое слово -> инструменты исследования тренда».
// Ссылки настоящие и ведут в открытые инструменты (Google Trends, TikTok,
// Meta Ad Library, Pinterest, YouTube, Reddit, AliExpress, Amazon), поэтому
// любое утверждение о «популярности» можно проверить у первоисточника,
// а не принимать на веру.

export interface ResearchLink {
  label: string;
  platform: string;
  url: string;
  hint: string;
}

export function buildResearchLinks(keyword: string): ResearchLink[] {
  const q = keyword.trim();
  const enc = encodeURIComponent(q);
  return [
    {
      label: "Google Trends",
      platform: "Google Trends",
      url: `https://trends.google.com/trends/explore?date=today%203-m&q=${enc}`,
      hint: "Интерес к поиску во времени и по регионам",
    },
    {
      label: "Поиск в TikTok",
      platform: "TikTok",
      url: `https://www.tiktok.com/search?q=${enc}`,
      hint: "Видео и динамика хэштега",
    },
    {
      label: "Meta Ad Library",
      platform: "Facebook/Instagram Ads",
      url: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${enc}&search_type=keyword_unordered`,
      hint: "Кто прямо сейчас крутит рекламу по этой теме",
    },
    {
      label: "Поиск в Pinterest",
      platform: "Pinterest",
      url: `https://www.pinterest.com/search/pins/?q=${enc}`,
      hint: "Визуальный спрос и сезонные подборки",
    },
    {
      label: "Поиск на YouTube",
      platform: "YouTube",
      url: `https://www.youtube.com/results?search_query=${enc}+review`,
      hint: "Обзоры и распаковки — сигнал социального доказательства",
    },
    {
      label: "Поиск на Reddit",
      platform: "Reddit",
      url: `https://www.reddit.com/search/?q=${enc}`,
      hint: "Непричёсанные мнения и жалобы (отлично для УТП)",
    },
    {
      label: "Товары на AliExpress",
      platform: "AliExpress",
      url: `https://www.aliexpress.com/wholesale?SearchText=${enc}`,
      hint: "Диапазон цен поставщика и объём заказов",
    },
    {
      label: "Товары на Amazon",
      platform: "Amazon",
      url: `https://www.amazon.com/s?k=${enc}`,
      hint: "Потолок розничной цены и количество отзывов",
    },
  ];
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

// Стартовый список для затравки исследования — воспринимайте баллы/рост как
// ориентир, а не как данные в реальном времени. Переходите по ссылкам-источникам
// в каждой карточке (или ищите своё ключевое слово выше), чтобы проверить
// актуальные цифры самостоятельно.
export const TRENDING_NICHES: TrendingNiche[] = [
  { id: "neck-fan", name: "Портативный вентилятор на шею", keyword: "portable neck fan", category: "Электроника", emoji: "🌀", score: 91, growth: "+164% интереса в поиске (90 дней)", signal: "Вирусный тренд в TikTok под звук #tiktokmademebuyit", platforms: ["TikTok", "Google Trends"], blurb: "Регулярный летний хит; ищите безлопастные варианты, чтобы снизить процент возвратов." },
  { id: "led-projector", name: "LED-проектор «Галактика»", keyword: "galaxy led projector", category: "Декор для дома", emoji: "🌌", score: 87, growth: "+92% интереса в поиске (90 дней)", signal: "Повторяющийся тренд «эстетика комнаты» в TikTok/Pinterest", platforms: ["Pinterest", "TikTok"], blurb: "Сильная сезонность вокруг «назад в школу» и зимнего обновления комнаты." },
  { id: "posture-corrector", name: "Корректор осанки", keyword: "posture corrector brace", category: "Здоровье", emoji: "🧍", score: 78, growth: "+41% интереса в поиске (90 дней)", signal: "Стабильный спрос, высокий потенциал допродаж (комплект с грелками)", platforms: ["Google Trends", "Amazon"], blurb: "Вечнозелёная ниша с осознанной проблемой — хорошо заходит в Meta через ракурс «до/после»." },
  { id: "mini-massager", name: "Мини-массажёр для лица", keyword: "mini facial massager", category: "Красота", emoji: "💆", score: 84, growth: "+118% интереса в поиске (90 дней)", signal: "Волна бьюти-гаджетов на контенте формата «собираюсь с вами»", platforms: ["TikTok", "Pinterest"], blurb: "Хорошо сочетается с допродажей набора для ухода за кожей." },
  { id: "cable-organizer", name: "Магнитный органайзер для кабелей", keyword: "magnetic cable organizer", category: "Электроника", emoji: "🧲", score: 69, growth: "+22% интереса в поиске (90 дней)", signal: "Низкая конкуренция, стабильный спрос в контенте про рабочее место", platforms: ["YouTube", "Reddit"], blurb: "Отличный недорогой товар с высокой маржой для допродажи, а не как хедлайнер магазина." },
  { id: "pet-grooming-glove", name: "Перчатка для вычёсывания шерсти", keyword: "pet grooming glove", category: "Питомцы", emoji: "🐶", score: 74, growth: "+37% интереса в поиске (90 дней)", signal: "Стабильный спрос на контент про питомцев в TikTok и Reels", platforms: ["TikTok", "Instagram"], blurb: "Отлично подходит для UGC-рекламы — реакции животных хорошо заходят органически." },
  { id: "resistance-bands", name: "Набор резинок для фитнеса", keyword: "resistance band set", category: "Фитнес", emoji: "🏋️", score: 72, growth: "+18% интереса в поиске (90 дней)", signal: "Вечнозелёная категория домашних тренировок, всплески в январе и сентябре", platforms: ["Google Trends", "YouTube"], blurb: "Сильно сезонный товар — планируйте рекламный бюджет под Новый год и «назад в школу»." },
  { id: "sunshade", name: "Автомобильная шторка от солнца", keyword: "car windshield sunshade", category: "Авто", emoji: "☀️", score: 65, growth: "+29% интереса в поиске (90 дней, сезонно)", signal: "Сильная летняя сезонность, региональные всплески спроса", platforms: ["Google Trends", "Amazon"], blurb: "Запускайте за 6–8 недель до лета в целевом регионе." },
  { id: "sleep-mask", name: "Умная маска для сна", keyword: "smart sleep mask", category: "Здоровье", emoji: "😴", score: 80, growth: "+55% интереса в поиске (90 дней)", signal: "Растущая волна контента про «гигиену сна» в TikTok/YouTube", platforms: ["TikTok", "YouTube"], blurb: "Комплект с очками, блокирующими синий свет, даёт сильную допродажу в корзине." },
  { id: "phone-stand", name: "Складная подставка для телефона", keyword: "foldable phone stand", category: "Электроника", emoji: "📱", score: 60, growth: "+11% интереса в поиске (90 дней)", signal: "Стабильный утилитарный спрос без ажиотажа", platforms: ["Amazon", "Reddit"], blurb: "Низкая маржа сама по себе — лучше как товар-приманка «бесплатно + доставка»." },
  { id: "kitchen-gadget", name: "Силиконовый набор кухонных гаджетов", keyword: "silicone kitchen gadget set", category: "Кухня", emoji: "🍳", score: 76, growth: "+34% интереса в поиске (90 дней)", signal: "Постоянный спрос на короткие видео «кухонные лайфхаки»", platforms: ["TikTok", "Pinterest"], blurb: "Естественно сочетается с допродажей комплекта (набор из 3–5 инструментов)." },
  { id: "water-bottle", name: "Складная бутылка для воды", keyword: "collapsible water bottle", category: "Активный отдых", emoji: "💧", score: 63, growth: "+9% интереса в поиске (90 дней)", signal: "Стабильный спрос в теме путешествий/активного отдыха, низкая волатильность", platforms: ["Google Trends", "Amazon"], blurb: "Хороший вечнозелёный дополняющий товар для магазина в нише активного отдыха." },
];
