import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all px-5 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-ink-900 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100",
    outline: "border border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-100 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400",
    ghost: "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800",
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
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all px-5 py-3 text-sm";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-ink-900 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100",
    outline: "border border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-100 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400",
    ghost: "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800",
  };
  return (
    <a href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-brand-300/50 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300 ${className}`}>
      {children}
    </span>
  );
}

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm dark:border-ink-800 dark:bg-ink-900/60 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">{children}</p>;
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight text-ink-950 dark:text-white ${className}`}>{children}</h2>;
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
      <div className="text-3xl sm:text-4xl font-extrabold text-ink-950 dark:text-white">{value}</div>
      <div className="mt-1 text-sm text-ink-500 dark:text-ink-400">{label}</div>
    </div>
  );
}
