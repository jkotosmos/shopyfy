import { useState } from "react";
import { Copy, Check, Scale, AlertTriangle } from "lucide-react";
import { Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { generatePrivacyPolicy, generateTermsOfService, generateRefundPolicy, type PolicyInputs } from "../lib/policyGenerator";
import { useLanguage, type Lang } from "../lib/i18n";

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string; disclaimer: string;
  businessName: string; domain: string; contactEmail: string; country: string;
  returnWindow: string; processingDays: string;
  privacy: string; terms: string; refund: string;
  copy: string; copied: string;
}> = {
  ru: {
    eyebrow: "Юридические документы", title: "Генератор политик для магазина",
    sub: "Заполните форму — получите черновики Политики конфиденциальности, Условий использования и Политики возврата под ваш магазин.",
    disclaimer: "Это стартовый шаблон, а не юридическая консультация. Перед публикацией обязательно проверьте документы у квалифицированного юриста — требования различаются по странам (GDPR в ЕС, законы о защите прав потребителей и т.д.).",
    businessName: "Название бизнеса", domain: "Домен сайта", contactEmail: "Email для связи", country: "Страна регистрации / применимое право",
    returnWindow: "Срок возврата (дней)", processingDays: "Срок обработки заказа (дней)",
    privacy: "Политика конфиденциальности", terms: "Условия использования", refund: "Политика возврата",
    copy: "Копировать", copied: "Скопировано",
  },
  en: {
    eyebrow: "Legal documents", title: "Store Policy Generator",
    sub: "Fill in the form to get draft Privacy Policy, Terms of Service, and Refund Policy documents for your store.",
    disclaimer: "This is a starting template, not legal advice. Review the documents with a qualified lawyer before publishing — requirements vary by country (GDPR in the EU, local consumer-protection laws, etc.).",
    businessName: "Business name", domain: "Store domain", contactEmail: "Contact email", country: "Country of registration / governing law",
    returnWindow: "Return window (days)", processingDays: "Order processing time (days)",
    privacy: "Privacy Policy", terms: "Terms of Service", refund: "Refund Policy",
    copy: "Copy", copied: "Copied",
  },
};

function CopyButton({ text, copyLabel, copiedLabel }: { text: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // clipboard API unavailable — no-op, user can still select text manually
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:border-brand-400 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? copiedLabel : copyLabel}
    </button>
  );
}

export function PolicyGenerator() {
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const [inputs, setInputs] = useState<PolicyInputs>({
    businessName: "", domain: "", contactEmail: "", country: "",
    returnWindowDays: 30, processingDays: 2,
  });

  function set<K extends keyof PolicyInputs>(key: K, value: PolicyInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  const privacy = generatePrivacyPolicy(inputs, lang);
  const terms = generateTermsOfService(inputs, lang);
  const refund = generateRefundPolicy(inputs, lang);

  return (
    <div className="py-14">
      <Container className="max-w-2xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>
      </Container>

      <Container className="mt-6 max-w-3xl">
        <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{tx.disclaimer}</p>
        </div>
      </Container>

      <Container className="mt-6 max-w-3xl">
        <Card>
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.businessName}</span>
              <input value={inputs.businessName} onChange={(e) => set("businessName", e.target.value)} className="mt-1.5 w-full rounded-lg border-[1.5px] border-ink-950 bg-[#fffdf8] px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.domain}</span>
              <input value={inputs.domain} onChange={(e) => set("domain", e.target.value)} placeholder="mystore.com" className="mt-1.5 w-full rounded-lg border-[1.5px] border-ink-950 bg-[#fffdf8] px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.contactEmail}</span>
              <input value={inputs.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="support@mystore.com" className="mt-1.5 w-full rounded-lg border-[1.5px] border-ink-950 bg-[#fffdf8] px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.country}</span>
              <input value={inputs.country} onChange={(e) => set("country", e.target.value)} className="mt-1.5 w-full rounded-lg border-[1.5px] border-ink-950 bg-[#fffdf8] px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.returnWindow}</span>
              <input type="number" value={inputs.returnWindowDays} onChange={(e) => set("returnWindowDays", Number(e.target.value) || 0)} className="mt-1.5 w-full rounded-lg border-[1.5px] border-ink-950 bg-[#fffdf8] px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.processingDays}</span>
              <input type="number" value={inputs.processingDays} onChange={(e) => set("processingDays", Number(e.target.value) || 0)} className="mt-1.5 w-full rounded-lg border-[1.5px] border-ink-950 bg-[#fffdf8] px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
          </form>
        </Card>

        <div className="mt-6 space-y-6">
          <PolicyCard title={tx.privacy} text={privacy} tx={tx} />
          <PolicyCard title={tx.terms} text={terms} tx={tx} />
          <PolicyCard title={tx.refund} text={refund} tx={tx} />
        </div>
      </Container>
    </div>
  );
}

function PolicyCard({ title, text, tx }: { title: string; text: string; tx: { copy: string; copied: string } }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Scale size={16} /> {title}</h3>
        <CopyButton text={text} copyLabel={tx.copy} copiedLabel={tx.copied} />
      </div>
      <pre className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-ink-50 p-4 font-sans text-xs leading-relaxed text-ink-600 dark:bg-ink-950/50 dark:text-ink-300">{text}</pre>
    </Card>
  );
}
