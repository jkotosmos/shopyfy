import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "accent";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 text-center sm:whitespace-nowrap rounded-md px-5 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-50";

// Hard-edged, ink-bordered buttons with a printed offset shadow that
// "presses" flat when clicked — like a rubber key, not a glossy pill.
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "press border-2 border-ink-950 bg-brand-400 text-ink-950 hover:bg-brand-300 dark:border-brand-400",
  secondary: "press border-2 border-ink-950 bg-ink-950 text-[#fffdf8] hover:bg-ink-800 dark:border-ink-100 dark:bg-ink-100 dark:text-ink-950 dark:hover:bg-white",
  outline:
    "border-2 border-ink-950 bg-transparent text-ink-950 transition-colors hover:bg-ink-950 hover:text-[#fffdf8] dark:border-ink-300 dark:text-ink-100 dark:hover:bg-ink-100 dark:hover:text-ink-950",
  ghost: "text-ink-700 transition-colors hover:bg-ink-950/5 dark:text-ink-200 dark:hover:bg-white/5",
  accent: "press border-2 border-ink-950 bg-accent-600 text-white hover:bg-accent-500 dark:border-accent-300",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode }) {
  return (
    <button className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`} {...rest}>
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
  const cls = `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`;
  // In-app routes go through the router (no full page reload); hash links
  // and anything external stay plain anchors so the browser handles them.
  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link to={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}

// A printed price-tag sticker rather than a soft pill.
export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border-[1.5px] border-ink-950 bg-brand-400 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink-950 dark:border-brand-400 ${className}`}
    >
      {children}
    </span>
  );
}

// Every card is a label stuck on the page: label stock, ink border, die-cut corners.
export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`surface-label rounded-2xl border-[1.5px] border-ink-950 p-6 dark:border-ink-700 ${className}`} {...rest}>
      {children}
    </div>
  );
}

// Section eyebrow = an embossed Dymo label-maker strip.
export function Eyebrow({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "paper" }) {
  return (
    <p className="mb-5">
      <span className={`dymo ${tone === "paper" ? "dymo--paper" : ""}`}>{children}</span>
    </p>
  );
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`font-display text-[26px] font-bold leading-[1.12] tracking-[-0.025em] text-ink-950 sm:text-[38px] dark:text-[#f6f1e7] ${className}`}>
      {children}
    </h2>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/65" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="surface-label animate-stick relative w-full max-w-md rounded-2xl border-2 border-ink-950 shadow-[8px_8px_0_0_var(--color-ink-950)] dark:border-ink-600 dark:shadow-[8px_8px_0_0_#000]"
        style={{ "--stick-rot": "-0.6deg" } as CSSProperties}
      >
        <div className="flex items-center justify-between border-b-2 border-ink-950 px-5 py-3 dark:border-ink-600">
          <h3 className="font-display text-base font-bold text-ink-950 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border-[1.5px] border-transparent p-1 text-ink-500 hover:border-ink-950 hover:text-ink-950 dark:hover:border-ink-300 dark:hover:text-white"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-ink-600 dark:text-ink-300">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold tracking-[-0.02em] text-ink-950 sm:text-3xl dark:text-white">{value}</div>
      <div className="caption mt-1.5">{label}</div>
    </div>
  );
}
