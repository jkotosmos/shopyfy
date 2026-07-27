# Shopyfy backend (Shopify OAuth + Admin API scaffold)

This is what actually connects to a seller's Shopify account and publishes
the AI-generated store as a real product — the part the frontend prototype
alone can't do, since a real Admin API access token must never be handled
in browser JavaScript.

**Scope**: it does two things. (1) OAuth — a seller clicks "Connect", approves
access on Shopify's own page, and this server exchanges the resulting code
for an access token. (2) Publish — given the JSON the frontend's AI Store
Builder already generates, it creates a draft product, a custom collection
per generated collection name, and (if the generated bundle upsell has a
percentage in it) a discount code implementing it.

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

## 5. Before this touches a real, non-test store

This is a scaffold to build on, not production-ready as-is:

- **Token storage** (`src/tokenStore.ts`) writes access tokens to a plain
  JSON file with no encryption. Swap it for a real database and encrypt
  tokens at rest (Shopify requires this for App Store review, and it's just
  correct practice regardless — an Admin API token is equivalent to admin
  login credentials for that store).
- **Sessions** (`src/session.ts`) are a minimal signed token with no
  revocation. Fine for trying this out; add real session infrastructure
  (or a signed JWT library with expiry/rotation) before real users depend on it.
- **Mandatory compliance webhooks**: Shopify requires apps to implement
  `customers/data_request`, `customers/redact`, and `shop/redact` webhooks
  before going live (even for unlisted public apps) — not implemented here.
- Put this behind HTTPS in production (not optional — Shopify won't
  redirect to a plain-HTTP `HOST` anyway).
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
