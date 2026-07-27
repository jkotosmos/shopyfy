import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Wand2, LayoutTemplate, FileText, PackagePlus, ShoppingCart, UploadCloud,
  Clock, DollarSign, TrendingUp, Calculator, MessageSquareText, Bookmark,
  ChevronDown, Check, Link2, BrainCircuit, Sparkles,
} from "lucide-react";
import { Badge, Button, Card, Container, Eyebrow, LinkButton, SectionTitle, Stat } from "../components/ui";

const STEPS = [
  { icon: Link2, title: "Вставьте ссылку на товар", body: "Ссылка на товар с AliExpress, Amazon, Alibaba или Shopify — или просто название товара." },
  { icon: BrainCircuit, title: "ИИ анализирует товар и рынок", body: "Разбираем карточку товара, определяем нишу, оцениваем себестоимость/маржу, спрос и конкуренцию." },
  { icon: Wand2, title: "Магазин собирается автоматически", body: "Главная страница, страницы товаров, коллекции, кастомные секции, тексты и допродажи — с нуля под этот товар." },
  { icon: UploadCloud, title: "Импорт и доработка", body: "Переносите в Shopify и меняйте что угодно — текст, изображения, цвета, структуру — без кода." },
];

const CORE_FEATURES = [
  { icon: Wand2, title: "AI-конструктор магазина", body: "Собирает полноценный магазин — не типовой шаблон — под конкретный товар, который вы указали." },
  { icon: LayoutTemplate, title: "AI-конструктор страниц", body: "Секции с текстами от ИИ, которые можно мгновенно менять местами без кода." },
  { icon: FileText, title: "Генератор страниц товара", body: "Конверсионные страницы товара с текстом на пользе, таблицами сравнения и блоками FAQ." },
  { icon: PackagePlus, title: "Комплект-допродажи (Bundle)", body: "Автоматические предложения «купи больше — сэкономь больше» под цену конкретного товара." },
  { icon: ShoppingCart, title: "Допродажи в корзине", body: "Сопутствующие товары в корзине для увеличения среднего чека." },
  { icon: UploadCloud, title: "Импорт в Shopify в один клик", body: "Переносите готовый магазин прямо в админку Shopify — там его можно полностью редактировать." },
];

const EXTRA_TOOLS = [
  { icon: TrendingUp, title: "Поиск трендовых товаров", body: "Подборка трендовых ниш плюс универсальный поиск по ключевому слову — каждое утверждение ведёт на Google Trends, TikTok, Meta Ad Library, Pinterest и другие источники, чтобы вы могли всё проверить сами.", to: "/trends", cta: "Смотреть тренды" },
  { icon: Calculator, title: "Калькулятор маржи", body: "Учитывает себестоимость у поставщика, доставку, комиссию платёжки и расходы на рекламу, чтобы показать реальную маржу — или цену, нужную для целевой маржи.", to: "/tools/profit-calculator", cta: "Посчитать" },
  { icon: MessageSquareText, title: "Генератор рекламных текстов", body: "Пять рекламных ракурсов (любопытство, срочность, соцдоказательство, до/после…) плюс готовые хэштеги для TikTok и Instagram.", to: "/tools/ad-copy", cta: "Сгенерировать текст" },
  { icon: Bookmark, title: "Вотчлист сохранённых товаров", body: "Сохраняйте товары, которые изучаете, с заметками — хранится локально в браузере, аккаунт не нужен.", to: "/saved", cta: "Открыть вотчлист" },
];

const DIFFERENTIATORS = [
  "Каждый магазин генерируется под конкретный товар, который вы указали, — а не переиспользует один и тот же шаблон для всех.",
  "ИИ проводит лёгкое маркетинговое исследование (ниша, сигнал спроса, конкуренция) прежде чем написать хоть слово текста.",
  "Всё сгенерированное остаётся полностью редактируемым: текст, изображения, цвета, структура и секции.",
  "Утверждения о трендах ведут прямо к источнику (Google Trends, TikTok, Meta Ads Library…), а не просят поверить чёрному ящику на слово.",
];

