import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, Megaphone, Search, Calculator, Wand2, Scale, MessageSquareText,
  Clapperboard, UploadCloud, Wallet, RotateCcw, Info, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Card, Container, Eyebrow, SectionTitle } from "../components/ui";
import { useLanguage, type Lang } from "../lib/i18n";

const PROGRESS_KEY = "shopyfy_launch_plan_progress_v1";

function getProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress(ids: Set<string>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(ids)));
}

interface Step {
  id: string;
  icon: typeof TrendingUp;
  title: string;
  body: string;
  to: string;
  cta: string;
}

const STEPS: Record<Lang, Step[]> = {
  ru: [
    { id: "research", icon: TrendingUp, title: "Найдите трендовый товар", body: "Просмотрите стартовый список ниш или найдите свой товар — каждая карточка ведёт на реальные источники (Google Trends, TikTok, Meta Ad Library и т.д.).", to: "/trends", cta: "Открыть поиск трендов" },
    { id: "adlibrary", icon: Megaphone, title: "Изучите рекламу конкурентов", body: "На той же странице раскройте карточку ниши — увидите примеры объявлений в стиле Meta Ad Library и ссылку на настоящую библиотеку рекламы для проверки.", to: "/trends", cta: "Смотреть примеры рекламы" },
    { id: "competitors", icon: Search, title: "Проверьте сайт конкурента", body: "Введите домен конкурента или потенциального поставщика — получите отчёт по трафику, ключевым словам, бэклинкам и технологиям.", to: "/tools/site-analyzer", cta: "Проанализировать конкурента" },
    { id: "economics", icon: Calculator, title: "Посчитайте юнит-экономику", body: "Учтите себестоимость, доставку, комиссию платёжки и расходы на рекламу — узнайте реальную маржу и цену безубыточности.", to: "/tools/profit-calculator", cta: "Открыть калькулятор маржи" },
    { id: "store", icon: Wand2, title: "Соберите магазин с ИИ", body: "Вставьте ссылку на товар — получите главную страницу, страницы товара, коллекции и структуру магазина за секунды.", to: "/store-builder", cta: "Собрать магазин" },
    { id: "policies", icon: Scale, title: "Оформите юридические страницы", body: "Сгенерируйте черновики Политики конфиденциальности, Условий использования и Политики возврата под ваш магазин.", to: "/tools/policy-generator", cta: "Сгенерировать политики" },
    { id: "adcopy", icon: MessageSquareText, title: "Напишите тексты для рекламы", body: "Пять рекламных ракурсов с хуком, текстом и призывом к действию, плюс хэштеги под вашу нишу.", to: "/tools/ad-copy", cta: "Сгенерировать тексты" },
    { id: "video", icon: Clapperboard, title: "Снимите UGC-видео для рекламы", body: "Готовые сценарии для TikTok/Reels — хук, покадровая раскадровка, призыв к действию. Снимайте на телефон.", to: "/tools/video-script", cta: "Сгенерировать сценарий" },
    { id: "publish", icon: UploadCloud, title: "Опубликуйте магазин в Shopify", body: "Подключите магазин Shopify через OAuth и опубликуйте товар как черновик прямо из конструктора магазина.", to: "/store-builder", cta: "Перейти к публикации" },
    { id: "budget", icon: Wallet, title: "Рассчитайте тестовый бюджет", body: "Узнайте точку безубыточности и рекомендованный бюджет теста, прежде чем запускать рекламу.", to: "/tools/ad-budget", cta: "Открыть калькулятор бюджета" },
    { id: "scale", icon: RotateCcw, title: "Запустите тест и решите: убить или масштабировать", body: "Введите фактические расходы и продажи в тот же калькулятор — получите чёткий вердикт по итогам теста.", to: "/tools/ad-budget", cta: "Оценить результаты теста" },
  ],
  en: [
    { id: "research", icon: TrendingUp, title: "Find a trending product", body: "Browse the starter niche list or search your own product — every card links to real sources (Google Trends, TikTok, Meta Ad Library, etc.).", to: "/trends", cta: "Open trend research" },
    { id: "adlibrary", icon: Megaphone, title: "Study competitor ads", body: "On the same page, expand a niche card to see Meta-Ad-Library-style ad examples and a link to the real ad library to verify what's running.", to: "/trends", cta: "See ad examples" },
    { id: "competitors", icon: Search, title: "Check out a competitor's site", body: "Enter a competitor's or supplier's domain to get a traffic, keyword, backlink, and tech-stack report.", to: "/tools/site-analyzer", cta: "Analyze a competitor" },
    { id: "economics", icon: Calculator, title: "Calculate unit economics", body: "Factor in cost, shipping, payment fees, and ad spend to find your real margin and break-even price.", to: "/tools/profit-calculator", cta: "Open margin calculator" },
    { id: "store", icon: Wand2, title: "Build the store with AI", body: "Paste a product link to get a homepage, product page, collections, and store structure in seconds.", to: "/store-builder", cta: "Build my store" },
    { id: "policies", icon: Scale, title: "Draft your legal pages", body: "Generate draft Privacy Policy, Terms of Service, and Refund Policy documents for your store.", to: "/tools/policy-generator", cta: "Generate policies" },
    { id: "adcopy", icon: MessageSquareText, title: "Write ad copy", body: "Five ad angles with a hook, body, and CTA, plus ready-made hashtags for your niche.", to: "/tools/ad-copy", cta: "Generate ad copy" },
    { id: "video", icon: Clapperboard, title: "Film a UGC video ad", body: "Ready-made TikTok/Reels scripts — hook, shot-by-shot breakdown, closing CTA. Filmable on a phone.", to: "/tools/video-script", cta: "Generate a script" },
    { id: "publish", icon: UploadCloud, title: "Publish the store to Shopify", body: "Connect your Shopify store via OAuth and publish the product as a draft right from the store builder.", to: "/store-builder", cta: "Go publish" },
    { id: "budget", icon: Wallet, title: "Calculate your test budget", body: "Find your break-even cost-per-sale and recommended test budget before you launch ads.", to: "/tools/ad-budget", cta: "Open budget calculator" },
    { id: "scale", icon: RotateCcw, title: "Launch the test, then kill or scale", body: "Plug your actual spend and sales into the same calculator to get a clear verdict once the test has run.", to: "/tools/ad-budget", cta: "Evaluate test results" },
  ],
};

