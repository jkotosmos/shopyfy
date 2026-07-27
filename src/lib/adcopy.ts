import { makeRng, pick } from "./seed";

export interface AdAngle {
  angle: string;
  hook: string;
  body: string;
  cta: string;
}

const HOOKS: Record<string, ((p: string) => string)[]> = {
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
};

const BODIES = [
  (p: string, benefit: string) => `${p} создан ради одной цели: ${benefit}. Никакого привыкания, никаких уловок — просто небольшое ежедневное улучшение, которое легко оправдать по такой цене.`,
  (p: string, benefit: string) => `Мы протестировали десяток вариантов, прежде чем остановиться на этом. ${p} — единственный, который реально даёт ${benefit} без обычных компромиссов.`,
  (p: string, benefit: string) => `Если вы откладывали ${benefit}, ${p} убирает последнюю отговорку. Быстрая доставка, гарантия 30 дней.`,
];

const CTAS = [
  "Купить, пока есть в наличии →",
  "Узнать, почему все об этом говорят →",
  "Успеть до повышения цены →",
  "Попробовать без риска в течение 30 дней →",
];

const HASHTAG_POOL = [
  "TikTokMadeMeBuyIt", "ViralProducts", "MustHave", "ТрендыTikTok", "Тренд2026",
  "Хочусебе", "Скидкадня", "Новинка", "Маркетплейс", "ТопПродаж", "Wildberries", "OZON",
];

export function generateAdAngles(productName: string, benefit: string): AdAngle[] {
  const rng = makeRng(`${productName}|${benefit}`);
  return Object.entries(HOOKS).map(([angle, hooks]) => ({
    angle,
    hook: pick(rng, hooks)(productName),
    body: pick(rng, BODIES)(productName, benefit),
    cta: pick(rng, CTAS),
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

export function generateHashtags(productName: string, category: string): string[] {
  const rng = makeRng(`${productName}|${category}|tags`);
  const base = toHashtagSlug(category);
  const productTag = toHashtagSlug(productName);
  const pool = [...HASHTAG_POOL, base, productTag].filter(Boolean);
  const chosen = new Set<string>();
  while (chosen.size < 6 && chosen.size < pool.length) {
    chosen.add(pick(rng, pool));
  }
  return Array.from(chosen).map((t) => `#${t}`);
}
