export interface Niche {
  id: string;
  label: string;
  emoji: string;
  keywords: string[];
  costRange: [number, number];
  benefit: string;
}

export const NICHES: Niche[] = [
  {
    id: "electronics",
    label: "Электроника и гаджеты",
    emoji: "🔌",
    keywords: ["earbud", "headphone", "charger", "cable", "led", "light", "projector", "camera", "speaker", "watch", "gadget", "phone", "electronic", "bluetooth", "wireless", "usb", "gaming", "console", "drone", "mic", "microphone"],
    costRange: [4, 22],
    benefit: "удобство без проводов и апгрейд повседневных гаджетов",
  },
  {
    id: "beauty",
    label: "Красота и уход",
    emoji: "💄",
    keywords: ["skincare", "serum", "makeup", "lash", "lip", "hair", "beauty", "facial", "brush", "nail", "cosmetic", "cream", "mask", "derma", "curler", "straightener"],
    costRange: [3, 16],
    benefit: "салонный результат дома",
  },
  {
    id: "home",
    label: "Дом и кухня",
    emoji: "🏠",
    keywords: ["kitchen", "organizer", "storage", "mug", "cutting", "gadget", "home", "decor", "lamp", "shelf", "rack", "cleaning", "vacuum", "mop", "blanket", "pillow", "cookware"],
    costRange: [5, 20],
    benefit: "более организованный и уютный дом",
  },
  {
    id: "fitness",
    label: "Фитнес и здоровье",
    emoji: "🏋️",
    keywords: ["fitness", "yoga", "resistance", "band", "gym", "workout", "massage", "posture", "wellness", "sleep", "recovery", "muscle", "grip"],
    costRange: [4, 18],
    benefit: "более быстрый прогресс в тренировках",
  },
  {
    id: "pet",
    label: "Товары для животных",
    emoji: "🐾",
    keywords: ["pet", "dog", "cat", "leash", "collar", "toy", "grooming", "bowl", "cage", "aquarium"],
    costRange: [3, 15],
    benefit: "более счастливых и здоровых питомцев",
  },
  {
    id: "kids",
    label: "Детские товары",
    emoji: "🧸",
    keywords: ["baby", "kids", "toddler", "nursery", "toy", "stroller", "feeding", "kids'"],
    costRange: [4, 19],
    benefit: "более безопасное и простое родительство",
  },
  {
    id: "outdoors",
    label: "Активный отдых и путешествия",
    emoji: "🏕️",
    keywords: ["camping", "travel", "hiking", "outdoor", "backpack", "tent", "bottle", "portable", "flashlight"],
    costRange: [5, 21],
    benefit: "готовность к любым приключениям",
  },
  {
    id: "fashion",
    label: "Мода и аксессуары",
    emoji: "👜",
    keywords: ["jewelry", "necklace", "ring", "bag", "wallet", "sunglasses", "bracelet", "earring", "scarf", "belt", "fashion"],
    costRange: [3, 17],
    benefit: "простой апгрейд стиля без усилий",
  },
  {
    id: "auto",
    label: "Автоаксессуары",
    emoji: "🚗",
    keywords: ["car", "auto", "vehicle", "dash", "seat", "steering", "tire"],
    costRange: [5, 24],
    benefit: "более чистую и функциональную машину",
  },
  {
    id: "general",
    label: "Общий магазин",
    emoji: "🛍️",
    keywords: [],
    costRange: [4, 20],
    benefit: "решение повседневной проблемы",
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
