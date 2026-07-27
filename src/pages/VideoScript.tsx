import { useState } from "react";
import { Copy, Check, Clapperboard, Clock } from "lucide-react";
import { Button, Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { generateVideoScripts, type VideoScript } from "../lib/videoScript";
import { NICHES, nicheBenefit, nicheLabel } from "../lib/niches";
import { useLanguage, type Lang } from "../lib/i18n";

const TEXT: Record<Lang, {
  eyebrow: string; title: string; sub: string;
  productName: string; niche: string; keyBenefit: string; generate: string;
  copy: string; copied: string; hook: string; cta: string; scene: string; defaultProduct: string;
}> = {
  ru: {
    eyebrow: "Инструмент для видео-рекламы", title: "Генератор сценариев для TikTok/Reels",
    sub: "Три ракурса для UGC-видео — хук, покадровый сценарий с текстом на экране и озвучкой, финальный призыв к действию. Готово для съёмки на телефон.",
    productName: "Название товара", niche: "Ниша", keyBenefit: "Ключевая польза", generate: "Сгенерировать сценарии",
    copy: "Копировать", copied: "Скопировано", hook: "Хук (0–3 сек)", cta: "Призыв к действию", scene: "Сцена",
    defaultProduct: "Портативный вентилятор на шею",
  },
  en: {
    eyebrow: "Video ad tool", title: "TikTok/Reels Script Generator",
    sub: "Three UGC video angles — hook, shot-by-shot script with on-screen text and voiceover, and a closing CTA. Ready to film on a phone.",
    productName: "Product name", niche: "Niche", keyBenefit: "Key benefit", generate: "Generate scripts",
    copy: "Copy", copied: "Copied", hook: "Hook (0–3 sec)", cta: "Call to action", scene: "Scene",
    defaultProduct: "Portable Neck Fan",
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

function scriptToText(s: VideoScript, tx: { hook: string; cta: string; scene: string }): string {
  const scenes = s.scenes.map((sc, i) => `${tx.scene} ${i + 1}: ${sc.shot}\n  On-screen: "${sc.onScreenText}"\n  VO: ${sc.voiceover}`).join("\n\n");
  return `${s.angle} (${s.length})\n\n${tx.hook}\nOn-screen: "${s.hookText}"\nVO: ${s.hookVoiceover}\n\n${scenes}\n\n${tx.cta}: ${s.cta}`;
}

export function VideoScriptPage() {
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const [productName, setProductName] = useState(tx.defaultProduct);
  const [nicheId, setNicheId] = useState(NICHES[0].id);
  const niche = NICHES.find((n) => n.id === nicheId) ?? NICHES[0];
  const [benefit, setBenefit] = useState(nicheBenefit(niche, lang));
  const [scripts, setScripts] = useState<VideoScript[] | null>(null);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const fallbackProduct = lang === "en" ? "this product" : "этот товар";
    setScripts(generateVideoScripts(productName || fallbackProduct, benefit || nicheBenefit(niche, lang), lang));
  }

  return (
    <div className="py-14">
      <Container className="max-w-2xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>
      </Container>

      <Container className="mt-10 max-w-3xl">
        <Card>
          <form onSubmit={handleGenerate} className="grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.productName}</span>
              <input value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.niche}</span>
              <select
                value={nicheId}
                onChange={(e) => {
                  setNicheId(e.target.value);
                  const n = NICHES.find((x) => x.id === e.target.value);
                  if (n) setBenefit(nicheBenefit(n, lang));
                }}
                className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
              >
                {NICHES.map((n) => <option key={n.id} value={n.id}>{n.emoji} {nicheLabel(n, lang)}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-1">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{tx.keyBenefit}</span>
              <input value={benefit} onChange={(e) => setBenefit(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white" />
            </label>
            <div className="sm:col-span-3">
              <Button type="submit" className="w-full sm:w-auto">
                <Clapperboard size={16} /> {tx.generate}
              </Button>
            </div>
          </form>
        </Card>

        {scripts && (
          <div className="mt-8 grid gap-5 animate-fade-up">
            {scripts.map((s) => (
              <Card key={s.angle}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">{s.angle}</span>
                    <span className="flex items-center gap-1 text-xs text-ink-400"><Clock size={12} /> {s.length}</span>
                  </div>
                  <CopyButton text={scriptToText(s, tx)} copyLabel={tx.copy} copiedLabel={tx.copied} />
                </div>

                <div className="mt-4 rounded-xl border border-dashed border-brand-300 bg-brand-50 p-3 dark:border-brand-800 dark:bg-brand-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">{tx.hook}</p>
                  <p className="mt-1 text-sm font-medium text-ink-900 dark:text-white">"{s.hookText}"</p>
                  <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{s.hookVoiceover}</p>
                </div>

                <div className="mt-3 space-y-2.5">
                  {s.scenes.map((sc, i) => (
                    <div key={i} className="rounded-lg border border-ink-200 p-3 text-sm dark:border-ink-700">
                      <p className="font-medium text-ink-900 dark:text-white">{tx.scene} {i + 1}: {sc.shot}</p>
                      <p className="mt-1 text-ink-500 dark:text-ink-400">On-screen: "{sc.onScreenText}"</p>
                      <p className="text-ink-500 dark:text-ink-400">VO: {sc.voiceover}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-400">{tx.cta}: {s.cta}</p>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
