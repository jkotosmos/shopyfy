// Illustrative "ad library"-style examples (advertiser, primary text,
// headline, CTA, platforms, active-since, library ID) shaped like what
// browsing Meta Ad Library actually shows — generated the same
// deterministic, clearly-illustrative way as the rest of the app's
// content. Not real ads. buildResearchLinks() (trends.ts) already links
// out to the real Meta Ad Library filtered by the same keyword so any of
// this can be checked against what's actually running.

import { makeRng, pick, pickMany, randInt } from "./seed";
import type { Lang } from "./i18n";

export interface AdLibraryEntry {
  libraryId: string;
  advertiserName: string;
  headline: string;
  primaryText: string;
  cta: string;
  platforms: string[];
  format: string;
  activeDays: number;
}

const BRAND_TEMPLATES = [
  (w: string) => `${w}ify`,
  (w: string) => `Get${w}`,
  (w: string) => `${w} Co.`,
  (w: string) => `The ${w} Edit`,
  (w: string) => `Daily ${w}`,
  (w: string) => `${w} Hub`,
  (w: string) => `My${w}`,
  (w: string) => `${w} Studio`,
];

const PLATFORM_POOL = ["Facebook", "Instagram", "Messenger", "Audience Network"];
const FORMATS: Record<Lang, string[]> = {
  ru: ["Видео", "Изображение", "Карусель"],
  en: ["Video", "Image", "Carousel"],
};

const CTA_POOL: Record<Lang, string[]> = {
  ru: ["Купить", "Подробнее", "Получить предложение", "Заказать", "В магазин"],
  en: ["Shop Now", "Learn More", "Get Offer", "Order Now", "Shop Deal"],
};

const HEADLINE_TEMPLATES: Record<Lang, ((p: string) => string)[]> = {
  ru: [
    (p) => `${p} — хит продаж этого месяца`,
    (p) => `Скидка 40% на ${p} — сегодня`,
    (p) => `${p}, о котором все говорят`,
    (p) => `Бесплатная доставка: ${p}`,
  ],
  en: [
    (p) => `${p} — this month's best seller`,
    (p) => `40% off ${p} — today only`,
    (p) => `The ${p} everyone's talking about`,
    (p) => `Free shipping on ${p}`,
  ],
};

const PRIMARY_TEXT_TEMPLATES: Record<Lang, ((p: string) => string)[]> = {
  ru: [
    (p) => `Больше 10 000 довольных покупателей уже оценили ${p}. Ограниченная партия — заказывайте, пока в наличии. 🚚 Бесплатная доставка.`,
    (p) => `Устали от обычных решений? ${p} меняет всё за секунды. Гарантия возврата 30 дней.`,
    (p) => `🔥 Распродажа заканчивается скоро! ${p} — именно то, что вы искали. Успейте забрать свой со скидкой.`,
    (p) => `Реальные отзывы, реальный результат. Вот почему покупатели выбирают ${p} снова и снова.`,
  ],
  en: [
    (p) => `10,000+ happy customers already love the ${p}. Limited batch — order while it's in stock. 🚚 Free shipping.`,
    (p) => `Tired of the usual solutions? The ${p} changes everything in seconds. 30-day money-back guarantee.`,
    (p) => `🔥 Sale ends soon! The ${p} is exactly what you've been looking for. Grab yours at a discount.`,
    (p) => `Real reviews, real results. Here's why customers keep coming back to the ${p}.`,
  ],
};

function titleCaseWord(w: string): string {
  return w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase();
}

export function generateAdLibraryEntries(keyword: string, lang: Lang, count = 3): AdLibraryEntry[] {
  const rng = makeRng(`${keyword}|adlib|${lang}`);
  const words = keyword.trim().split(/\s+/).filter(Boolean);
  const brandWord = titleCaseWord(words.find((w) => w.length > 3) ?? words[0] ?? "Store");
  const productPhrase = keyword.trim() || (lang === "en" ? "this product" : "этот товар");

  const usedBrands = new Set<string>();
  const entries: AdLibraryEntry[] = [];
  for (let i = 0; i < count; i++) {
    let brand = pick(rng, BRAND_TEMPLATES)(brandWord);
    let guard = 0;
    while (usedBrands.has(brand) && guard < 10) {
      brand = pick(rng, BRAND_TEMPLATES)(brandWord);
      guard++;
    }
    usedBrands.add(brand);

    entries.push({
      libraryId: String(randInt(rng, 1_000_000_000, 9_999_999_999)),
      advertiserName: brand,
      headline: pick(rng, HEADLINE_TEMPLATES[lang])(productPhrase),
      primaryText: pick(rng, PRIMARY_TEXT_TEMPLATES[lang])(productPhrase),
      cta: pick(rng, CTA_POOL[lang]),
      platforms: pickMany(rng, PLATFORM_POOL, randInt(rng, 2, 4)),
      format: pick(rng, FORMATS[lang]),
      activeDays: randInt(rng, 3, 120),
    });
  }
  return entries;
}
