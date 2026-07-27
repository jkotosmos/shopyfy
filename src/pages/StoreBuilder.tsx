import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, Check, Loader2, Globe, Tag, TrendingUp, Bookmark, ExternalLink,
  ShoppingBag, PackagePlus, Store as StoreIcon,
} from "lucide-react";
import { Badge, Button, Card, Container, Eyebrow, Modal, SectionTitle } from "../components/ui";
import { generateStore, type GeneratedStore } from "../lib/generator";
import { addSaved } from "../lib/storage";
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

export function StoreBuilder() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(params.get("url") ?? "");
  const [building, setBuilding] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<GeneratedStore | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoRan = useRef(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runGeneration(input);
  }

  function handleSave() {
    if (!result) return;
    addSaved({ name: result.productName, category: result.niche.label, note: `Сгенерированный магазин: ${result.storeName} · рекомендованная цена $${result.price.toFixed(2)}` });
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
      setPublishError(err instanceof Error ? err.message : "Не удалось опубликовать магазин.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="py-14">
      <Container className="max-w-3xl text-center">
        <Eyebrow>AI-конструктор магазина</Eyebrow>
        <SectionTitle>Вставьте ссылку на товар — получите готовый магазин</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">
          Это демо полностью работает в вашем браузере — оно разбирает ссылку, определяет нишу и собирает полную
          структуру магазина с текстами, допродажами и ценой. Ничего не отправляется на сервер.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Вставьте ссылку на товар или введите название…"
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
          <Button type="submit" disabled={building} className="whitespace-nowrap">
            {building ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {building ? "Собираем…" : "Собрать магазин"}
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-ink-400">Попробуйте:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setInput(ex); runGeneration(ex); }}
              className="rounded-full border border-ink-200 px-2.5 py-1 text-ink-500 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400"
            >
              {ex.includes("aliexpress") ? "Пример с AliExpress" : ex.includes("amazon") ? "Пример с Amazon" : "Пример с Alibaba"}
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
                <span className="text-xs font-medium text-ink-400">источник: {result.source}</span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-ink-950 dark:text-white">{result.storeName}</h3>
              <p className="flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400"><Globe size={14} /> {result.domainSuggestion}</p>
            </div>
            <div className="flex gap-2">
              <Button variant={saved ? "secondary" : "outline"} onClick={handleSave}>
                <Bookmark size={15} /> {saved ? "Сохранено ✓" : "Сохранить в вотчлист"}
              </Button>
              <Button onClick={() => setImportOpen(true)}>Импортировать в Shopify</Button>
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
              <span className="mt-6 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">Купить сейчас — ${result.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h4 className="font-semibold text-ink-950 dark:text-white">Текст страницы товара</h4>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{result.description}</p>
              <ul className="mt-4 space-y-2.5">
                {result.usps.map((u) => (
                  <li key={u} className="flex gap-2.5 text-sm text-ink-600 dark:text-ink-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {u}
                  </li>
                ))}
              </ul>

              <h4 className="mt-6 font-semibold text-ink-950 dark:text-white">Сгенерированные секции страницы</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.pageSections.map((s) => (
                  <span key={s} className="rounded-lg border border-ink-200 px-2.5 py-1 text-xs text-ink-600 dark:border-ink-700 dark:text-ink-300">{s}</span>
                ))}
              </div>

              <h4 className="mt-6 font-semibold text-ink-950 dark:text-white">Коллекции</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.collections.map((c) => (
                  <span key={c} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">{c}</span>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Tag size={16} /> Цена</h4>
                <div className="mt-3 space-y-2 text-sm">
                  <Row label="Примерная себестоимость" value={`$${result.cost.toFixed(2)}`} />
                  <Row label="Рекомендованная розничная цена" value={`$${result.price.toFixed(2)}`} bold />
                  <Row label="Маржа" value={`${result.marginPct}%`} />
                </div>
                <Link to={`/tools/profit-calculator?cost=${result.cost}&price=${result.price}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Уточнить расчёт <ArrowRight size={14} />
                </Link>
              </Card>

              <Card>
                <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><TrendingUp size={16} /> Сигнал рынка</h4>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-ink-950 dark:text-white">{result.marketScore}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">/100 баллов спроса</div>
                </div>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{result.competitionLabel}</p>
                <Link to={`/trends?q=${encodeURIComponent(result.productName)}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Проверить этот тренд <ExternalLink size={13} />
                </Link>
              </Card>
            </div>
          </div>

          {/* Upsells */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><PackagePlus size={16} /> Bundle-допродажа</h4>
              <div className="mt-3 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/30">
                <p className="font-semibold text-brand-700 dark:text-brand-300">{result.bundleUpsell.title}</p>
                <p className="text-sm text-ink-500 dark:text-ink-400">{result.bundleUpsell.discount}</p>
              </div>
            </Card>
            <Card>
              <h4 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><ShoppingBag size={16} /> Допродажа в корзине</h4>
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

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Импорт в Shopify">
        {!backendUrl && (
          <>
            <p>
              В полноценном продукте этот шаг подключается к вашему магазину Shopify через OAuth и переносит
              сгенерированную тему, страницы и блоки допродаж прямо в админку.
            </p>
            <p className="mt-2">Этот прототип работает без бэкенда, поэтому шаг импорта показан здесь только для демонстрации.</p>
            <Button className="mt-4 w-full" onClick={() => setImportOpen(false)}>Понятно</Button>
          </>
        )}

        {backendUrl && !session && (
          <form onSubmit={handleConnect}>
            <p className="flex items-center gap-2 font-medium text-ink-900 dark:text-white">
              <StoreIcon size={16} /> Подключите ваш магазин Shopify
            </p>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              Вы перейдёте на страницу авторизации Shopify, чтобы разрешить доступ. Токен доступа остаётся на
              бэкенде — фронтенд его не видит.
            </p>
            <input
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="ваш-магазин.myshopify.com"
              className="mt-3 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
            <Button type="submit" className="mt-3 w-full" disabled={!isValidShopDomain(shopDomain)}>
              Подключить магазин
            </Button>
          </form>
        )}

        {backendUrl && session && (
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-400">
              <Check size={15} /> Подключено: {session.shop}
            </p>

            {!publishResult && (
              <>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                  Товар будет создан как черновик в вашем магазине — вы сможете проверить и опубликовать его
                  из админки Shopify.
                </p>
                <Button className="mt-4 w-full" onClick={handlePublish} disabled={publishing}>
                  {publishing ? <Loader2 size={16} className="animate-spin" /> : <StoreIcon size={16} />}
                  {publishing ? "Публикуем…" : "Опубликовать товар"}
                </Button>
                {publishError && <p className="mt-2 text-sm text-red-500">{publishError}</p>}
              </>
            )}

            {publishResult && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium text-ink-900 dark:text-white">Готово — товар создан как черновик.</p>
                <a href={publishResult.productAdminUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400">
                  Открыть в админке Shopify <ExternalLink size={13} />
                </a>
                {publishResult.discountCode && (
                  <p className="text-ink-500 dark:text-ink-400">Промокод для bundle-скидки: <span className="font-mono font-semibold text-ink-900 dark:text-white">{publishResult.discountCode}</span></p>
                )}
                <Button className="mt-2 w-full" onClick={() => setImportOpen(false)}>Готово</Button>
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
