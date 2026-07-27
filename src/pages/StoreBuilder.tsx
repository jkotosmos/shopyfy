import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, Check, Loader2, Globe, Tag, TrendingUp, Bookmark, ExternalLink,
  ShoppingBag, PackagePlus, Store as StoreIcon,
} from "lucide-react";
import { Badge, Button, Card, Container, Eyebrow, Modal, SectionTitle } from "../components/ui";
import { generateStore, type GeneratedStore } from "../lib/generator";
import { addSaved } from "../lib/storage";
import { nicheLabel } from "../lib/niches";
import { useLanguage, type Lang } from "../lib/i18n";
import {
  getBackendUrl, getStoredSession, saveSession, isValidShopDomain, startConnect,
  publishStore as publishStoreToShopify, type ShopifySession, type PublishStoreResult,
} from "../lib/shopifyConnect";

const EXAMPLES = [
  "https://www.aliexpress.com/item/1005006123456-portable-neck-fan-mini.html",
  "https://www.amazon.com/dp/B0POSTURE22-posture-corrector-brace",
  "https://www.alibaba.com/product-detail/mini-facial-massager-beauty-tool.html",
];

const backendUrl = getBackendUrl();

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string; placeholder: string; building: string; submit: string;
  tryLabel: string; exAli: string; exAmazon: string; exAlibaba: string;
  source: string; saved: string; save: string; importBtn: string;
  buyNow: string; pageCopy: string; sections: string; collections: string;
  price: string; costLabel: string; retailLabel: string; marginLabel: string; refineCalc: string;
  marketSignal: string; demandPoints: string; checkTrend: string;
  bundleTitle: string; cartTitle: string;
  modalTitle: string; demoP1: string; demoP2: string; gotIt: string;
  connectTitle: string; connectBody: string; domainPlaceholder: string; connectBtn: string;
  connected: string; publishBody: string; publishing: string; publishBtn: string;
  doneTitle: string; openAdmin: string; discountCode: string; done: string;
}> = {
  ru: {
    eyebrow: "AI-конструктор магазина",
    title: "Вставьте ссылку на товар — получите готовый магазин",
    sub: "Это демо полностью работает в вашем браузере — оно разбирает ссылку, определяет нишу и собирает полную структуру магазина с текстами, допродажами и ценой. Ничего не отправляется на сервер.",
    placeholder: "Вставьте ссылку на товар или введите название…",
    building: "Собираем…", submit: "Собрать магазин",
    tryLabel: "Попробуйте:", exAli: "Пример с AliExpress", exAmazon: "Пример с Amazon", exAlibaba: "Пример с Alibaba",
    source: "источник", saved: "Сохранено ✓", save: "Сохранить в вотчлист", importBtn: "Импортировать в Shopify",
    buyNow: "Купить сейчас",
    pageCopy: "Текст страницы товара", sections: "Сгенерированные секции страницы", collections: "Коллекции",
    price: "Цена", costLabel: "Примерная себестоимость", retailLabel: "Рекомендованная розничная цена", marginLabel: "Маржа", refineCalc: "Уточнить расчёт",
    marketSignal: "Сигнал рынка", demandPoints: "/100 баллов спроса", checkTrend: "Проверить этот тренд",
    bundleTitle: "Bundle-допродажа", cartTitle: "Допродажа в корзине",
    modalTitle: "Импорт в Shopify",
    demoP1: "В полноценном продукте этот шаг подключается к вашему магазину Shopify через OAuth и переносит сгенерированную тему, страницы и блоки допродаж прямо в админку.",
    demoP2: "Этот прототип работает без бэкенда, поэтому шаг импорта показан здесь только для демонстрации.",
    gotIt: "Понятно",
    connectTitle: "Подключите ваш магазин Shopify",
    connectBody: "Вы перейдёте на страницу авторизации Shopify, чтобы разрешить доступ. Токен доступа остаётся на бэкенде — фронтенд его не видит.",
    domainPlaceholder: "ваш-магазин.myshopify.com", connectBtn: "Подключить магазин",
    connected: "Подключено",
    publishBody: "Товар будет создан как черновик в вашем магазине — вы сможете проверить и опубликовать его из админки Shopify.",
    publishing: "Публикуем…", publishBtn: "Опубликовать товар",
    doneTitle: "Готово — товар создан как черновик.", openAdmin: "Открыть в админке Shopify",
    discountCode: "Промокод для bundle-скидки", done: "Готово",
  },
  en: {
    eyebrow: "AI Store Builder",
    title: "Paste a product link — get a finished store",
    sub: "This demo runs entirely in your browser — it parses the link, detects the niche, and builds the full store structure with copy, upsells, and pricing. Nothing is sent to a server.",
    placeholder: "Paste a product link or type a product name…",
    building: "Building…", submit: "Build store",
    tryLabel: "Try:", exAli: "AliExpress example", exAmazon: "Amazon example", exAlibaba: "Alibaba example",
    source: "source", saved: "Saved ✓", save: "Save to watchlist", importBtn: "Import to Shopify",
    buyNow: "Buy now",
    pageCopy: "Product page copy", sections: "Generated page sections", collections: "Collections",
    price: "Pricing", costLabel: "Estimated supplier cost", retailLabel: "Recommended retail price", marginLabel: "Margin", refineCalc: "Refine the math",
    marketSignal: "Market signal", demandPoints: "/100 demand score", checkTrend: "Check this trend",
    bundleTitle: "Bundle upsell", cartTitle: "Cart upsell",
    modalTitle: "Import to Shopify",
    demoP1: "In a full product, this step connects to your Shopify store via OAuth and pushes the generated theme, pages, and upsell blocks straight into the admin.",
    demoP2: "This prototype has no backend, so the import step is shown here for demonstration only.",
    gotIt: "Got it",
    connectTitle: "Connect your Shopify store",
    connectBody: "You'll be redirected to Shopify's authorization page to approve access. The access token stays on the backend — the frontend never sees it.",
    domainPlaceholder: "your-store.myshopify.com", connectBtn: "Connect store",
    connected: "Connected",
    publishBody: "The product will be created as a draft in your store — you can review and publish it from the Shopify admin.",
    publishing: "Publishing…", publishBtn: "Publish product",
    doneTitle: "Done — product created as a draft.", openAdmin: "Open in Shopify admin",
    discountCode: "Bundle discount code", done: "Done",
  },
};

