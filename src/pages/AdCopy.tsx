import { useState } from "react";
import { Copy, Check, MessageSquareText, Hash } from "lucide-react";
import { Button, Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { generateAdAngles, generateHashtags, type AdAngle } from "../lib/adcopy";
import { NICHES } from "../lib/niches";

function CopyButton({ text }: { text: string }) {
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
      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Скопировано" : "Копировать"}
    </button>
  );
}

export function AdCopy() {
  const [productName, setProductName] = useState("Портативный вентилятор на шею");
  const [nicheId, setNicheId] = useState(NICHES[0].id);
  const niche = NICHES.find((n) => n.id === nicheId) ?? NICHES[0];
  const [benefit, setBenefit] = useState(niche.benefit);
  const [angles, setAngles] = useState<AdAngle[] | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setAngles(generateAdAngles(productName || "этот товар", benefit || niche.benefit));
    setHashtags(generateHashtags(productName || "товар", niche.label));
  }

  return (
    <div className="py-14">
      <Container className="max-w-2xl text-center">
        <Eyebrow>Инструмент для рекламы</Eyebrow>
        <SectionTitle>Генератор рекламных текстов и хуков</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">
          Пять проверенных рекламных ракурсов для TikTok и Instagram — хук, текст и призыв к действию — плюс стартовый набор хэштегов под вашу нишу.
        </p>
      </Container>

      <Container className="mt-10 max-w-3xl">
        <Card>
          <form onSubmit={handleGenerate} className="grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">Название товара</span>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">Ниша</span>
              <select
                value={nicheId}
                onChange={(e) => {
                  setNicheId(e.target.value);
                  const n = NICHES.find((x) => x.id === e.target.value);
                  if (n) setBenefit(n.benefit);
                }}
                className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
              >
                {NICHES.map((n) => <option key={n.id} value={n.id}>{n.emoji} {n.label}</option>)}
              </select>
            </label>
            <label className="block sm:col-span-1">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300">Ключевая польза</span>
              <input
                value={benefit}
                onChange={(e) => setBenefit(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-white"
              />
            </label>
            <div className="sm:col-span-3">
              <Button type="submit" className="w-full sm:w-auto">
                <MessageSquareText size={16} /> Сгенерировать ракурсы
              </Button>
            </div>
          </form>
        </Card>

        {angles && (
          <div className="mt-8 animate-fade-up">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-ink-950 dark:text-white"><Hash size={16} /> Рекомендованные хэштеги</h3>
              <CopyButton text={hashtags.join(" ")} />
            </div>
            <div className="mb-8 flex flex-wrap gap-2">
              {hashtags.map((h) => (
                <span key={h} className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700 dark:bg-ink-800 dark:text-ink-200">{h}</span>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {angles.map((a) => (
                <Card key={a.angle}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">{a.angle}</span>
                    <CopyButton text={`${a.hook}\n\n${a.body}\n\n${a.cta}`} />
                  </div>
                  <p className="mt-3 font-semibold text-ink-950 dark:text-white">{a.hook}</p>
                  <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{a.body}</p>
                  <p className="mt-3 text-sm font-medium text-brand-600 dark:text-brand-400">{a.cta}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
