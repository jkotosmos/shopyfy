import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Wand2, LayoutTemplate, FileText, PackagePlus, ShoppingCart, UploadCloud,
  Clock, DollarSign, TrendingUp, Calculator, MessageSquareText, Bookmark,
  ChevronDown, Check, Link2, BrainCircuit, Sparkles,
} from "lucide-react";
import { Badge, Button, Card, Container, Eyebrow, LinkButton, SectionTitle, Stat } from "../components/ui";

const STEPS = [
  { icon: Link2, title: "Paste a product link", body: "Drop in an AliExpress, Amazon, Alibaba, or Shopify product URL — or just type a product name." },
  { icon: BrainCircuit, title: "AI analyzes product & market", body: "We parse the listing, detect the niche, estimate cost/margin, and gauge demand and competition." },
  { icon: Wand2, title: "Store is generated automatically", body: "Homepage, product pages, collections, custom sections, copy, and upsell offers — built from scratch for that product." },
  { icon: UploadCloud, title: "Import & customize", body: "Bring it into Shopify and tweak anything — text, images, colors, structure — no code required." },
];

const CORE_FEATURES = [
  { icon: Wand2, title: "AI Store Builder", body: "Generates a complete store — not a generic template — built around the specific product you gave it." },
  { icon: LayoutTemplate, title: "AI Page Builder", body: "Drag-and-drop sections with AI-written copy, rearranged instantly without touching code." },
  { icon: FileText, title: "Product Page Generator", body: "High-converting product pages with benefit-led copy, comparison tables, and FAQ blocks." },
  { icon: PackagePlus, title: "Bundle Upsells", body: "Auto-suggested 'buy more, save more' bundles sized to the product's price point." },
  { icon: ShoppingCart, title: "Cart Upsells", body: "Complementary add-ons surfaced at checkout to lift average order value." },
  { icon: UploadCloud, title: "One-Click Shopify Import", body: "Push the generated store straight into your Shopify admin, fully editable from there." },
];

const EXTRA_TOOLS = [
  { icon: TrendingUp, title: "Trending Product Research", body: "Curated trending niches plus a universal keyword search — every claim links out to Google Trends, TikTok, Meta Ad Library, Pinterest, and more, so you can verify it yourself.", to: "/trends", cta: "Explore trends" },
  { icon: Calculator, title: "Profit Margin Calculator", body: "Factor in supplier cost, shipping, payment fees, and ad spend to find your real margin — or the price you need to hit a target margin.", to: "/tools/profit-calculator", cta: "Run the numbers" },
  { icon: MessageSquareText, title: "Social Ad Copy Generator", body: "Five ad angles (curiosity, urgency, social proof, before/after…) plus ready-to-use hashtags for TikTok and Instagram.", to: "/tools/ad-copy", cta: "Generate ad copy" },
  { icon: Bookmark, title: "Saved Products Watchlist", body: "Bookmark products you're researching with notes, stored locally in your browser — no account needed.", to: "/saved", cta: "View watchlist" },
];

const DIFFERENTIATORS = [
  "Every store is generated from the specific product you provide — not a recycled template reused across users.",
  "The AI does lightweight market research (niche, demand signal, competition) before writing a single word of copy.",
  "Everything generated stays fully editable afterward: text, images, colors, structure, and sections.",
  "Trend claims link straight to their source (Google Trends, TikTok, Meta Ads Library…) instead of asking you to trust a black box.",
];

const FAQS = [
  { q: "Do I need to know how to code?", a: "No. The store, product pages, and every tool on Shopyfy are built with a visual, no-code editor." },
  { q: "Which product links can I paste?", a: "AliExpress, Amazon, and Alibaba product pages, plus existing Shopify product URLs. You can also just type a product name if you don't have a link yet." },
  { q: "Is the trend data live?", a: "The curated trending list is an illustrative starting point, clearly marked as directional. Every item — and any keyword you search — links out to the real source (Google Trends, TikTok, Meta Ad Library, etc.) so you can verify current numbers yourself before spending on ads." },
  { q: "Can I customize the generated store?", a: "Yes — nothing is locked. Rewrite copy, swap images, change colors and layout, add or remove sections, all after generation." },
  { q: "Does this replace hiring a designer or developer?", a: "For most starter stores, yes — the AI store/page builder, upsell blocks, and copy generation cover what a small team would otherwise be hired to do." },
];

