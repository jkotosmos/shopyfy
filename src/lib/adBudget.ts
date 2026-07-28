import type { Lang } from "./i18n";

export interface AdBudgetInputs {
  price: number;
  profitPerUnit: number; // from the margin calculator (before ad spend)
  dailySpend: number;
  totalSpend: number;
  totalSales: number;
}

export type Verdict = "too-early" | "kill" | "scale" | "hold";

export interface AdBudgetResult {
  breakEvenCPA: number;
  recommendedTestBudget: number;
  currentCPA: number | null;
  verdict: Verdict;
  verdictLabel: string;
  verdictBody: string;
}

const TEST_MULTIPLIER = 3; // spend ~3x break-even CPA before judging a campaign — standard heuristic

const VERDICT_TEXT: Record<Lang, Record<Verdict, { label: string; body: (r: { breakEvenCPA: number; recommendedTestBudget: number; currentCPA: number | null }) => string }>> = {
  ru: {
    "too-early": { label: "Рано судить — продолжайте тест", body: (r) => `Потрачено ещё меньше рекомендованного тестового бюджета ($${r.recommendedTestBudget.toFixed(2)}). Дайте алгоритму собрать данные, не выключайте раньше времени.` },
    kill: { label: "Останавливать — 0 продаж", body: (r) => `Бюджет ($${r.recommendedTestBudget.toFixed(2)}) израсходован, продаж нет. Ракурс/креатив не сработал — тестируйте другой товар или другой хук.` },
    scale: { label: "Масштабировать", body: (r) => `Текущая цена привлечения $${r.currentCPA?.toFixed(2)} заметно ниже точки безубыточности ($${r.breakEvenCPA.toFixed(2)}). Увеличивайте бюджет на 20–30% в день, не резко.` },
    hold: { label: "Держать, масштабировать осторожно", body: (r) => `Цена привлечения $${r.currentCPA?.toFixed(2)} около точки безубыточности ($${r.breakEvenCPA.toFixed(2)}) — прибыль есть, но запас небольшой. Ищите способ снизить CPA (новый креатив, аудитория) прежде чем сильно увеличивать бюджет.` },
  },
  en: {
    "too-early": { label: "Too early to judge — keep testing", body: (r) => `You've spent less than the recommended test budget ($${r.recommendedTestBudget.toFixed(2)}). Let the algorithm gather data — don't pull the plug early.` },
    kill: { label: "Kill it — 0 sales", body: (r) => `The test budget ($${r.recommendedTestBudget.toFixed(2)}) is spent with no sales. This angle/creative isn't working — test a different product or hook.` },
    scale: { label: "Scale it", body: (r) => `Your current cost per sale ($${r.currentCPA?.toFixed(2)}) is comfortably below break-even ($${r.breakEvenCPA.toFixed(2)}). Increase budget 20–30% per day, not all at once.` },
    hold: { label: "Hold, scale carefully", body: (r) => `Cost per sale ($${r.currentCPA?.toFixed(2)}) is close to break-even ($${r.breakEvenCPA.toFixed(2)}) — profitable, but thin margin. Look for ways to lower CPA (new creative, audience) before pushing budget hard.` },
  },
};

export function computeAdBudget(inputs: AdBudgetInputs, lang: Lang = "ru"): AdBudgetResult {
  const breakEvenCPA = Math.max(0, inputs.profitPerUnit);
  const recommendedTestBudget = breakEvenCPA * TEST_MULTIPLIER || inputs.price * TEST_MULTIPLIER;
  const currentCPA = inputs.totalSales > 0 ? inputs.totalSpend / inputs.totalSales : null;

  let verdict: Verdict;
  if (inputs.totalSpend < recommendedTestBudget) {
    verdict = "too-early";
  } else if (currentCPA === null) {
    verdict = "kill";
  } else if (currentCPA <= breakEvenCPA * 0.8) {
    verdict = "scale";
  } else if (currentCPA <= breakEvenCPA) {
    verdict = "hold";
  } else {
    verdict = "kill";
  }

  const text = VERDICT_TEXT[lang][verdict];
  return {
    breakEvenCPA,
    recommendedTestBudget,
    currentCPA,
    verdict,
    verdictLabel: text.label,
    verdictBody: text.body({ breakEvenCPA, recommendedTestBudget, currentCPA }),
  };
}
