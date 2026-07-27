import { LinkButton, Container } from "../components/ui";

export function NotFound() {
  return (
    <Container className="flex flex-col items-center py-32 text-center">
      <p className="text-sm font-bold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-950 dark:text-white">Страница не найдена</h1>
      <p className="mt-2 text-ink-500 dark:text-ink-400">Страницы, которую вы ищете, не существует.</p>
      <LinkButton href="/" className="mt-6">На главную</LinkButton>
    </Container>
  );
}
