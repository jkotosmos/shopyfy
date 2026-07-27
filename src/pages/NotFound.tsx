import { LinkButton, Container } from "../components/ui";
import { useLanguage, type Lang } from "../lib/i18n";

const TEXT: Record<Lang, { title: string; body: string; cta: string }> = {
  ru: { title: "Страница не найдена", body: "Страницы, которую вы ищете, не существует.", cta: "На главную" },
  en: { title: "Page not found", body: "The page you're looking for doesn't exist.", cta: "Go home" },
};

export function NotFound() {
  const { lang } = useLanguage();
  const t = TEXT[lang];
  return (
    <Container className="flex flex-col items-center py-32 text-center">
      <p className="text-sm font-bold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950 dark:text-white">{t.title}</h1>
      <p className="mt-2 text-ink-500 dark:text-ink-400">{t.body}</p>
      <LinkButton href="/" className="mt-6">{t.cta}</LinkButton>
    </Container>
  );
}
