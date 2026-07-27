import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ArrowRight, Check, Loader2, Globe, Tag, TrendingUp, Bookmark, ExternalLink,
  ShoppingBag, PackagePlus,
} from "lucide-react";
import { Badge, Button, Card, Container, Eyebrow, Modal, SectionTitle } from "../components/ui";
import { generateStore, type GeneratedStore } from "../lib/generator";
import { addSaved } from "../lib/storage";

const EXAMPLES = [
  "https://www.aliexpress.com/item/1005006123456-portable-neck-fan-mini.html",
  "https://www.amazon.com/dp/B0POSTURE22-posture-corrector-brace",
  "https://www.alibaba.com/product-detail/mini-facial-massager-beauty-tool.html",
];

export function StoreBuilder() {
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get("url") ?? "");
  const [building, setBuilding] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<GeneratedStore | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoRan = useRef(false);

  function runGeneration(value: string) {
    if (!value.trim()) return;
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setSaved(false);
    setResult(null);
    setBuilding(true);
    setStepIndex(0);

    const store = generateStore(value);
    store.buildSteps.forEach((_, i) => {
      const t = setTimeout(() => setStepIndex(i), i * 420);
      timeouts.current.push(t);
    });
    const finalT = setTimeout(() => {
      setResult(store);
      setBuilding(false);
    }, store.buildSteps.length * 420 + 200);
    timeouts.current.push(finalT);
  }

  useEffect(() => {
    if (params.get("url") && !autoRan.current) {
      autoRan.current = true;
      runGeneration(params.get("url")!);
    }
    return () => timeouts.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runGeneration(input);
  }

  function handleSave() {
    if (!result) return;
    addSaved({ name: result.productName, category: result.niche.label, note: `Generated store: ${result.storeName} · suggested price $${result.price.toFixed(2)}` });
    setSaved(true);
  }

  return (
    <div className="py-14">
      <Container className="max-w-3xl text-center">
        <Eyebrow>AI Store Builder</Eyebrow>
        <SectionTitle>Paste a product link, get a full store</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">
          This demo runs entirely in your browser — it parses the link, detects a niche, and drafts a complete store
          structure with copy, upsells, and pricing. Nothing is sent to a server.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a product link or type a product name…"
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
          <Button type="submit" disabled={building} className="whitespace-nowrap">
            {building ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {building ? "Building…" : "Generate store"}
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-ink-400">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setInput(ex); runGeneration(ex); }}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-ink-500 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400"
            >
              {ex.includes("aliexpress") ? "AliExpress example" : ex.includes("amazon") ? "Amazon example" : "Alibaba example"}
            </button>
          ))}
        </div>
      </Container>

      {building && (
        <Container className="mt-14 max-w-xl">
          <Card>
            <ul className="space-y-3">
              {generateStore(input || "loading").buildSteps.map((step, i) => (
                <li key={step} className={`flex items-center gap-3 text-sm transition-opacity ${i <= stepIndex ? "opacity-100" : "opacity-30"}`}>
                  {i < stepIndex ? (
                    <Check size={16} className="text-brand-500 shrink-0" />
                  ) : i === stepIndex ? (
                    <Loader2 size={16} className="animate-spin text-brand-500 shrink-0" />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border border-ink-300 dark:border-ink-700" />
                  )}
                  <span className={i === stepIndex ? "font-medium text-ink-900 dark:text-white" : "text-ink-500 dark:text-ink-400"}>{step}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Container>
      )}

      {result && !building && (
        <Container className="mt-14 max-w-4xl animate-fade-up">
          {/* Store header */}
          <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{result.niche.emoji} {result.niche.label}</Badge>
                <span className="text-xs font-medium text-ink-400">from {result.source}</span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-ink-950 dark:text-white">{result.storeName}</h3>
              <p className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400"><Globe size={14} /> {result.domainSuggestion}</p>
            </div>
            <div className="flex gap-2">
              <Button variant={saved ? "secondary" : "outline"} onClick={handleSave}>
                <Bookmark size={15} /> {saved ? "Saved ✓" : "Save to watchlist"}
              </Button>
              <Button onClick={() => setImportOpen(true)}>Import to Shopify</Button>
            </div>
          </Card>

          {/* Hero preview mockup */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-200 shadow-sm dark:border-ink-800">
            <div className="flex items-center gap-1.5 border-b border-ink-200 bg-ink-100 px-4 py-2.5 dark:border-ink-800 dark:bg-ink-800">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 truncate text-xs text-ink-400">{result.domainSuggestion}</span>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-white px-6 py-12 text-center dark:from-ink-900 dark:to-ink-950">
              <h2 className="mx-auto max-w-lg text-2xl font-bold text-ink-950 dark:text-white sm:text-3xl">{result.heroHeadline}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-ink-500 dark:text-ink-400">{result.heroSub}</p>
              <span className="mt-6 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">Shop now — ${result.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h4 className="font-semibold text-ink-950 dark:text-white">Product page copy</h4>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{result.description}</p>
              <ul className="mt-4 space-y-2.5">
                {result.usps.map((u) => (
                  <li key={u} className="flex gap-2.5 text-sm text-ink-600 dark:text-ink-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {u}
                  </li>
                ))}
              </ul>

              <h4 className="mt-6 font-semibold text-ink-950 dark:text-white">Generated page sections</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.pageSections.map((s) => (
                  <span key={s} className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs text-ink-600 dark:border-ink-700 dark:text-ink-300">{s}</span>
                ))}
              </div>

              <h4 className="mt-6 font-semibold text-ink-950 dark:text-white">Collections</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.collections.map((c) => (
                  <span key={c} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">{c}</span>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Tag size={16} /> Pricing</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <Row label="Est. supplier cost" value={`$${result.cost.toFixed(2)}`} />
                  <Row label="Suggested retail price" value={`$${result.price.toFixed(2)}`} bold />
                  <Row label="Margin" value={`${result.marginPct}%`} />
                </div>
                <Link to={`/tools/profit-calculator?cost=${result.cost}&price=${result.price}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Fine-tune the math <ArrowRight size={14} />
                </Link>
              </Card>

              <Card>
                <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><TrendingUp size={16} /> Market signal</h4>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-ink-950 dark:text-white">{result.marketScore}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">/100 demand score</div>
                </div>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{result.competitionLabel}</p>
                <Link to={`/trends?q=${encodeURIComponent(result.productName)}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Verify this trend <ExternalLink size={13} />
                </Link>
              </Card>
            </div>
          </div>

          {/* Upsells */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><PackagePlus size={16} /> Bundle upsell</h4>
              <div className="mt-3 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/30">
                <p className="font-semibold text-brand-700 dark:text-brand-300">{result.bundleUpsell.title}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{result.bundleUpsell.discount}</p>
              </div>
            </Card>
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><ShoppingBag size={16} /> Cart upsell</h4>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                <div>
                  <p className="font-medium text-ink-900 dark:text-white">{result.cartUpsell.title}</p>
                  <p className="text-sm text-ink-500 dark:text-ink-400">{result.cartUpsell.addOn}</p>
                </div>
                <span className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-ink-950">{result.cartUpsell.price}</span>
              </div>
            </Card>
          </div>
        </Container>
      )}

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import to Shopify">
        <p>
          In the full product, this connects to your Shopify store via OAuth and pushes the generated theme, pages,
          and upsell blocks directly into your admin.
        </p>
        <p className="mt-2">This prototype runs without a backend, so the import step is shown here for demo purposes only.</p>
        <Button className="mt-4 w-full" onClick={() => setImportOpen(false)}>Got it</Button>
      </Modal>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500 dark:text-ink-400">{label}</span>
      <span className={bold ? "font-semibold text-ink-950 dark:text-white" : "text-ink-700 dark:text-ink-300"}>{value}</span>
    </div>
  );
}
