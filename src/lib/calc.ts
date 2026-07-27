export interface MarginInputs {
  cost: number;
  shipping: number;
  fixedFees: number; // packaging, app fees, etc. per unit
  paymentFeePct: number; // payment processor %, e.g. 2.9
  adSpendPerUnit: number;
  price: number;
}

export interface MarginResult {
  totalCost: number;
  paymentFee: number;
  profit: number;
  marginPct: number;
  roiPct: number;
  breakEvenPrice: number;
}

export function computeMargin(inputs: MarginInputs): MarginResult {
  const { cost, shipping, fixedFees, paymentFeePct, adSpendPerUnit, price } = inputs;
  const paymentFee = price * (paymentFeePct / 100);
  const totalCost = cost + shipping + fixedFees + adSpendPerUnit + paymentFee;
  const profit = price - totalCost;
  const marginPct = price > 0 ? (profit / price) * 100 : 0;
  const baseCost = cost + shipping + fixedFees + adSpendPerUnit;
  const roiPct = baseCost > 0 ? (profit / baseCost) * 100 : 0;
  // price at which profit = 0, accounting for payment fee scaling with price
  const breakEvenPrice = (cost + shipping + fixedFees + adSpendPerUnit) / (1 - paymentFeePct / 100);
  return { totalCost, paymentFee, profit, marginPct, roiPct, breakEvenPrice };
}

export function suggestPriceForMargin(inputs: Omit<MarginInputs, "price">, targetMarginPct: number): number {
  const { cost, shipping, fixedFees, paymentFeePct, adSpendPerUnit } = inputs;
  const baseCost = cost + shipping + fixedFees + adSpendPerUnit;
  const denom = 1 - targetMarginPct / 100 - paymentFeePct / 100;
  if (denom <= 0) return Infinity;
  return baseCost / denom;
}

export interface ScoreInputs {
  growthPct: number; // 0-200+
  competition: 1 | 2 | 3 | 4 | 5; // 1 low - 5 high
  marginPct: number; // 0-100
  price: number;
}

export interface ScoreResult {
  total: number;
  verdict: string;
  breakdown: { label: string; points: number; max: number }[];
}

export function computeWinningScore(inputs: ScoreInputs): ScoreResult {
  const growthPoints = Math.round(Math.min(35, (inputs.growthPct / 150) * 35));
  const competitionPoints = Math.round(((5 - inputs.competition) / 4) * 25);
  const marginPoints = Math.round(Math.min(30, (inputs.marginPct / 70) * 30));
  const priceSweetSpot = inputs.price >= 15 && inputs.price <= 60 ? 10 : inputs.price > 60 && inputs.price <= 90 ? 6 : 3;

  const total = growthPoints + competitionPoints + marginPoints + priceSweetSpot;

  let verdict = "Risky — needs a stronger angle before you spend on ads.";
  if (total >= 80) verdict = "Strong winning-product signal — worth testing with a small ad budget.";
  else if (total >= 60) verdict = "Promising — validate demand with organic content before scaling ads.";
  else if (total >= 40) verdict = "Mixed signals — improve margin or find a less saturated angle.";

  return {
    total,
    verdict,
    breakdown: [
      { label: "Trend growth", points: growthPoints, max: 35 },
      { label: "Competition level", points: competitionPoints, max: 25 },
      { label: "Profit margin", points: marginPoints, max: 30 },
      { label: "Price sweet spot ($15–$60)", points: priceSweetSpot, max: 10 },
    ],
  };
}
