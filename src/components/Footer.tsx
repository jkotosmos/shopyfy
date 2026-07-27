import { Link } from "react-router-dom";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold text-ink-950 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-700 font-display text-base font-semibold text-brand-50">
                S
              </span>
              Shopyfy
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-500 dark:text-ink-400">
              Вставьте ссылку на товар — получите готовый магазин на Shopify, а заодно поиск трендов, расчёт цены и тексты для рекламы, чтобы реально продавать.
            </p>
          </div>

          <FooterCol
            title="Создать"
            links={[
              { label: "AI-конструктор магазина", to: "/store-builder" },
              { label: "Тарифы", to: "/#pricing" },
              { label: "Вопросы и ответы", to: "/#faq" },
            ]}
          />
          <FooterCol
            title="Исследование"
            links={[
              { label: "Поиск трендов", to: "/trends" },
              { label: "SEO-анализ сайта", to: "/tools/site-analyzer" },
              { label: "Калькулятор маржи", to: "/tools/profit-calculator" },
              { label: "Генератор текстов для рекламы", to: "/tools/ad-copy" },
              { label: "Сохранённые товары", to: "/saved" },
            ]}
          />
          <FooterCol
            title="Компания"
            links={[
              { label: "О сервисе", to: "/#how-it-works" },
              { label: "Контакты", to: "mailto:hello@shopyfy.app" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-200 pt-6 text-xs text-ink-400 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shopyfy. Прототип для исследования товаров — баллы трендов иллюстративны, проверяйте по ссылкам на источники.</p>
          <p>Не аффилирован с Shopify Inc.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink-950 dark:text-white">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.to.startsWith("mailto:") || l.to.startsWith("http") ? (
              <a href={l.to} className="text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400">
                {l.label}
              </a>
            ) : (
              <Link to={l.to} className="text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400 dark:hover:text-brand-400">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