export function StoreBuilder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const [input, setInput] = useState(params.get("url") ?? "");
  const [building, setBuilding] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<GeneratedStore | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoRan = useRef(false);
  const lastInput = useRef<string>("");

  const [session, setSession] = useState<ShopifySession | null>(() => getStoredSession());
  const [shopDomain, setShopDomain] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishStoreResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    const connectedShop = params.get("shopifyConnected");
    const token = params.get("session");
    if (connectedShop && token) {
      const newSession = { shop: connectedShop, token };
      saveSession(newSession);
      setSession(newSession);
      setImportOpen(true);
      navigate("/store-builder", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runGeneration(value: string) {
    if (!value.trim()) return;
    lastInput.current = value;
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setSaved(false);
    setResult(null);
    setPublishResult(null);
    setPublishError(null);
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

  // Re-run generation in the new language if the user already has a result.
  useEffect(() => {
    if (lastInput.current) runGeneration(lastInput.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runGeneration(input);
  }

  function handleSave() {
    if (!result) return;
    const priceLabel = lang === "en" ? `Generated store: ${result.storeName} · recommended price $${result.price.toFixed(2)}` : `Сгенерированный магазин: ${result.storeName} · рекомендованная цена $${result.price.toFixed(2)}`;
    addSaved({ name: result.productName, category: nicheLabel(result.niche, lang), note: priceLabel });
    setSaved(true);
  }

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidShopDomain(shopDomain)) return;
    startConnect(shopDomain);
  }

  async function handlePublish() {
    if (!result) return;
    setPublishing(true);
    setPublishError(null);
    try {
      const publishResponse = await publishStoreToShopify({
        productName: result.productName,
        description: result.description,
        usps: result.usps,
        collections: result.collections,
        price: result.price,
        bundleUpsell: result.bundleUpsell,
      });
      setPublishResult(publishResponse);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : (lang === "en" ? "Failed to publish the store." : "Не удалось опубликовать магазин."));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="py-14">
      <Container className="max-w-3xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tx.placeholder}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
          <Button type="submit" disabled={building} className="whitespace-nowrap">
            {building ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {building ? tx.building : tx.submit}
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-ink-400">{tx.tryLabel}</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setInput(ex); runGeneration(ex); }}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-ink-500 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400"
            >
              {ex.includes("aliexpress") ? tx.exAli : ex.includes("amazon") ? tx.exAmazon : tx.exAlibaba}
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
                <Badge>{result.niche.emoji} {nicheLabel(result.niche, lang)}</Badge>
                <span className="text-xs font-medium text-ink-400">{tx.source}: {result.source}</span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink-950 dark:text-white">{result.storeName}</h3>
              <p className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400"><Globe size={14} /> {result.domainSuggestion}</p>
            </div>
            <div className="flex gap-2">
              <Button variant={saved ? "secondary" : "outline"} onClick={handleSave}>
                <Bookmark size={15} /> {saved ? tx.saved : tx.save}
              </Button>
              <Button onClick={() => setImportOpen(true)}>{tx.importBtn}</Button>
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
              <h2 className="mx-auto max-w-lg font-display text-2xl font-semibold text-ink-950 dark:text-white sm:text-3xl">{result.heroHeadline}</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-ink-500 dark:text-ink-400">{result.heroSub}</p>
              <span className="mt-6 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">{tx.buyNow} — ${result.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h4 className="font-semibold text-ink-950 dark:text-white">{tx.pageCopy}</h4>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{result.description}</p>
              <ul className="mt-4 space-y-2.5">
                {result.usps.map((u) => (
                  <li key={u} className="flex gap-2.5 text-sm text-ink-600 dark:text-ink-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {u}
                  </li>
                ))}
              </ul>

              <h4 className="mt-6 font-semibold text-ink-950 dark:text-white">{tx.sections}</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.pageSections.map((s) => (
                  <span key={s} className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs text-ink-600 dark:border-ink-700 dark:text-ink-300">{s}</span>
                ))}
              </div>

              <h4 className="mt-6 font-semibold text-ink-950 dark:text-white">{tx.collections}</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.collections.map((c) => (
                  <span key={c} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">{c}</span>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Tag size={16} /> {tx.price}</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <Row label={tx.costLabel} value={`$${result.cost.toFixed(2)}`} />
                  <Row label={tx.retailLabel} value={`$${result.price.toFixed(2)}`} bold />
                  <Row label={tx.marginLabel} value={`${result.marginPct}%`} />
                </div>
                <Link to={`/tools/profit-calculator?cost=${result.cost}&price=${result.price}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {tx.refineCalc} <ArrowRight size={14} />
                </Link>
              </Card>

              <Card>
                <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><TrendingUp size={16} /> {tx.marketSignal}</h4>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-ink-950 dark:text-white">{result.marketScore}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">{tx.demandPoints}</div>
                </div>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{result.competitionLabel}</p>
                <Link to={`/trends?q=${encodeURIComponent(result.productName)}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {tx.checkTrend} <ExternalLink size={13} />
                </Link>
              </Card>
            </div>
          </div>

          {/* Upsells */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><PackagePlus size={16} /> {tx.bundleTitle}</h4>
              <div className="mt-3 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/30">
                <p className="font-semibold text-brand-700 dark:text-brand-300">{result.bundleUpsell.title}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{result.bundleUpsell.discount}</p>
              </div>
            </Card>
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><ShoppingBag size={16} /> {tx.cartTitle}</h4>
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

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title={tx.modalTitle}>
        {!backendUrl && (
          <>
            <p>{tx.demoP1}</p>
            <p className="mt-2">{tx.demoP2}</p>
            <Button className="mt-4 w-full" onClick={() => setImportOpen(false)}>{tx.gotIt}</Button>
          </>
        )}

        {backendUrl && !session && (
          <form onSubmit={handleConnect}>
            <p className="flex items-center gap-2 font-medium text-ink-900 dark:text-white">
              <StoreIcon size={16} /> {tx.connectTitle}
            </p>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{tx.connectBody}</p>
            <input
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder={tx.domainPlaceholder}
              className="mt-3 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
            <Button type="submit" className="mt-3 w-full" disabled={!isValidShopDomain(shopDomain)}>
              {tx.connectBtn}
            </Button>
          </form>
        )}

        {backendUrl && session && (
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-400">
              <Check size={15} /> {tx.connected}: {session.shop}
            </p>

            {!publishResult && (
              <>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{tx.publishBody}</p>
                <Button className="mt-4 w-full" onClick={handlePublish} disabled={publishing}>
                  {publishing ? <Loader2 size={16} className="animate-spin" /> : <StoreIcon size={16} />}
                  {publishing ? tx.publishing : tx.publishBtn}
                </Button>
                {publishError && <p className="mt-2 text-sm text-red-500">{publishError}</p>}
              </>
            )}

            {publishResult && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium text-ink-900 dark:text-white">{tx.doneTitle}</p>
                <a href={publishResult.productAdminUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {tx.openAdmin} <ExternalLink size={13} />
                </a>
                {publishResult.discountCode && (
                  <p className="text-ink-500 dark:text-ink-400">{tx.discountCode}: <span className="font-mono font-semibold text-ink-900 dark:text-white">{publishResult.discountCode}</span></p>
                )}
                <Button className="mt-2 w-full" onClick={() => setImportOpen(false)}>{tx.done}</Button>
              </div>
            )}
          </div>
        )}
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
