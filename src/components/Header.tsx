import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { Container, LinkButton } from "./ui";

const NAV = [
  { to: "/store-builder", label: "Конструктор магазина" },
  { to: "/trends", label: "Поиск трендов" },
  { to: "/tools/profit-calculator", label: "Калькулятор маржи" },
  { to: "/tools/ad-copy", label: "Тексты для рекламы" },
  { to: "/saved", label: "Сохранённое" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/80 backdrop-blur-lg dark:border-ink-800 dark:bg-ink-950/80">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-ink-950 dark:text-white" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white">
            <Sparkles size={16} />
          </span>
          Shopyfy
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-950 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <a href="/#pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:text-ink-950 dark:text-ink-300 dark:hover:text-white">
            Тарифы
          </a>
          <LinkButton href="/store-builder" className="!py-2.5">
            Попробовать бесплатно
          </LinkButton>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-lg p-2 text-ink-700 dark:text-ink-200"
          onClick={() => setOpen((o) => !o)}
          aria-label="Открыть меню"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950">
          <Container className="flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300" : "text-ink-700 dark:text-ink-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a href="/#pricing" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 dark:text-ink-200" onClick={() => setOpen(false)}>
              Тарифы
            </a>
            <LinkButton href="/store-builder" className="mt-2 w-full">
              Попробовать бесплатно
            </LinkButton>
          </Container>
        </div>
      )}
    </header>
  );
}
