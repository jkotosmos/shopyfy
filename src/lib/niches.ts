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
    label: "Electronics & Gadgets",
    emoji: "🔌",
    keywords: ["earbud", "headphone", "charger", "cable", "led", "light", "projector", "camera", "speaker", "watch", "gadget", "phone", "electronic", "bluetooth", "wireless", "usb", "gaming", "console", "drone", "mic", "microphone"],
    costRange: [4, 22],
    benefit: "hands-free convenience and everyday tech upgrades",
  },
  {
    id: "beauty",
    label: "Beauty & Personal Care",
    emoji: "💄",
    keywords: ["skincare", "serum", "makeup", "lash", "lip", "hair", "beauty", "facial", "brush", "nail", "cosmetic", "cream", "mask", "derma", "curler", "straightener"],
    costRange: [3, 16],
    benefit: "salon-quality results at home",
  },
  {
    id: "home",
    label: "Home & Kitchen",
    emoji: "🏠",
    keywords: ["kitchen", "organizer", "storage", "mug", "cutting", "gadget", "home", "decor", "lamp", "shelf", "rack", "cleaning", "vacuum", "mop", "blanket", "pillow", "cookware"],
    costRange: [5, 20],
    benefit: "a more organized, comfortable home",
  },
  {
    id: "fitness",
    label: "Fitness & Wellness",
    emoji: "🏋️",
    keywords: ["fitness", "yoga", "resistance", "band", "gym", "workout", "massage", "posture", "wellness", "sleep", "recovery", "muscle", "grip"],
    costRange: [4, 18],
    benefit: "faster progress toward fitness goals",
  },
  {
    id: "pet",
    label: "Pet Supplies",
    emoji: "🐾",
    keywords: ["pet", "dog", "cat", "leash", "collar", "toy", "grooming", "bowl", "cage", "aquarium"],
    costRange: [3, 15],
    benefit: "happier, healthier pets",
  },
  {
    id: "kids",
    label: "Baby & Kids",
    emoji: "🧸",
    keywords: ["baby", "kids", "toddler", "nursery", "toy", "stroller", "feeding", "kids'"],
    costRange: [4, 19],
    benefit: "safer, easier day-to-day parenting",
  },
  {
    id: "outdoors",
    label: "Outdoors & Travel",
    emoji: "🏕️",
    keywords: ["camping", "travel", "hiking", "outdoor", "backpack", "tent", "bottle", "portable", "flashlight"],
    costRange: [5, 21],
    benefit: "being ready for any adventure",
  },
  {
    id: "fashion",
    label: "Fashion & Accessories",
    emoji: "👜",
    keywords: ["jewelry", "necklace", "ring", "bag", "wallet", "sunglasses", "bracelet", "earring", "scarf", "belt", "fashion"],
    costRange: [3, 17],
    benefit: "an effortless style upgrade",
  },
  {
    id: "auto",
    label: "Car Accessories",
    emoji: "🚗",
    keywords: ["car", "auto", "vehicle", "dash", "seat", "steering", "tire"],
    costRange: [5, 24],
    benefit: "a cleaner, more capable ride",
  },
  {
    id: "general",
    label: "General Store",
    emoji: "🛍️",
    keywords: [],
    costRange: [4, 20],
    benefit: "solving an everyday hassle",
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