export function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/store-builder${url.trim() ? `?url=${encodeURIComponent(url.trim())}` : ""}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-500/10" />
        <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="flex justify-center animate-fade-up">
            <Badge>
              <Sparkles size={13} /> AI store builder, built for dropshippers
            </Badge>
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white sm:text-6xl animate-fade-up" style={{ animationDelay: "80ms" }}>
            Turn any product link into a store that <span className="text-brand-600 dark:text-brand-400">sells</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-600 dark:text-ink-300 animate-fade-up" style={{ animationDelay: "160ms" }}>
            Paste an AliExpress, Amazon, Alibaba, or Shopify link. Shopyfy's AI builds the homepage, product pages, upsells, and copy — then you import it straight to Shopify.
          </p>

          <form onSubmit={handleGenerate} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row animate-fade-up" style={{ animationDelay: "240ms" }}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a product link (AliExpress, Amazon, Alibaba, Shopify)…"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
            <Button type="submit" className="whitespace-nowrap">
              Generate my store <ArrowRight size={16} />
            </Button>
          </form>
          <p className="mt-3 text-xs text-ink-400">No signup required for the demo. Takes about 10 seconds.</p>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat value="10,000+" label="stores built" />
            <Stat value="15×" label="faster page creation" />
            <Stat value="40+ hrs" label="saved per store" />
            <Stat value="$1,000+" label="saved vs. hiring out" />
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>How it works</Eyebrow>
            <SectionTitle>From link to live store in four steps</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <s.icon size={20} />
                </div>
                <div className="mt-4 text-xs font-bold text-brand-600 dark:text-brand-400">STEP {i + 1}</div>
                <h3 className="mt-1 font-semibold text-ink-950 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Core features */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Core features</Eyebrow>
            <SectionTitle>Everything in one app, instead of five</SectionTitle>
            <p className="mt-3 text-ink-500 dark:text-ink-400">Theme, page builder, and upsell apps — replaced by a single AI workflow.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((f) => (
              <Card key={f.title} className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <f.icon size={19} />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Extra tools for dropshippers */}
      <section className="border-y border-ink-200 bg-gradient-to-b from-ink-50 to-white py-20 dark:border-ink-800 dark:from-ink-900/40 dark:to-ink-950">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Beyond store building</Eyebrow>
            <SectionTitle>Built-in research, made for dropshippers</SectionTitle>
            <p className="mt-3 text-ink-500 dark:text-ink-400">Find what's trending, price it properly, and write the ad — all before you spend a dollar.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {EXTRA_TOOLS.map((t) => (
              <Card key={t.title} className="flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <t.icon size={19} />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{t.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-ink-500 dark:text-ink-400">{t.body}</p>
                <LinkButton href={t.to} variant="outline" className="mt-5 self-start">
                  {t.cta} <ArrowRight size={14} />
                </LinkButton>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits / ROI */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Why it's worth it</Eyebrow>
            <SectionTitle>Time, money, and conversion — all at once</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <BenefitCard icon={Clock} title="Save time" body="Build product pages up to 15× faster and save 40+ hours versus building a store manually." />
            <BenefitCard icon={TrendingUp} title="Lift conversion" body="Sections and copy patterns modeled on what's worked for successful e-commerce brands." />
            <BenefitCard icon={DollarSign} title="Cut costs" body="One app replaces several Shopify apps plus developer, designer, and copywriter fees — often $100+/month and $1,000+ in hiring." />
          </div>
        </Container>
      </section>

      {/* Differentiators */}
      <section className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>Not another template generator</Eyebrow>
              <SectionTitle>Built around your product, not a recycled layout</SectionTitle>
              <p className="mt-4 text-ink-500 dark:text-ink-400">
                Generic AI site builders reuse the same handful of templates for everyone. Shopyfy analyzes the specific
                product and does lightweight market research first, so the structure, copy, and offers actually fit what
                you're selling.
              </p>
            </div>
            <ul className="space-y-4">
              {DIFFERENTIATORS.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400">
                    <Check size={14} />
                  </span>
                  <span className="text-sm text-ink-600 dark:text-ink-300">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Pricing</Eyebrow>
            <SectionTitle>Start free, upgrade when you're selling</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <PricingCard
              name="Starter"
              price="$0"
              period="/mo"
              body="Try the AI store builder and every research tool."
              features={["1 generated store", "Trend research tool", "Profit calculator", "Ad copy generator"]}
            />
            <PricingCard
              name="Growth"
              price="$39"
              period="/mo"
              highlighted
              body="For dropshippers actively launching stores."
              features={["Unlimited generated stores", "One-click Shopify import", "Bundle & cart upsell builder", "Saved products watchlist", "Priority support"]}
            />
            <PricingCard
              name="Pro"
              price="$99"
              period="/mo"
              body="For teams running multiple stores."
              features={["Everything in Growth", "Multiple team seats", "Bulk product page generation", "Custom section library"]}
            />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container className="max-w-3xl">
          <div className="text-center">
            <Eyebrow>FAQ</Eyebrow>
            <SectionTitle>Questions, answered</SectionTitle>
          </div>
          <div className="mt-10 divide-y divide-ink-200 dark:divide-ink-800">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <Container>
          <div className="rounded-3xl bg-ink-950 px-8 py-14 text-center dark:bg-ink-900">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Paste a link. See your store in seconds.</h2>
            <p className="mx-auto mt-3 max-w-md text-ink-300">No credit card, no signup — the demo runs entirely in your browser.</p>
            <LinkButton href="/store-builder" className="mt-7">
              Generate my store <ArrowRight size={16} />
            </LinkButton>
          </div>
        </Container>
      </section>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, body }: { icon: typeof Clock; title: string; body: string }) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{body}</p>
    </Card>
  );
}

function PricingCard({
  name, price, period, body, features, highlighted,
}: { name: string; price: string; period: string; body: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`relative rounded-2xl border p-7 ${highlighted ? "border-brand-400 bg-ink-950 text-white shadow-xl shadow-brand-500/20" : "border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/60"}`}>
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">Most popular</span>
      )}
      <h3 className={`font-semibold ${highlighted ? "text-white" : "text-ink-950 dark:text-white"}`}>{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`text-4xl font-extrabold ${highlighted ? "text-white" : "text-ink-950 dark:text-white"}`}>{price}</span>
        <span className={highlighted ? "text-ink-400" : "text-ink-400"}>{period}</span>
      </div>
      <p className={`mt-2 text-sm ${highlighted ? "text-ink-300" : "text-ink-500 dark:text-ink-400"}`}>{body}</p>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2 text-sm ${highlighted ? "text-ink-200" : "text-ink-600 dark:text-ink-300"}`}>
            <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {f}
          </li>
        ))}
      </ul>
      <LinkButton href="/store-builder" variant={highlighted ? "primary" : "outline"} className="mt-7 w-full">
        Get started
      </LinkButton>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="font-medium text-ink-900 dark:text-white">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{a}</p>}
    </div>
  );
}
