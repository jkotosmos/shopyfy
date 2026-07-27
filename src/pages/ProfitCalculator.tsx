import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calculator, Wand2, Gauge } from "lucide-react";
import { Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { computeMargin, computeWinningScore, suggestPriceForMargin } from "../lib/calc";
import { useLanguage, type Lang } from "../lib/i18n";

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string;
  yourNumbers: string; cost: string; shipping: string; fixedFees: string; paymentFee: string; adSpend: string; retailPrice: string;
  targetMargin: string; suggestPrice: string;
  results: string; profitPerUnit: string; margin: string; roi: string; breakEven: string; feeNote: string;
  scoreTitle: string; trendGrowth: string; competitionLevel: string; low: string; oversaturated: string;
}> = {
  ru: {
    eyebrow: "Инструмент ценообразования", title: "Калькулятор маржи",
    sub: "Маржа в дропшиппинге быстро тает, как только учитываешь доставку, комиссию платёжки и расходы на рекламу. Введите реальные цифры, чтобы увидеть, что остаётся на самом деле, — и какая цена даёт нужную маржу.",
    yourNumbers: "Ваши цифры", cost: "Себестоимость у поставщика", shipping: "Стоимость доставки", fixedFees: "Прочие фиксированные расходы",
    paymentFee: "Комиссия платёжной системы", adSpend: "Расходы на рекламу за единицу", retailPrice: "Розничная цена",
    targetMargin: "Или задайте целевую маржу", suggestPrice: "Предложить цену",
    results: "Результаты", profitPerUnit: "Прибыль / единица", margin: "Маржа", roi: "ROI на расходы", breakEven: "Цена безубыточности",
    feeNote: "Комиссия платёжки при этой цене", scoreTitle: "Оценка выигрышного товара",
    trendGrowth: "Рост тренда (90 дней, %)", competitionLevel: "Уровень конкуренции", low: "низкий", oversaturated: "перенасыщено",
  },
  en: {
    eyebrow: "Pricing tool", title: "Margin Calculator",
    sub: "Dropshipping margin evaporates fast once you factor in shipping, payment fees, and ad spend. Enter real numbers to see what's actually left — and what price hits your target margin.",
    yourNumbers: "Your numbers", cost: "Supplier cost", shipping: "Shipping cost", fixedFees: "Other fixed costs",
    paymentFee: "Payment processor fee", adSpend: "Ad spend per unit", retailPrice: "Retail price",
    targetMargin: "Or set a target margin", suggestPrice: "Suggest a price",
    results: "Results", profitPerUnit: "Profit / unit", margin: "Margin", roi: "ROI on spend", breakEven: "Break-even price",
    feeNote: "Payment fee at this price", scoreTitle: "Winning Product Score",
    trendGrowth: "Trend growth (90 days, %)", competitionLevel: "Competition level", low: "low", oversaturated: "oversaturated",
  },
};

function NumberField({ label, value, onChange, prefix, suffix, step = 0.1 }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; step?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{label}</span>
      <div className="mt-1.5 flex items-center rounded-xl border border-ink-200 bg-white px-3 dark:border-ink-700 dark:bg-ink-900">
        {prefix && <span className="text-sm text-ink-400">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent px-2 py-2.5 text-sm text-ink-900 outline-none dark:text-white"
        />
        {suffix && <span className="text-sm text-ink-400">{suffix}</span>}
      </div>
    </label>
  );
}