const FAQS = [
  { q: "Нужно ли уметь программировать?", a: "Нет. Магазин, страницы товаров и все инструменты Shopyfy собираются в визуальном редакторе без кода." },
  { q: "Какие ссылки на товары можно вставлять?", a: "Страницы товаров с AliExpress, Amazon и Alibaba, а также существующие ссылки на товары Shopify. Если ссылки пока нет, можно просто ввести название товара." },
  { q: "Данные о трендах в реальном времени?", a: "Подборка трендовых ниш — это иллюстративная отправная точка, явно помеченная как ориентировочная. Каждая карточка — и любое ваше ключевое слово — ведёт на реальный источник (Google Trends, TikTok, Meta Ad Library и т.д.), чтобы вы могли сами проверить актуальные цифры перед тем, как тратить деньги на рекламу." },
  { q: "Можно ли доработать сгенерированный магазин?", a: "Да — ничего не заблокировано. После генерации можно переписать текст, заменить изображения, поменять цвета и структуру, добавить или убрать секции." },
  { q: "Это заменяет найм дизайнера или разработчика?", a: "Для большинства стартовых магазинов — да: AI-конструктор магазина/страниц, блоки допродаж и генерация текстов закрывают то, для чего обычно нанимают небольшую команду." },
];

export function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/store-builder${url.trim() ? `?url=${encodeURIComponent(url.trim())}` : ""}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-500/10" />
        <Container className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="flex justify-center animate-fade-up">
            <Badge>
              <Sparkles size={13} /> AI-конструктор магазина для дропшипперов
            </Badge>
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white sm:text-6xl animate-fade-up" style={{ animationDelay: "80ms" }}>
            Превратите любую ссылку на товар в магазин, который <span className="text-brand-600 dark:text-brand-400">продаёт</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-600 dark:text-ink-300 animate-fade-up" style={{ animationDelay: "160ms" }}>
            Вставьте ссылку с AliExpress, Amazon, Alibaba или Shopify. ИИ Shopyfy соберёт главную страницу, страницы товаров, допродажи и тексты — а затем вы импортируете всё прямо в Shopify.
          </p>

          <form onSubmit={handleGenerate} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row animate-fade-up" style={{ animationDelay: "240ms" }}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Вставьте ссылку на товар (AliExpress, Amazon, Alibaba, Shopify)…"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-sm text-ink-900 shadow-sm outline-none placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            />
            <Button type="submit" className="whitespace-nowrap">
              Собрать мой магазин <ArrowRight size={16} />
            </Button>
          </form>
          <p className="mt-3 text-xs text-ink-400">Регистрация для демо не нужна. Занимает около 10 секунд.</p>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat value="10 000+" label="созданных магазинов" />
            <Stat value="15×" label="быстрее создание страниц" />
            <Stat value="40+ ч" label="экономии на магазин" />
            <Stat value="$1 000+" label="экономии на найме" />
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Как это работает</Eyebrow>
            <SectionTitle>От ссылки до готового магазина за четыре шага</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <s.icon size={20} />
                </div>
                <div className="mt-4 text-xs font-bold text-brand-600 dark:text-brand-400">ШАГ {i + 1}</div>
                <h3 className="mt-1 font-semibold text-ink-950 dark:text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Core features */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Основные функции</Eyebrow>
            <SectionTitle>Всё в одном приложении вместо пяти</SectionTitle>
            <p className="mt-3 text-ink-500 dark:text-ink-400">Тема, конструктор страниц и приложения для допродаж — заменены единым ИИ-процессом.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((f) => (
              <Card key={f.title} className="hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <f.icon size={19} />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Extra tools for dropshippers */}
      <section className="border-y border-ink-200 bg-gradient-to-b from-ink-50 to-white py-20 dark:border-ink-800 dark:from-ink-900/40 dark:to-ink-950">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Не только конструктор магазина</Eyebrow>
            <SectionTitle>Встроенное исследование рынка для дропшипперов</SectionTitle>
            <p className="mt-3 text-ink-500 dark:text-ink-400">Найдите, что в тренде, правильно посчитайте цену и напишите рекламу — ещё до того, как потратите хоть доллар.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {EXTRA_TOOLS.map((t) => (
              <Card key={t.title} className="flex flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
                  <t.icon size={19} />
                </div>
                <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{t.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-ink-500 dark:text-ink-400">{t.body}</p>
                <LinkButton href={t.to} variant="outline" className="mt-5 self-start">
                  {t.cta} <ArrowRight size={14} />
                </LinkButton>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits / ROI */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Почему это того стоит</Eyebrow>
            <SectionTitle>Время, деньги и конверсия — всё сразу</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            <BenefitCard icon={Clock} title="Экономия времени" body="Создавайте страницы товаров до 15× быстрее и экономьте 40+ часов по сравнению с ручной сборкой магазина." />
            <BenefitCard icon={TrendingUp} title="Рост конверсии" body="Секции и текстовые паттерны, основанные на том, что работает у успешных e-commerce брендов." />
            <BenefitCard icon={DollarSign} title="Сокращение расходов" body="Одно приложение заменяет несколько Shopify-приложений плюс услуги разработчика, дизайнера и копирайтера — часто это $100+/мес и $1 000+ на найме." />
          </div>
        </Container>
      </section>

      {/* Differentiators */}
      <section className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>Не очередной генератор шаблонов</Eyebrow>
              <SectionTitle>Построено вокруг вашего товара, а не переработанного макета</SectionTitle>
              <p className="mt-4 text-ink-500 dark:text-ink-400">
                Обычные AI-конструкторы сайтов переиспользуют одну и ту же горстку шаблонов для всех. Shopyfy сначала
                анализирует конкретный товар и проводит лёгкое исследование рынка, поэтому структура, тексты и
                предложения реально соответствуют тому, что вы продаёте.
              </p>
            </div>
            <ul className="space-y-4">
              {DIFFERENTIATORS.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400">
                    <Check size={14} />
                  </span>
                  <span className="text-sm text-ink-600 dark:text-ink-300">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Тарифы</Eyebrow>
            <SectionTitle>Начните бесплатно, обновитесь, когда начнёте продавать</SectionTitle>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <PricingCard
              name="Starter"
              price="$0"
              period="/мес"
              body="Попробуйте AI-конструктор магазина и все инструменты исследования."
              features={["1 сгенерированный магазин", "Инструмент поиска трендов", "Калькулятор маржи", "Генератор рекламных текстов"]}
            />
            <PricingCard
              name="Growth"
              price="$39"
              period="/мес"
              highlighted
              body="Для дропшипперов, активно запускающих магазины."
              features={["Неограниченное число магазинов", "Импорт в Shopify в один клик", "Конструктор bundle- и cart-допродаж", "Вотчлист сохранённых товаров", "Приоритетная поддержка"]}
            />
            <PricingCard
              name="Pro"
              price="$99"
              period="/мес"
              body="Для команд, ведущих несколько магазинов."
              features={["Всё из Growth", "Несколько мест в команде", "Массовая генерация страниц товаров", "Библиотека кастомных секций"]}
            />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-ink-200 bg-white py-20 dark:border-ink-800 dark:bg-ink-950">
        <Container className="max-w-3xl">
          <div className="text-center">
            <Eyebrow>Вопросы и ответы</Eyebrow>
            <SectionTitle>Отвечаем на частые вопросы</SectionTitle>
          </div>
          <div className="mt-10 divide-y divide-ink-200 dark:divide-ink-800">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <Container>
          <div className="rounded-3xl bg-ink-950 px-8 py-14 text-center dark:bg-ink-900">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Вставьте ссылку. Увидьте свой магазин за секунды.</h2>
            <p className="mx-auto mt-3 max-w-md text-ink-300">Без карты, без регистрации — демо работает полностью в вашем браузере.</p>
            <LinkButton href="/store-builder" className="mt-7">
              Собрать мой магазин <ArrowRight size={16} />
            </LinkButton>
          </div>
        </Container>
      </section>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, body }: { icon: typeof Clock; title: string; body: string }) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 font-semibold text-ink-950 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{body}</p>
    </Card>
  );
}

function PricingCard({
  name, price, period, body, features, highlighted,
}: { name: string; price: string; period: string; body: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`relative rounded-2xl border p-7 ${highlighted ? "border-brand-400 bg-ink-950 text-white shadow-xl shadow-brand-500/20" : "border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900/60"}`}>
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">Самый популярный</span>
      )}
      <h3 className={`font-semibold ${highlighted ? "text-white" : "text-ink-950 dark:text-white"}`}>{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={`text-4xl font-extrabold ${highlighted ? "text-white" : "text-ink-950 dark:text-white"}`}>{price}</span>
        <span className={highlighted ? "text-ink-400" : "text-ink-400"}>{period}</span>
      </div>
      <p className={`mt-2 text-sm ${highlighted ? "text-ink-300" : "text-ink-500 dark:text-ink-400"}`}>{body}</p>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2 text-sm ${highlighted ? "text-ink-200" : "text-ink-600 dark:text-ink-300"}`}>
            <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {f}
          </li>
        ))}
      </ul>
      <LinkButton href="/store-builder" variant={highlighted ? "primary" : "outline"} className="mt-7 w-full">
        Начать
      </LinkButton>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="font-medium text-ink-900 dark:text-white">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{a}</p>}
    </div>
  );
}
