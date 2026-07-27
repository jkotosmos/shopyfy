import { makeRng, pick } from "./seed";

export interface AdAngle {
  angle: string;
  hook: string;
  body: string;
  cta: string;
}

const HOOKS: Record<string, ((p: string) => string)[]> = {
  "Problem → Solution": [
    (p) => `Tired of dealing with this every day? The ${p} fixes it in seconds.`,
    (p) => `Nobody tells you how annoying this is until you try the ${p}.`,
  ],
  Curiosity: [
    (p) => `This ${p} has 40k people confused about how it actually works.`,
    (p) => `Why is everyone suddenly buying a ${p}? Here's what we found.`,
  ],
  "Social Proof": [
    (p) => `Over 12,000 people switched to the ${p} this month. Here's why.`,
    (p) => `We didn't expect the ${p} to sell out in 48 hours. It did.`,
  ],
  "Urgency / Scarcity": [
    (p) => `The ${p} restock is almost gone — again.`,
    (p) => `Last batch of the ${p} for this price. Next drop costs more.`,
  ],
  "Before / After": [
    (p) => `Before the ${p}: frustrating. After: honestly kind of addictive.`,
    (p) => `POV: you finally tried the ${p} everyone was talking about.`,
  ],
};

const BODIES = [
  (p: string, benefit: string) => `The ${p} was built around one goal: ${benefit}. No learning curve, no gimmicks — just a small daily upgrade that's easy to justify at this price.`,
  (p: string, benefit: string) => `We tested a dozen versions before landing on this one. The ${p} is the only one that actually delivers ${benefit} without the usual trade-offs.`,
  (p: string, benefit: string) => `If you've been putting off ${benefit}, the ${p} removes the last excuse. Ships fast, backed by a 30-day guarantee.`,
];

const CTAS = [
  "Shop now while stock lasts →",
  "See why everyone's talking about it →",
  "Get yours before the next price increase →",
  "Try it risk-free for 30 days →",
];

const HASHTAG_POOL = [
  "TikTokMadeMeBuyIt", "AmazonFinds", "MustHave", "ViralProducts", "SmallBusiness",
  "OnlineShopping", "GadgetsOfTikTok", "TrendingNow", "DealOfTheDay", "ShopSmall",
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

export function generateHashtags(productName: string, category: string): string[] {
  const rng = makeRng(`${productName}|${category}|tags`);
  const base = category.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const productTag = productName.replace(/[^a-zA-Z0-9]+/g, "");
  const pool = [...HASHTAG_POOL, base, `${productTag}`];
  const chosen = new Set<string>();
  while (chosen.size < 6 && chosen.size < pool.length) {
    chosen.add(pick(rng, pool));
  }
  return Array.from(chosen).map((t) => `#${t}`);
}
