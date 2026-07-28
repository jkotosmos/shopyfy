# Shopyfy backend (Shopify OAuth + payments scaffold)

This is what actually connects to a seller's Shopify account and takes real
payment for a plan — the parts the frontend prototype alone can't do, since
a real Admin API access token and real payment processing must never be
handled in browser JavaScript.

**Scope**: four things. (1) OAuth — a seller clicks "Connect", approves
access on Shopify's own page, and this server exchanges the resulting code
for an access token. (2) Publish — given the JSON the frontend's AI Store
Builder already generates, it creates a draft product, a custom collection
per generated collection name, and (if the generated bundle upsell has a
percentage in it) a discount code implementing it. (3) Payments — a buyer
pays for a plan on Stripe's hosted Checkout page; once Stripe confirms the
payment, a webhook here generates a promo code and emails it; entering that
code on `/redeem` unlocks the plan in the browser (see
[Payments & promo codes](#payments--promo-codes) below). (4) Real market
data — real Google Trends interest/region data, real eBay listings, and
real ads for a keyword, from third-party APIs (see
[Real market data](#6-real-market-data) below).

It does **not** post ads to Meta/TikTok — see [Beyond Shopify](#beyond-shopify-posting-real-ads) at the bottom.

## 1. Create a Shopify app to get credentials

You need a Shopify Partner account (free): https://partners.shopify.com

1. Partner Dashboard → Apps → **Create app**.
   - **Custom app**, if this only ever needs to connect one specific store you control.
   - **Public app** (or "app listed on the App Store" — you can keep it unlisted), if different sellers will each connect their own store.
2. Under **App setup**, set:
   - **App URL**: your frontend's URL (e.g. `https://shopyfy.example.com`).
   - **Allowed redirection URL(s)**: `{HOST}/auth/callback`, where `HOST` is this backend's public URL — must match exactly what you put in `.env`.
3. Copy the **Client ID** and **Client secret** shown there — these are `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET`.
4. Decide scopes. The default in `.env.example` (`write_products,read_products,write_price_rules,write_discounts`) covers everything `publishStore.ts` uses. Request only what you use — Shopify reviews public apps against this.

## 2. Configure

```bash
cd server
cp .env.example .env
# fill in SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST, APP_URL, SESSION_SECRET
npm install
```

`SESSION_SECRET`: generate one with `openssl rand -hex 32`.

## 3. Run it locally

Shopify will not redirect to `http://localhost`, so local testing needs a
public HTTPS tunnel pointed at your local port:

```bash
# one-time: npm install -g localtunnel, or use ngrok / cloudflared instead
npx localtunnel --port 8787
# -> gives you something like https://random-name.loca.lt
```

Set `HOST` in `.env` to that tunnel URL, and update the app's **Allowed
redirection URL** in the Partner Dashboard to `{tunnel-url}/auth/callback`
(both must match on every restart if your tunnel URL changes — ngrok/ Cloudflare
Tunnel can give you a stable subdomain if you need this to stop moving).

```bash
npm run dev
```

Then, in the frontend (repo root), set:

```bash
# .env (repo root, not server/)
VITE_SHOPIFY_BACKEND_URL=https://your-tunnel-url
```

Restart `npm run dev` for the frontend, open **Store Builder**, generate a
store, click **Импортировать в Shopify**, enter a real
`your-store.myshopify.com` you have admin access to (a free Shopify
[dev store](https://www.shopify.com/partners) is fine), and go through the
install screen. You'll land back on Store Builder connected, and can click
**Опубликовать товар** to create the draft product for real.

## 4. What actually gets created

- A **product** (`POST products.json`) with the generated title/description/
  price, saved as `status: draft` — so the merchant reviews it before it
  goes live, rather than this tool silently listing something for sale.
- A **custom collection** per generated collection name, with the product added to it.
- A **discount code** (a Shopify price rule) if the generated bundle upsell
  string contained a percentage (e.g. "Купи 2, экономь 15%" → a `-15%` code
  scoped to that product). This is a real, redeemable discount code, not a
  themed cart-upsell widget — building the actual on-page bundle/cart-upsell
  UI a merchant sees requires a Shopify theme app extension or Shopify
  Function, which is a bigger, separate project.

## 5. Payments & promo codes

This is a **one-time-purchase → activation-code** flow, not full recurring
subscription billing — it matches "pay once, get a code, redeem it" rather
than building subscription lifecycle management (renewals, cancellations,
dunning). If you want real recurring billing later, swap Checkout's
`mode: "payment"` for `mode: "subscription"` and add handlers for
`customer.subscription.updated`/`.deleted` in the webhook.

1. Create a Stripe account (free, use test mode while building):
   https://dashboard.stripe.com/register
2. **API key**: Developers → API keys → copy the secret key into
   `STRIPE_SECRET_KEY`. Use a `sk_test_...` key until you're ready to go live.
3. **Prices**: Product catalog → create a product per plan → add a
   **one-time** price to each → copy the `price_...` IDs into
   `STRIPE_PRICE_STARTER` / `_GROWTH` / `_PRO` (leave a plan's var blank to
   disable checkout for it — Starter is free in this app's pricing, so it's
   never sent through Stripe at all).
4. **Webhook**, for local testing:
   ```bash
   stripe listen --forward-to localhost:8787/api/webhooks/stripe
   # prints a whsec_... value — put it in STRIPE_WEBHOOK_SECRET
   ```
   For a deployed backend, add the webhook endpoint in the Stripe Dashboard
   (Developers → Webhooks → Add endpoint → `{HOST}/api/webhooks/stripe`,
   subscribe to `checkout.session.completed`) and use the signing secret it
   shows you there instead.
5. **Email**: set `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` to
   any SMTP provider (Gmail, SendGrid, Postmark, AWS SES, Resend's SMTP
   endpoint — this isn't tied to one vendor). Without SMTP configured, the
   promo code is still generated and stored after a real payment — check
   the server log for it while testing.

**Where the money goes**: directly into the Stripe account that owns
`STRIPE_SECRET_KEY` — yours, once you set this up. This backend never
collects, sees, or stores card details; Stripe's own hosted Checkout page
does that. A promo code is generated *only* after Stripe's webhook confirms
`checkout.session.completed` — there is no path in this app that grants
access without a verified payment.

**What redeeming a code unlocks**: `/redeem` exchanges a valid code for a
signed entitlement token stored in the browser's `localStorage`. Right now
exactly one thing in the frontend checks it: publishing a generated store
to Shopify requires a Growth-or-higher entitlement (matching the pricing
page's own claim that Shopify import is a paid-tier feature). The
Pro-tier extras listed on the pricing page (team seats, bulk generation, a
custom section library) are not built yet — add gates for those the same
way (`hasPlanAtLeast("pro")` from `src/lib/payments.ts` on the frontend) as
you build the features themselves.

**Before this touches real money**:
- `src/promoStore.ts` writes codes to a plain JSON file, same caveat as
  token storage below — a promo code is a bearer credential, treat it
  accordingly once this isn't a demo.
- The entitlement token (`src/entitlement.ts`) has no revocation — there's
  no way to invalidate someone's access after issuing it (e.g. for a
  refund) short of rotating `SESSION_SECRET`, which invalidates *every*
  outstanding token and OAuth session at once.
- Add Stripe CLI / Dashboard monitoring for failed webhook deliveries in
  production — a missed `checkout.session.completed` event means a real
  paying customer never gets their code.

## 6. Real market data

Powers `GET /api/market-data?q=<keyword>`, used by the frontend's Trend
Research page. Each source below is independent — configure any subset;
the endpoint returns `null` for whichever ones aren't set up, and the
frontend falls back to its illustrative demo generator for that source
specifically (never silently blending fabricated numbers into what's
reported as real).

**Two of these three sources are entirely free — no trial limit, no paid
tier, ever** — and together they're enough for every "real" number the
Trend Research page shows (a seller-country signal, a real eBay listing
count, and a real running-ad count): eBay Browse and Meta Ad Library.
SerpApi (Google Trends) is the one optional paid add-on; skip it and the
page still shows real, non-illustrative data from the other two.

**eBay Browse API — free.** Free developer account at
[developer.ebay.com](https://developer.ebay.com) → create an application
keyset → put the **production** Client ID / Client Secret in `EBAY_APP_ID`
/ `EBAY_CERT_ID` (`src/ebayClient.ts` uses OAuth2 client-credentials to get
an app access token automatically, no further setup, no cost at any usage
tier documented by eBay for this). Real listings — this is eBay's
marketplace, not AliExpress, since AliExpress has no comparable self-serve
product-search API for third parties. Besides each item's title/price/
image/URL, the response includes the real total matching-listing count
(`totalListings`) and each item's real seller/listing country
(`countryCode`) — the frontend uses the most common country across
results as a real "where this is sold from" signal, distinct from (and
usually more available than) Google Trends' search-interest geography.

**Meta Ad Library API — free.** Create an app at
[developers.facebook.com](https://developers.facebook.com), put its App ID
/ App Secret in `META_ADS_APP_ID` / `META_ADS_APP_SECRET`
(`src/metaAdsClient.ts` combines them into an app access token — no
per-user OAuth flow needed, no cost). This covers basic keyword search over
non-political/non-issue ads, reached in the US/UK/Canada/Australia by
default (`AD_REACHED_COUNTRIES` in `metaAdsClient.ts`). Meta gates higher
search volume, and any access to political/social-issue ads, behind a
separate Ad Library API access review — expect friction here that eBay
doesn't have. Since the API has no total-match-count field, the real
`activeAdCount` reported is a genuine lower bound (how many ads this one
query found), with `hasMore: true` when Meta's pagination says there are
more — used as a real, free proxy for ad-driven demand. There's no
comparable self-serve public API for TikTok (its ad-transparency and
research APIs both require a separate approval process, not a quick
signup), so TikTok stays a real, direct search link on the page rather
than an automated number.

**Google Trends (via SerpApi) — optional, not free at scale.** Google has
no publicly-available official Trends API — a real one exists but is an
invite-only alpha as of 2025. Real interest-over-time and interest-by-
region data here goes through [SerpApi](https://serpapi.com)'s Google
Trends endpoint instead: sign up, copy your API key into `SERPAPI_KEY`.
The free trial covers a small number of searches; sustained use needs a
paid plan. The unofficial alternative — querying Google's own undocumented
internal Trends endpoint directly, the way tools like pytrends do — costs
nothing per request, but isn't a dependable substitute: it's against
Google's terms of service for automated access, commonly rate-limited or
blocked by IP (including most cloud-provider ranges), and could break
without notice since it's not a documented, versioned API. SerpApi is a
deliberate trade of a small ongoing cost for something that won't quietly
stop working; swap `src/serpapiClient.ts` for a different documented
provider (HasData, Bright Data, Apify, etc.) if you'd rather pay someone
else for the same reliability. The regional breakdown this returns is
*search interest by country*, not sales data.

## 7. Before this touches a real, non-test store

This is a scaffold to build on, not production-ready as-is:

- **Token storage** (`src/tokenStore.ts`, `src/promoStore.ts`) writes to
  plain JSON files with no encryption. Swap both for a real database and
  encrypt tokens at rest (Shopify requires this for App Store review, and
  it's just correct practice regardless — an Admin API token is equivalent
  to admin login credentials for that store).
- **Sessions & entitlements** (`src/session.ts`, `src/entitlement.ts`) are
  minimal signed tokens with no revocation. Fine for trying this out; add
  real session infrastructure (or a signed JWT library with expiry/rotation
  and a revocation list) before real users depend on it.
- **Mandatory compliance webhooks**: Shopify requires apps to implement
  `customers/data_request`, `customers/redact`, and `shop/redact` webhooks
  before going live (even for unlisted public apps) — not implemented here.
- Put this behind HTTPS in production (not optional — Shopify won't
  redirect to a plain-HTTP `HOST` anyway, and Stripe strongly expects it).
- The in-memory OAuth `state` nonce store (`shopifyAuth.ts`) works for a
  single server instance; move it to Redis (with a TTL) if you run more than one.

## Beyond Shopify: posting real ads

"Publish the listing" (this backend) and "post an ad about it on social
media" are two separate integrations. The ad copy this app generates
(`/tools/ad-copy`) is currently copy-paste — actually posting it as a live ad
would mean:

- **Meta (Facebook/Instagram) Marketing API**: create a Meta App, get
  `ads_management` permission (requires Business Manager verification + App
  Review), OAuth to get an ad-account access token, then `POST
  /act_{ad_account_id}/campaigns` → `/adsets` → `/ads` → `/adcreatives`.
- **TikTok Marketing API**: a TikTok for Business developer app (also
  requires approval), OAuth for an advertiser access token, then
  `/open_api/v1.3/ad/create/` and related endpoints.

Both need the seller's own ad account with billing already set up — this
would only automate campaign creation, not pay for the ads — and both
approval processes can take days to weeks. Same shape as this Shopify
integration (OAuth + a typed API client + a publish endpoint), just a
separate app registration per platform. Worth building as a follow-up if
you want it, not included here.
