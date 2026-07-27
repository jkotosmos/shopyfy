import { LinkButton, Container } from "../components/ui";

export function NotFound() {
  return (
    <Container className="flex flex-col items-center py-32 text-center">
      <p className="text-sm font-bold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-2 text-3xl font-bold text-ink-950 dark:text-white">Page not found</h1>
      <p className="mt-2 text-ink-500 dark:text-ink-400">The page you're looking for doesn't exist.</p>
      <LinkButton href="/" className="mt-6">Back to home</LinkButton>
    </Container>
  );
}
