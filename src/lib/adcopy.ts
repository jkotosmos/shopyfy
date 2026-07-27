import { makeRng, pick } from "./seed";
import type { Lang } from "./i18n";

export interface AdAngle {
  angle: string;
  hook: string;
  body: string;
  cta: string;
}

const HOOKS: Record<Lang, Record<string, ((p: string) => string)[]>> = {
  ru: {
    "Проблема → решение": [
      (p) => `Устали сталкиваться с этим каждый день? ${p} решает это за секунды.`,
      (p) => `Никто не говорит, насколько это раздражает, пока не попробуешь ${p}.`,
    ],
    Любопытство: [
      (p) => `${p} озадачил уже 40 тысяч человек — все спрашивают, как это работает.`,
      (p) => `Почему все вдруг покупают ${p}? Вот что мы выяснили.`,
    ],
    "Социальное доказательство": [
      (p) => `Больше 12 000 человек перешли на ${p} за этот месяц. Вот почему.`,
      (p) => `Мы не ожидали, что ${p} раскупят за 48 часов. Но так и случилось.`,
    ],
    "Срочность / дефицит": [
      (p) => `Партия ${p} снова почти распродана.`,
      (p) => `Последняя партия ${p} по этой цене. Следующая поставка будет дороже.`,
    ],
    "До / после": [
      (p) => `До ${p}: раздражало. После: реально затягивает.`,
      (p) => `POV: ты наконец попробовал ${p}, о котором все говорили.`,
    ],
  },
  en: {
    "Problem → Solution": [
      (p) => `Tired of dealing with this every day? ${p} fixes it in seconds.`,
      (p) => `Nobody tells you how annoying this is until you try ${p}.`,
    ],
    Curiosity: [
      (p) => `${p} has confused 40,000 people already — everyone's asking how it works.`,
      (p) => `Why is everyone suddenly buying ${p}? Here's what we found out.`,
    ],
    "Social Proof": [
      (p) => `12,000+ people switched to ${p} this month. Here's why.`,
      (p) => `We didn't expect ${p} to sell out in 48 hours. It did.`,
    ],
    "Urgency / Scarcity": [
      (p) => `${p} is almost sold out again.`,
      (p) => `Last batch of ${p} at this price. The next restock costs more.`,
    ],
    "Before / After": [
      (p) => `Before ${p}: annoying. After: actually addictive.`,
      (p) => `POV: you finally tried the ${p} everyone's been talking about.`,
    ],
  },
};

const BODIES: Record<Lang, ((p: string, benefit: string) => string)[]> = {
  ru: [
    (p, benefit) => `${p} создан ради одной цели: ${benefit}. Никакого привыкания, никаких уловок — просто небольшое ежедневное улучшение, которое легко оправдать по такой цене.`,
    (p, benefit) => `Мы протестировали десяток вариантов, прежде чем остановиться на этом. ${p} — единственный, который реально даёт ${benefit} без обычных компромиссов.`,
    (p, benefit) => `Если вы откладывали ${benefit}, ${p} убирает последнюю отговорку. Быстрая доставка, гарантия 30 дней.`,
  ],
  en: [
    (p, benefit) => `${p} was built for one thing: ${benefit}. No gimmicks — just a small daily upgrade that's easy to justify at this price.`,
    (p, benefit) => `We tested a dozen versions before settling on this one. ${p} is the only one that actually delivers ${benefit} without the usual trade-offs.`,
    (p, benefit) => `If you've been putting off ${benefit}, ${p} removes the last excuse. Fast shipping, 30-day guarantee.`,
  ],
};

const CTAS: Record<Lang, string[]> = {
  ru: [
    "Купить, пока есть в наличии →",
    "Узнать, почему все об этом говорят →",
    "Успеть до повышения цены →",
    "Попробовать без риска в течение 30 дней →",
  ],
  en: [
    "Shop it before it's gone →",
    "See why everyone's talking about it →",
    "Get it before the price goes up →",
    "Try it risk-free for 30 days →",
  ],
};

const HASHTAG_POOL: Record<Lang, string[]> = {
  ru: ["TikTokMadeMeBuyIt", "ViralProducts", "MustHave", "ТрендыTikTok", "Тренд2026", "Хочусебе", "Скидкадня", "Новинка", "Маркетплейс", "ТопПродаж", "Wildberries", "OZON"],
  en: ["TikTokMadeMeBuyIt", "ViralProducts", "MustHave", "TikTokTrends", "Trending2026", "ShopNow", "DealOfTheDay", "NewArrival", "SmallBusiness", "TopSeller", "OnlineShopping", "ProductOfTheDay"],
};

export function generateAdAngles(productName: string, benefit: string, lang: Lang = "ru"): AdAngle[] {
  const rng = makeRng(`${productName}|${benefit}|${lang}`);
  return Object.entries(HOOKS[lang]).map(([angle, hooks]) => ({
    angle,
    hook: pick(rng, hooks)(productName),
    body: pick(rng, BODIES[lang])(productName, benefit),
    cta: pick(rng, CTAS[lang]),
  }));
}

const TRANSLIT_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

// Cyrillic-safe hashtag slug: transliterates, then CamelCases each word,
// so both English and Russian product/category names produce a usable tag
// instead of stripping every Cyrillic character down to an empty string.
function toHashtagSlug(input: string): string {
  const translit = input
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT_MAP[ch] ?? ch)
    .join("");
  return translit
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

export function generateHashtags(productName: string, category: string, lang: Lang = "ru"): string[] {
  const rng = makeRng(`${productName}|${category}|tags|${lang}`);
  const base = toHashtagSlug(category);
  const productTag = toHashtagSlug(productName);
  const pool = [...HASHTAG_POOL[lang], base, productTag].filter(Boolean);
  const chosen = new Set<string>();
  while (chosen.size < 6 && chosen.size < pool.length) {
    chosen.add(pick(rng, pool));
  }
  return Array.from(chosen).map((t) => `#${t}`);
}