export function ProfitCalculator() {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const [cost, setCost] = useState(Number(params.get("cost")) || 8);
  const [shipping, setShipping] = useState(2.5);
  const [fixedFees, setFixedFees] = useState(1);
  const [paymentFeePct, setPaymentFeePct] = useState(2.9);
  const [adSpendPerUnit, setAdSpendPerUnit] = useState(6);
  const [price, setPrice] = useState(Number(params.get("price")) || 29.99);
  const [targetMargin, setTargetMargin] = useState(50);

  const [growthPct, setGrowthPct] = useState(60);
  const [competition, setCompetition] = useState<1 | 2 | 3 | 4 | 5>(3);

  const margin = useMemo(
    () => computeMargin({ cost, shipping, fixedFees, paymentFeePct, adSpendPerUnit, price }),
    [cost, shipping, fixedFees, paymentFeePct, adSpendPerUnit, price],
  );

  const score = useMemo(
    () => computeWinningScore({ growthPct, competition, marginPct: Math.max(0, margin.marginPct), price }, lang),
    [growthPct, competition, margin.marginPct, price, lang],
  );

  function applySuggestedPrice() {
    const suggested = suggestPriceForMargin({ cost, shipping, fixedFees, paymentFeePct, adSpendPerUnit }, targetMargin);
    if (Number.isFinite(suggested)) setPrice(Math.round(suggested * 100) / 100);
  }

  return (
    <div className="py-14">
      <Container className="max-w-2xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>
      </Container>

      <Container className="mt-10 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Calculator size={17} /> {tx.yourNumbers}</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <NumberField label={tx.cost} value={cost} onChange={setCost} prefix="$" />
              <NumberField label={tx.shipping} value={shipping} onChange={setShipping} prefix="$" />
              <NumberField label={tx.fixedFees} value={fixedFees} onChange={setFixedFees} prefix="$" />
              <NumberField label={tx.paymentFee} value={paymentFeePct} onChange={setPaymentFeePct} suffix="%" />
              <NumberField label={tx.adSpend} value={adSpendPerUnit} onChange={setAdSpendPerUnit} prefix="$" />
              <NumberField label={tx.retailPrice} value={price} onChange={setPrice} prefix="$" />
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-ink-300 p-4 dark:border-ink-700">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.targetMargin}</span>
                  <div className="mt-1.5 flex items-center rounded-lg border border-ink-200 bg-white px-2 dark:border-ink-700 dark:bg-ink-900">
                    <input type="number" value={targetMargin} onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)} className="w-full bg-transparent px-2 py-2 text-sm outline-none dark:text-white" />
                    <span className="text-sm text-ink-400">%</span>
                  </div>
                </div>
                <button type="button" onClick={applySuggestedPrice} className="flex items-center gap-1.5 self-end rounded-lg bg-ink-900 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950">
                  <Wand2 size={13} /> {tx.suggestPrice}
                </button>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-ink-950 dark:text-white">{tx.results}</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <ResultTile label={tx.profitPerUnit} value={`$${margin.profit.toFixed(2)}`} positive={margin.profit >= 0} />
                <ResultTile label={tx.margin} value={`${margin.marginPct.toFixed(1)}%`} positive={margin.marginPct >= 0} />
                <ResultTile label={tx.roi} value={`${margin.roiPct.toFixed(0)}%`} positive={margin.roiPct >= 0} />
                <ResultTile label={tx.breakEven} value={`$${margin.breakEvenPrice.toFixed(2)}`} />
              </div>
              <p className="mt-4 text-xs text-ink-400">{tx.feeNote}: ${margin.paymentFee.toFixed(2)} · {lang === "en" ? "Total unit cost" : "Полная себестоимость единицы"}: ${margin.totalCost.toFixed(2)}</p>
            </Card>

            <Card>
              <h3 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Gauge size={17} /> {tx.scoreTitle}</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.trendGrowth}</span>
                  <input type="range" min={0} max={200} value={growthPct} onChange={(e) => setGrowthPct(Number(e.target.value))} className="mt-3 w-full accent-brand-500" />
                  <span className="text-xs text-ink-400">{growthPct}%</span>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.competitionLevel}</span>
                  <select value={competition} onChange={(e) => setCompetition(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-2 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white">
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? `(${tx.low})` : n === 5 ? `(${tx.oversaturated})` : ""}</option>)}
                  </select>
                </label>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="text-4xl font-extrabold text-ink-950 dark:text-white">{score.total}</div>
                <p className="text-sm text-ink-500 dark:text-ink-400">{score.verdict}</p>
              </div>
              <div className="mt-4 space-y-2">
                {score.breakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs text-ink-500 dark:text-ink-400"><span>{b.label}</span><span>{b.points}/{b.max}</span></div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-ink-100 dark:bg-ink-800">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(b.points / b.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

function ResultTile({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3.5 dark:bg-ink-800/60">
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${positive === false ? "text-red-500" : "text-ink-950 dark:text-white"}`}>{value}</p>
    </div>
  );
}
