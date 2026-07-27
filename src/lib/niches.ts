import type { Lang } from "./i18n";

export interface Niche {
  id: string;
  label: string;
  labelEn: string;
  emoji: string;
  keywords: string[];
  costRange: [number, number];
  benefit: string;
  benefitEn: string;
}

export const NICHES: Niche[] = [
  {
    id: "electronics",
    label: "Электроника и гаджеты",
    labelEn: "Electronics & Gadgets",
    emoji: "🔌",
    keywords: ["earbud", "headphone", "charger", "cable", "led", "light", "projector", "camera", "speaker", "watch", "gadget", "phone", "electronic", "bluetooth", "wireless", "usb", "gaming", "console", "drone", "mic", "microphone"],
    costRange: [4, 22],
    benefit: "удобство без проводов и апгрейд повседневных гаджетов",
    benefitEn: "cord-free convenience and an upgrade to everyday gadgets",
  },
  {
    id: "beauty",
    label: "Красота и уход",
    labelEn: "Beauty & Skincare",
    emoji: "💄",
    keywords: ["skincare", "serum", "makeup", "lash", "lip", "hair", "beauty", "facial", "brush", "nail", "cosmetic", "cream", "mask", "derma", "curler", "straightener"],
    costRange: [3, 16],
    benefit: "салонный результат дома",
    benefitEn: "salon-quality results at home",
  },
  {
    id: "home",
    label: "Дом и кухня",
    labelEn: "Home & Kitchen",
    emoji: "🏠",
    keywords: ["kitchen", "organizer", "storage", "mug", "cutting", "gadget", "home", "decor", "lamp", "shelf", "rack", "cleaning", "vacuum", "mop", "blanket", "pillow", "cookware"],
    costRange: [5, 20],
    benefit: "более организованный и уютный дом",
    benefitEn: "a more organized, cozier home",
  },
  {
    id: "fitness",
    label: "Фитнес и здоровье",
    labelEn: "Fitness & Health",
    emoji: "🏋️",
    keywords: ["fitness", "yoga", "resistance", "band", "gym", "workout", "massage", "posture", "wellness", "sleep", "recovery", "muscle", "grip", "bodybuild"],
    costRange: [4, 18],
    benefit: "более быстрый прогресс в тренировках",
    benefitEn: "faster progress in your workouts",
  },
  {
    id: "pet",
    label: "Товары для животных",
    labelEn: "Pet Supplies",
    emoji: "🐾",
    keywords: ["pet", "dog", "cat", "leash", "collar", "toy", "grooming", "bowl", "cage", "aquarium"],
    costRange: [3, 15],
    benefit: "более счастливых и здоровых питомцев",
    benefitEn: "happier, healthier pets",
  },
  {
    id: "kids",
    label: "Детские товары",
    labelEn: "Kids & Baby",
    emoji: "🧸",
    keywords: ["baby", "kids", "toddler", "nursery", "toy", "stroller", "feeding", "kids'"],
    costRange: [4, 19],
    benefit: "более безопасное и простое родительство",
    benefitEn: "safer, easier parenting",
  },
  {
    id: "outdoors",
    label: "Активный отдых и путешествия",
    labelEn: "Outdoors & Travel",
    emoji: "🏕️",
    keywords: ["camping", "travel", "hiking", "outdoor", "backpack", "tent", "bottle", "portable", "flashlight"],
    costRange: [5, 21],
    benefit: "готовность к любым приключениям",
    benefitEn: "being ready for any adventure",
  },
  {
    id: "fashion",
    label: "Мода и аксессуары",
    labelEn: "Fashion & Accessories",
    emoji: "👜",
    keywords: ["jewelry", "necklace", "ring", "bag", "wallet", "sunglasses", "bracelet", "earring", "scarf", "belt", "fashion"],
    costRange: [3, 17],
    benefit: "простой апгрейд стиля без усилий",
    benefitEn: "an easy, effortless style upgrade",
  },
  {
    id: "auto",
    label: "Автоаксессуары",
    labelEn: "Auto Accessories",
    emoji: "🚗",
    keywords: ["car", "auto", "vehicle", "dash", "seat", "steering", "tire"],
    costRange: [5, 24],
    benefit: "более чистую и функциональную машину",
    benefitEn: "a cleaner, more functional car",
  },
  {
    id: "general",
    label: "Общий магазин",
    labelEn: "General Store",
    emoji: "🛍️",
    keywords: [],
    costRange: [4, 20],
    benefit: "решение повседневной проблемы",
    benefitEn: "solving an everyday problem",
  },
];

export function detectNiche(text: string): Niche {
  const lower = text.toLowerCase();
  let best: Niche = NICHES[NICHES.length - 1];
  let bestHits = 0;
  for (const n of NICHES) {
    const hits = n.keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
    if (hits > bestHits) {
      bestHits = hits;
      best = n;
    }
  }
  return best;
}

export function nicheLabel(n: Niche, lang: Lang): string {
  return lang === "en" ? n.labelEn : n.label;
}

export function nicheBenefit(n: Niche, lang: Lang): string {
  return lang === "en" ? n.benefitEn : n.benefit;
}
