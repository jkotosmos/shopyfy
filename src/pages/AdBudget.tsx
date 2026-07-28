import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Wallet, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { computeAdBudget, type Verdict } from "../lib/adBudget";
import { useLanguage, type Lang } from "../lib/i18n";

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string;
  economics: string; price: string; profitPerUnit: string;
  campaign: string; dailySpend: string; totalSpend: string; totalSales: string;
  results: string; breakEven: string; testBudget: string; currentCPA: string; noSalesYet: string;
  rule: string;
  profitCalcLink: string;
}> = {
  ru: {
    eyebrow: "Тестирование рекламы", title: "Калькулятор тестового бюджета: убить или масштабировать",
    sub: "Стандартное правило запуска: потратьте примерно 3× прибыли с одной продажи на тест, прежде чем судить о результате. Введите цифры кампании — получите чёткий вердикт.",
    economics: "Экономика товара", price: "Цена продажи", profitPerUnit: "Прибыль с одной продажи (до рекламы)",
    campaign: "Данные кампании", dailySpend: "Дневной бюджет", totalSpend: "Потрачено всего", totalSales: "Продаж получено",
    results: "Вердикт", breakEven: "Точка безубыточности (CPA)", testBudget: "Рекомендованный тестовый бюджет", currentCPA: "Текущая цена продажи (CPA)", noSalesYet: "пока нет",
    rule: "Правило: тестируйте на бюджете ≈ 3× точки безубыточности, прежде чем убивать или масштабировать кампанию.",
    profitCalcLink: "Не знаете прибыль с единицы? Посчитайте в калькуляторе маржи",
  },
  en: {
    eyebrow: "Ad testing", title: "Test Budget Calculator: kill or scale",
    sub: "Standard launch rule: spend roughly 3× your profit-per-sale on testing before judging a campaign. Enter your campaign numbers to get a clear verdict.",
    economics: "Product economics", price: "Sale price", profitPerUnit: "Profit per sale (before ad spend)",
    campaign: "Campaign data", dailySpend: "Daily budget", totalSpend: "Total spent", totalSales: "Sales so far",
    results: "Verdict", breakEven: "Break-even (CPA)", testBudget: "Recommended test budget", currentCPA: "Current cost per sale (CPA)", noSalesYet: "none yet",
    rule: "Rule of thumb: test with a budget ≈ 3× break-even before killing or scaling a campaign.",
    profitCalcLink: "Don't know your profit per unit? Calculate it in the margin calculator",
  },
};

const VERDICT_STYLE: Record<Verdict, { icon: typeof TrendingUp; className: string }> = {
  "too-early": { icon: Minus, className: "border-ink-300 bg-ink-50 text-ink-700 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-200" },
  kill: { icon: TrendingDown, className: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300" },
  hold: { icon: Minus, className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300" },
  scale: { icon: TrendingUp, className: "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300" },
};

function NumberField({ label, value, onChange, prefix }: { label: string; value: number; onChange: (v: number) => void; prefix?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{label}</span>
      <div className="mt-1.5 flex items-center rounded-xl border border-ink-200 bg-white px-3 dark:border-ink-700 dark:bg-ink-900">
        {prefix && <span className="text-sm text-ink-400">{prefix}</span>}
        <input
          type="number"
          step={0.01}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent px-2 py-2.5 text-sm text-ink-900 outline-none dark:text-white"
        />
      </div>
    </label>
  );
}

export function AdBudget() {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const tx = TEXT[lang];

  const [price, setPrice] = useState(Number(params.get("price")) || 29.99);
  const [profitPerUnit, setProfitPerUnit] = useState(Number(params.get("profit")) || 11.62);
  const [dailySpend, setDailySpend] = useState(20);
  const [totalSpend, setTotalSpend] = useState(35);
  const [totalSales, setTotalSales] = useState(1);

  const result = useMemo(
    () => computeAdBudget({ price, profitPerUnit, dailySpend, totalSpend, totalSales }, lang),
    [price, profitPerUnit, dailySpend, totalSpend, totalSales, lang],
  );

  const style = VERDICT_STYLE[result.verdict];
  const Icon = style.icon;

  return (
    <div className="py-14">
      <Container className="max-w-2xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>
      </Container>

      <Container className="mt-10 max-w-3xl">
        <Card>
          <h3 className="font-semibold text-ink-950 dark:text-white">{tx.economics}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField label={tx.price} value={price} onChange={setPrice} prefix="$" />
            <NumberField label={tx.profitPerUnit} value={profitPerUnit} onChange={setProfitPerUnit} prefix="$" />
          </div>
          <Link to={`/tools/profit-calculator?price=${price}`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
            {tx.profitCalcLink} <ArrowRight size={12} />
          </Link>
        </Card>

        <Card className="mt-6">
          <h3 className="font-semibold text-ink-950 dark:text-white">{tx.campaign}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <NumberField label={tx.dailySpend} value={dailySpend} onChange={setDailySpend} prefix="$" />
            <NumberField label={tx.totalSpend} value={totalSpend} onChange={setTotalSpend} prefix="$" />
            <NumberField label={tx.totalSales} value={totalSales} onChange={setTotalSales} />
          </div>
        </Card>

        <Card className="mt-6">
          <h3 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Wallet size={17} /> {tx.results}</h3>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-ink-500 dark:text-ink-400">{tx.breakEven}</p>
              <p className="mt-1 text-xl font-bold text-ink-950 dark:text-white">${result.breakEvenCPA.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500 dark:text-ink-400">{tx.testBudget}</p>
              <p className="mt-1 text-xl font-bold text-ink-950 dark:text-white">${result.recommendedTestBudget.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500 dark:text-ink-400">{tx.currentCPA}</p>
              <p className="mt-1 text-xl font-bold text-ink-950 dark:text-white">{result.currentCPA !== null ? `$${result.currentCPA.toFixed(2)}` : tx.noSalesYet}</p>
            </div>
          </div>

          <div className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${style.className}`}>
            <Icon size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{result.verdictLabel}</p>
              <p className="mt-1 text-sm opacity-90">{result.verdictBody}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-400">{tx.rule}</p>
        </Card>
      </Container>
    </div>
  );
}
