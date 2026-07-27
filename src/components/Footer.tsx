import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-ink-950 dark:text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white">
                <Sparkles size={16} />
              </span>
              Shopyfy
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-500 dark:text-ink-400">
              Paste a product link, get a full Shopify store — plus the trend research, pricing math, and ad angles to actually sell it.
            </p>
          </div>

          <FooterCol
            title="Build"
            links={[
              { label: "AI Store Builder", to: "/store-builder" },
              { label: "Pricing", to: "/#pricing" },
              { label: "FAQ", to: "/#faq" },
            ]}
          />
          <FooterCol
            title="Research"
            links={[
              { label: "Trend Research", to: "/trends" },
              { label: "Profit Calculator", to: "/tools/profit-calculator" },
              { label: "Ad Copy Generator", to: "/tools/ad-copy" },
              { label: "Saved Products", to: "/saved" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", to: "/#how-it-works" },
              { label: "Contact", to: "mailto:hello@shopyfy.app" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-200 pt-6 text-xs text-ink-400 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shopyfy. Product-research prototype — trend scores are illustrative; verify via the linked sources.</p>
          <p>Not affiliated with Shopify Inc.</p>
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
