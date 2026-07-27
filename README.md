# Shopyfy — AI Store Builder & Trend Research for Dropshippers

A prototype site modeled on **Atlas for Shopify**: paste a product link and get a
generated Shopify-style store (homepage, product pages, collections, bundle/cart
upsells, suggested pricing), built and editable without code. Alongside the core
generator, it adds a set of research tools aimed specifically at dropshippers.

The UI is in Russian. The frontend runs entirely client-side — no backend, no
API keys, no signup required to try it. State (saved products) persists to
`localStorage` only. An optional real backend for Shopify integration lives
in [`server/`](./server) — see below.

## Features

### Core (parity with the reference product)
- **AI Store Builder** — paste an AliExpress / Amazon / Alibaba / Shopify product
  link (or just a product name) and get a generated store: name, tagline, hero
  copy, product description, USPs, collections, and page sections.
- **AI Page Builder** preview — generated sections shown as an editable outline.
- **Bundle Upsells** and **Cart Upsells** — auto-suggested offers sized to the
  product's price point.
- **One-click "Import to Shopify"** flow — by default shown as a guided demo
  step. Set `VITE_SHOPIFY_BACKEND_URL` (see `.env.example`) to a deployed
  instance of [`server/`](./server) to make this a real OAuth connect +
  publish-to-Shopify flow instead.

### Added for dropshippers
- **Trend Research** (`/trends`) — the main addition. Search any keyword or
  browse a curated starter list of trending niches; every result links out to
  the real source (Google Trends, TikTok, Meta Ad Library, Pinterest, YouTube,
  Reddit, AliExpress, Amazon) so trend claims are always one click from
  verifiable evidence instead of an opaque score.
- **Profit Margin Calculator** (`/tools/profit-calculator`) — factors in
  supplier cost, shipping, payment fees, and ad spend to compute real margin,
  ROI, and break-even price, or suggest a price for a target margin. Includes a
  "Winning Product Score" (trend growth + competition + margin + price
  sweet-spot).
- **Social Ad Copy Generator** (`/tools/ad-copy`) — five ad angles (problem/
  solution, curiosity, social proof, urgency, before/after) plus starter
  hashtags per niche.
- **Saved Products watchlist** (`/saved`) — bookmark products researched
  elsewhere in the app, stored locally, with notes.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router.

## Development

```bash
npm install
npm run dev      # start dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## Backend (optional): real Shopify connection

[`server/`](./server) is an Express backend implementing Shopify OAuth (connect
a seller's real store) and Admin API calls to publish a generated store as an
actual draft product, with collections and a bundle discount code. It's a
scaffold to build on, not deployed anywhere by default — see
[`server/README.md`](./server/README.md) for setup, local testing via tunnel,
and what to harden before pointing it at a real store (token storage,
sessions, compliance webhooks).

## Notes

- Trend scores/growth figures in the curated starter list are illustrative
  starting points, not a live feed — every card links to the real source tool
  to verify current numbers.
- Not affiliated with Shopify Inc.