const TEXT: Record<Lang, { eyebrow: string; title: string; sub: string; note: string; progress: string; reset: string }> = {
  ru: {
    eyebrow: "Пошаговый план",
    title: "От поиска товара до масштабирования рекламы",
    sub: "Стандартная последовательность запуска дропшиппинг-магазина, которую используют большинство пошаговых видео-руководств: исследование → сборка магазина → реклама → тест → масштабирование. Отмечайте шаги по мере прохождения — прогресс сохраняется в этом браузере.",
    note: "Мы не смогли открыть присланное видео на YouTube (запрос был заблокирован), поэтому этот план не привязан именно к нему — но покрывает ту же общепринятую методику теми же шагами. Пришлите текст шагов из видео — и мы подстроим план точнее под него.",
    progress: "Пройдено шагов", reset: "Сбросить прогресс",
  },
  en: {
    eyebrow: "Step-by-step plan",
    title: "From product research to scaling ads",
    sub: "The standard dropshipping launch sequence most step-by-step video guides teach: research → build → advertise → test → scale. Check off steps as you go — progress is saved in this browser.",
    note: "We couldn't open the YouTube video you linked (the request was blocked), so this plan isn't built from that specific video — but it covers the same widely-taught methodology, step for step. Send over the steps from the video's text/description and we'll tailor this plan to match it more closely.",
    progress: "Steps completed", reset: "Reset progress",
  },
};

export function LaunchPlan() {
  const { lang } = useLanguage();
  const tx = TEXT[lang];
  const steps = STEPS[lang];
  const [done, setDone] = useState<Set<string>>(() => getProgress());

  useEffect(() => {
    saveProgress(done);
  }, [done]);

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pct = Math.round((done.size / steps.length) * 100);

  return (
    <div className="py-14">
      <Container className="max-w-3xl text-center">
        <Eyebrow>{tx.eyebrow}</Eyebrow>
        <SectionTitle>{tx.title}</SectionTitle>
        <p className="mt-3 text-ink-500 dark:text-ink-400">{tx.sub}</p>
      </Container>

      <Container className="mt-6 max-w-3xl">
        <div className="flex gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4 text-sm text-ink-600 dark:border-ink-700 dark:bg-ink-900/60 dark:text-ink-300">
          <Info size={18} className="mt-0.5 shrink-0 text-ink-400" />
          <p>{tx.note}</p>
        </div>
      </Container>

      <Container className="mt-8 max-w-3xl">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-700 dark:text-ink-300">{tx.progress}: {done.size}/{steps.length}</span>
          {done.size > 0 && (
            <button type="button" onClick={() => setDone(new Set())} className="text-ink-400 hover:text-red-500">{tx.reset}</button>
          )}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Container>

      <Container className="mt-8 max-w-3xl space-y-3">
        {steps.map((s, i) => {
          const isDone = done.has(s.id);
          return (
            <Card key={s.id} className={`flex items-start gap-4 transition-colors ${isDone ? "border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20" : ""}`}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone ? "border-ink-950 bg-brand-400 text-ink-950" : "border-ink-300 text-transparent hover:border-brand-400 dark:border-ink-600"
                }`}
                aria-label="toggle"
              >
                <CheckCircle2 size={16} />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ink-100 text-xs font-bold text-ink-500 dark:bg-ink-800 dark:text-ink-400">{i + 1}</span>
                  <s.icon size={16} className="text-brand-500" />
                  <h3 className={`font-semibold ${isDone ? "text-ink-500 line-through dark:text-ink-500" : "text-ink-950 dark:text-white"}`}>{s.title}</h3>
                </div>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{s.body}</p>
                <Link to={s.to} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {s.cta} <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          );
        })}
      </Container>
    </div>
  );
}
