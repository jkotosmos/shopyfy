import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all px-5 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand-600 text-white shadow-md shadow-brand-900/15 hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-ink-950 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100",
    outline: "border border-ink-300 dark:border-ink-700 text-ink-800 dark:text-ink-100 hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-400",
    ghost: "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800",
    accent: "bg-accent-500 text-white shadow-md shadow-accent-700/20 hover:bg-accent-600 hover:-translate-y-0.5 active:translate-y-0",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  href,
}: {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
  href: string;
}) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all px-5 py-3 text-sm";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand-600 text-white shadow-md shadow-brand-900/15 hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-ink-950 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100",
    outline: "border border-ink-300 dark:border-ink-700 text-ink-800 dark:text-ink-100 hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-400",
    ghost: "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800",
    accent: "bg-accent-500 text-white shadow-md shadow-accent-700/20 hover:bg-accent-600 hover:-translate-y-0.5 active:translate-y-0",
  };
  return (
    <a href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-brand-300/60 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300 ${className}`}>
      {children}
    </span>
  );
}

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-ink-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(26,24,21,0.04)] dark:border-ink-800 dark:bg-ink-900/60 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent-600 dark:text-accent-400">{children}</p>;
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white ${className}`}>{children}</h2>;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-ink-200 bg-white p-6 shadow-2xl dark:border-ink-800 dark:bg-ink-900">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-ink-950 dark:text-white">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800" aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 text-sm text-ink-600 dark:text-ink-300">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-4xl font-semibold text-ink-950 dark:text-white">{value}</div>
      <div className="mt-1 text-sm text-ink-500 dark:text-ink-400">{label}</div>
    </div>
  );
}
