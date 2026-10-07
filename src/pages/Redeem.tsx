import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { KeyRound, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { Button, Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { redeemPromoCode, getEntitlement, type Entitlement } from "../lib/payments";
import { useLanguage, type Lang } from "../lib/i18n";

const PLAN_NAMES: Record<Lang, Record<string, string>> = {
  ru: { starter: "Starter", growth: "Growth", pro: "Pro" },
  en: { starter: "Starter", growth: "Growth", pro: "Pro" },
};

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string;
  checkoutSuccessTitle: string; checkoutSuccessBody: string;
  codeLabel: string; placeholder: string; submit: string; submitting: string;
  successTitle: string; successBody: string; backToBuilder: string;
  currentPlan: string;
}> = {
  ru: {
    eyebrow: "Активация", title: "Активируйте план по промокоду",
    sub: "После оплаты промокод приходит на email, указанный при оплате. Введите его здесь, чтобы разблокировать возможности вашего тарифа в этом браузере.",
    checkoutSuccessTitle: "Оплата прошла успешно",
    checkoutSuccessBody: "Промокод уже отправлен на вашу почту (обычно приходит в течение минуты). Введите его ниже, чтобы активировать план.",
    codeLabel: "Промокод", placeholder: "SHOPYFY-XXXXXXXXXX", submit: "Активировать", submitting: "Проверяем…",
    successTitle: "План активирован", successBody: "Тариф разблокирован в этом браузере.", backToBuilder: "Перейти к конструктору магазина",
    currentPlan: "Текущий план",
  },
  en: {
    eyebrow: "Activation", title: "Activate your plan with a promo code",
    sub: "After payment, a promo code is emailed to the address you paid with. Enter it here to unlock your plan's features in this browser.",
    checkoutSuccessTitle: "Payment successful",
    checkoutSuccessBody: "Your promo code has already been emailed to you (usually within a minute). Enter it below to activate your plan.",
    codeLabel: "Promo code", placeholder: "SHOPYFY-XXXXXXXXXX", submit: "Activate", submitting: "Checking…",
    successTitle: "Plan activated", successBody: "Your plan is unlocked in this browser.", backToBuilder: "Go to the store builder",
    currentPlan: "Current plan",
  },
};

export function Redeem() {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const checkoutSuccess = params.get("checkout") === "success";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(() => getEntitlement());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await redeemPromoCode(code.trim(), lang);
      setEntitlement(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === "en" ? "Something went wrong." : "Что-то пошло не так."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-14">
      <Container className="max-w-xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>
      </Container>

      <Container className="mt-10 max-w-md">
        {checkoutSuccess && !entitlement && (
          <Card className="mb-6 border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/30">
            <p className="flex items-center gap-2 font-semibold text-brand-700 dark:text-brand-300"><Mail size={16} /> {tx.checkoutSuccessTitle}</p>
            <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300">{tx.checkoutSuccessBody}</p>
          </Card>
        )}

        {!entitlement && (
          <Card>
            <form onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.codeLabel}</span>
                <div className="mt-1.5 flex items-center rounded-xl border-[1.5px] border-ink-950 bg-[#fffdf8] px-3 dark:border-ink-700 dark:bg-ink-900">
                  <KeyRound size={15} className="text-ink-400" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={tx.placeholder}
                    className="w-full bg-transparent px-2 py-2.5 font-mono text-sm uppercase text-ink-900 outline-none dark:text-white"
                  />
                </div>
              </label>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              <Button type="submit" className="mt-4 w-full" disabled={loading || !code.trim()}>
                {loading ? tx.submitting : tx.submit}
              </Button>
            </form>
          </Card>
        )}

        {entitlement && (
          <Card className="text-center">
            <CheckCircle2 size={28} className="mx-auto text-brand-500" />
            <h3 className="mt-3 font-semibold text-ink-950 dark:text-white">{tx.successTitle}</h3>
            <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{tx.successBody}</p>
            <p className="mt-3 text-xs text-ink-400">{tx.currentPlan}: <span className="font-semibold text-ink-700 dark:text-ink-200">{PLAN_NAMES[lang][entitlement.plan] ?? entitlement.plan}</span></p>
            <Link to="/store-builder" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {tx.backToBuilder} <ArrowRight size={14} />
            </Link>
          </Card>
        )}
      </Container>
    </div>
  );
}
