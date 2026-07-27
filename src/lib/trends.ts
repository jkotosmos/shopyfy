// Trending-product research: a curated starter list of niches plus a
// universal keyword -> research-link builder. The links are real, generic
// deep-links into public trend/discovery tools (Google Trends, TikTok, Meta
// Ad Library, Pinterest, YouTube, Reddit, AliExpress, Amazon) so every claim
// about "what's popular" can be traced back to its actual source instead of
// being taken on faith.

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
      hint: "Search interest over time & by region",
    },
    {
      label: "TikTok search",
      platform: "TikTok",
      url: `https://www.tiktok.com/search?q=${enc}`,
      hint: "Videos & hashtag momentum",
    },
    {
      label: "Meta Ad Library",
      platform: "Facebook/Instagram Ads",
      url: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${enc}&search_type=keyword_unordered`,
      hint: "Who is actively running ads for this right now",
    },
    {
      label: "Pinterest search",
      platform: "Pinterest",
      url: `https://www.pinterest.com/search/pins/?q=${enc}`,
      hint: "Visual demand & seasonal boards",
    },
    {
      label: "YouTube search",
      platform: "YouTube",
      url: `https://www.youtube.com/results?search_query=${enc}+review`,
      hint: "Reviews & unboxings — social proof signal",
    },
    {
      label: "Reddit search",
      platform: "Reddit",
      url: `https://www.reddit.com/search/?q=${enc}`,
      hint: "Unfiltered opinions & complaints (great for USPs)",
    },
    {
      label: "AliExpress listings",
      platform: "AliExpress",
      url: `https://www.aliexpress.com/wholesale?SearchText=${enc}`,
      hint: "Supplier price range & order volume",
    },
    {
      label: "Amazon listings",
      platform: "Amazon",
      url: `https://www.amazon.com/s?k=${enc}`,
      hint: "Retail price ceiling & review count",
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

// Illustrative starter list to seed research — treat scores/growth as
// directional, not live data. Click through to the source links per item
// (or search your own keyword above) to verify current numbers yourself.
export const TRENDING_NICHES: TrendingNiche[] = [
  { id: "neck-fan", name: "Portable Neck Fan", keyword: "portable neck fan", category: "Electronics", emoji: "🌀", score: 91, growth: "+164% search interest (90d)", signal: "Viral TikTok #tiktokmademebuyit sound trend", platforms: ["TikTok", "Google Trends"], blurb: "Recurring summer breakout item; look for bladeless variants to reduce return rate." },
  { id: "led-projector", name: "Galaxy LED Projector", keyword: "galaxy led projector", category: "Home Decor", emoji: "🌌", score: 87, growth: "+92% search interest (90d)", signal: "Recurring 'room aesthetic' trend on TikTok/Pinterest", platforms: ["Pinterest", "TikTok"], blurb: "Strong repeat seasonality around back-to-school and winter room-makeover trends." },
  { id: "posture-corrector", name: "Posture Corrector Brace", keyword: "posture corrector brace", category: "Wellness", emoji: "🧍", score: 78, growth: "+41% search interest (90d)", signal: "Steady demand, high AOV upsell potential (bundle with heat pads)", platforms: ["Google Trends", "Amazon"], blurb: "Evergreen problem-aware niche — good for Meta ads using before/after angle." },
  { id: "mini-massager", name: "Mini Facial Massager", keyword: "mini facial massager", category: "Beauty", emoji: "💆", score: 84, growth: "+118% search interest (90d)", signal: "Skincare-tool wave riding on 'get ready with me' content", platforms: ["TikTok", "Pinterest"], blurb: "Pairs well with a skincare routine bundle upsell." },
  { id: "cable-organizer", name: "Magnetic Cable Organizer", keyword: "magnetic cable organizer", category: "Electronics", emoji: "🧲", score: 69, growth: "+22% search interest (90d)", signal: "Low competition, consistent desk-setup content demand", platforms: ["YouTube", "Reddit"], blurb: "Great low-cost, high-margin add-on/cart-upsell item rather than hero product." },
  { id: "pet-grooming-glove", name: "Pet Grooming Glove", keyword: "pet grooming glove", category: "Pet", emoji: "🐶", score: 74, growth: "+37% search interest (90d)", signal: "Steady pet-content demand across TikTok & Instagram Reels", platforms: ["TikTok", "Instagram"], blurb: "Great for UGC ads — pet reactions perform well organically." },
  { id: "resistance-bands", name: "Resistance Band Set", keyword: "resistance band set", category: "Fitness", emoji: "🏋️", score: 72, growth: "+18% search interest (90d)", signal: "Evergreen home-workout category, January & September spikes", platforms: ["Google Trends", "YouTube"], blurb: "Highly seasonal — plan ad spend around New Year and back-to-school windows." },
  { id: "sunshade", name: "Car Windshield Sunshade", keyword: "car windshield sunshade", category: "Auto", emoji: "☀️", score: 65, growth: "+29% search interest (90d, seasonal)", signal: "Strong summer seasonality, regional demand spikes", platforms: ["Google Trends", "Amazon"], blurb: "Time launch 6-8 weeks before summer in target region." },
  { id: "sleep-mask", name: "Smart Sleep Mask", keyword: "smart sleep mask", category: "Wellness", emoji: "😴", score: 80, growth: "+55% search interest (90d)", signal: "Growing 'sleep hygiene' content wave on TikTok/YouTube", platforms: ["TikTok", "YouTube"], blurb: "Bundle with blue-light glasses for a strong cart upsell." },
  { id: "phone-stand", name: "Foldable Phone Stand", keyword: "foldable phone stand", category: "Electronics", emoji: "📱", score: 60, growth: "+11% search interest (90d)", signal: "Steady, low-hype utility demand", platforms: ["Amazon", "Reddit"], blurb: "Low margin alone — best as a free-plus-shipping lead magnet." },
  { id: "kitchen-gadget", name: "Silicone Kitchen Gadget Set", keyword: "silicone kitchen gadget set", category: "Kitchen", emoji: "🍳", score: 76, growth: "+34% search interest (90d)", signal: "Recurring 'kitchen hacks' short-form video demand", platforms: ["TikTok", "Pinterest"], blurb: "Pairs naturally with a Bundle Upsell (set of 3-5 tools)." },
  { id: "water-bottle", name: "Collapsible Water Bottle", keyword: "collapsible water bottle", category: "Outdoors", emoji: "💧", score: 63, growth: "+9% search interest (90d)", signal: "Stable travel/outdoors demand, low volatility", platforms: ["Google Trends", "Amazon"], blurb: "Good evergreen filler product for an outdoors-niche store." },
];
