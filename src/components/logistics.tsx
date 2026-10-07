import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Scissors } from "lucide-react";
import { hashString, makeRng } from "../lib/seed";

/* Isometric parcel — the brand mark. Orange box, kraft tape along the seam. */
export function ParcelMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M16 2.6 29 9.6 16 16.6 3 9.6Z" fill="var(--color-brand-400)" stroke="var(--color-ink-950)" strokeWidth="1.7" />
        <path d="M3 9.6 16 16.6V30L3 23Z" fill="var(--color-brand-600)" stroke="var(--color-ink-950)" strokeWidth="1.7" />
        <path d="M29 9.6 16 16.6V30L29 23Z" fill="var(--color-brand-500)" stroke="var(--color-ink-950)" strokeWidth="1.7" />
        <path d="M9.5 6.1 22.5 13.1V26.5" fill="none" stroke="var(--color-kraft-200)" strokeWidth="3.4" strokeLinecap="butt" />
        <path d="M9.5 6.1 22.5 13.1V26.5" fill="none" stroke="var(--color-ink-950)" strokeWidth="0.6" strokeDasharray="1.2 1.6" opacity="0.5" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-display font-bold tracking-[-0.02em] ${className}`}>shopyfy</span>;
}

/* ───────────── Rubber stamp ───────────── */

export type StampTone = "real" | "demo" | "estimate" | "ink";

export function Stamp({
  tone = "real",
  size = "sm",
  rotate,
  animate = false,
  className = "",
  children,
}: {
  tone?: StampTone;
  size?: "sm" | "lg" | "xl";
  rotate?: number;
  animate?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const sizeClass = size === "lg" ? "stamp--lg" : size === "xl" ? "stamp--xl" : "";
  const style = rotate === undefined ? undefined : ({ "--stamp-rot": `${rotate}deg` } as CSSProperties);
  return (
    <span className={`stamp stamp--${tone} ${sizeClass} ${animate ? "stamp-thunk" : ""} ${className}`} style={style}>
      {children}
    </span>
  );
}

/* ───────────── Barcode & tracking numbers ───────────── */

// Decorative, deterministic Code-128-looking bars: same value → same bars,
// so a barcode visibly "reprints" as the thing it labels changes.
export function Barcode({ value, className = "h-12 w-full", modules = 110 }: { value: string; className?: string; modules?: number }) {
  const { bars, total } = useMemo(() => {
    const rng = makeRng(`barcode|${value}`);
    const out: { x: number; w: number }[] = [];
    let x = 0;
    const bar = (w: number) => {
      out.push({ x, w });
      x += w;
    };
    const gap = (w: number) => {
      x += w;
    };
    bar(2); gap(1); bar(1); gap(1);
    while (x < modules - 7) {
      bar(1 + Math.floor(rng() * 3));
      gap(1 + Math.floor(rng() * 2.6));
    }
    gap(1); bar(1); gap(1); bar(2);
    return { bars: out, total: x };
  }, [value, modules]);

  return (
    <svg viewBox={`0 0 ${total} 10`} preserveAspectRatio="none" shapeRendering="crispEdges" className={className} aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={10} fill="currentColor" />
      ))}
    </svg>
  );
}

export function trackingNumber(seed: string): string {
  const digits = String(hashString(`track|${seed || "shopyfy"}`) % 1_000_000_000).padStart(9, "0");
  return `SY ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)} RU`;
}

/* ───────────── Conveyor ticker ───────────── */

export function Ticker({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-5">{item}</span>
          <span className="text-brand-400" aria-hidden="true">■</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <span className="sr-only">{items.join(". ")}</span>
      <div className="marquee-track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ───────────── Tape & tear lines ───────────── */

export function Tape({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`tape ${className}`} style={style} aria-hidden="true" />;
}

export function Perforation({ notched = false, scissors = false, className = "" }: { notched?: boolean; scissors?: boolean; className?: string }) {
  return (
    <div className={`perf ${notched ? "perf--notched" : ""} ${className}`} role="separator">
      {scissors && (
        <Scissors
          size={15}
          className="surface-label absolute -top-[9px] left-7 -scale-x-100 px-0.5 text-ink-400"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/* ───────────── Split-flap departures board ───────────── */

const FLAP_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789";

export function SplitFlap({ words, length, interval = 2600, className = "" }: { words: string[]; length: number; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  const target = (words[index] ?? "").toUpperCase().padEnd(length, " ").slice(0, length);
  const [shown, setShown] = useState(target);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      setShown(
        target
          .split("")
          .map((ch, i) => (tick >= 2 + i ? ch : FLAP_GLYPHS[Math.floor(Math.random() * FLAP_GLYPHS.length)]))
          .join(""),
      );
      if (tick >= 2 + length) window.clearInterval(id);
    }, 48);
    return () => window.clearInterval(id);
  }, [target, length]);

  useEffect(() => {
    if (words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`inline-flex ${className}`}>
      <span className="sr-only">{words[index]}</span>
      {shown.split("").map((ch, i) => (
        <span key={i} className="flap" aria-hidden="true">
          <span key={ch}>{ch === " " ? " " : ch}</span>
        </span>
      ))}
    </span>
  );
}

/* ───────────── Package handling marks (ISO 780-style) ───────────── */

export function HandlingMarks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square">
        <rect x="2" y="2" width="36" height="36" strokeWidth="2" />
        <path d="M13 31V11M8 16l5-6 5 6M27 31V11M22 16l5-6 5 6M8 33h24" />
      </svg>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
        <rect x="2" y="2" width="36" height="36" strokeWidth="2" />
        <path d="M13 8h14c0 9-2.5 13-7 13s-7-4-7-13ZM20 21v9M14 31h12" />
      </svg>
      <svg viewBox="0 0 40 40" className="h-full w-auto" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
        <rect x="2" y="2" width="36" height="36" strokeWidth="2" />
        <path d="M9 22a11 11 0 0 1 22 0ZM20 22v7a2.5 2.5 0 0 1-5 0M12 6l-1.5 3M20 4.5v3M28 6l1.5 3" />
      </svg>
    </div>
  );
}

/* ───────────── Scroll reveal ───────────── */

// Flips to true once the element scrolls into view (used to "thunk" stamps
// down when you reach them instead of all at once on page load).
export function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
}

/* Hand-signed scribble for forms */
export function Signature({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" aria-hidden="true">
      <path
        d="M3 31c6-14 13-24 17-22 5 3-7 23-3 24 5 1 9-17 14-17 4 0 0 15 4 15s7-14 12-14c4 0-1 13 3 13 5 0 8-20 14-20 5 0 0 21 5 20 6-1 9-14 14-14 4 0 2 9 6 9 5 0 11-8 23-10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 37c25-3 60-4 100-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
