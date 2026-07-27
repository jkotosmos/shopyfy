import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "./env.js";
import { isValidShopDomain, verifyOAuthHmac } from "./hmac.js";
import { saveShopToken } from "./tokenStore.js";
import { issueSessionToken } from "./session.js";

// Short-lived nonce store for CSRF protection on the OAuth `state` param.
// In-memory is fine here since a nonce only needs to survive the few
// seconds between redirect-out and redirect-back; swap for Redis (with a
// TTL) if you run more than one server instance behind a load balancer.
const pendingStates = new Map<string, number>();
const STATE_TTL_MS = 5 * 60 * 1000;

function newState(): string {
  const state = randomBytes(16).toString("hex");
  pendingStates.set(state, Date.now() + STATE_TTL_MS);
  return state;
}

function consumeState(state: string | undefined): boolean {
  if (!state) return false;
  const expiry = pendingStates.get(state);
  pendingStates.delete(state);
  return !!expiry && expiry > Date.now();
}

// GET /auth?shop=example.myshopify.com
// Step 1 of OAuth: send the merchant to Shopify's permission screen.
export function startInstall(req: Request, res: Response) {
  const shop = String(req.query.shop ?? "");
  if (!isValidShopDomain(shop)) {
    return res.status(400).send("Missing or invalid ?shop= parameter (expected <name>.myshopify.com).");
  }

  const state = newState();
  const redirectUri = `${env.host}/auth/callback`;
  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", env.shopifyApiKey);
  authorizeUrl.searchParams.set("scope", env.shopifyScopes);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  res.redirect(authorizeUrl.toString());
}

// GET /auth/callback?code=...&hmac=...&shop=...&state=...&timestamp=...
// Step 2: Shopify redirects here after the merchant approves. Verify
// everything, then exchange the one-time code for a permanent access token.
export async function completeInstall(req: Request, res: Response) {
  const query = req.query as Record<string, string | undefined>;
  const shop = String(query.shop ?? "");

  if (!isValidShopDomain(shop)) {
    return res.status(400).send("Invalid shop parameter.");
  }
  if (!verifyOAuthHmac(query)) {
    return res.status(401).send("Invalid HMAC signature — request did not come from Shopify.");
  }
  if (!consumeState(query.state)) {
    return res.status(401).send("Invalid or expired state parameter (possible CSRF).");
  }
  if (!query.code) {
    return res.status(400).send("Missing authorization code.");
  }

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.shopifyApiKey,
      client_secret: env.shopifyApiSecret,
      code: query.code,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error("Token exchange failed", tokenRes.status, body);
    return res.status(502).send("Failed to exchange code for access token.");
  }

  const { access_token: accessToken, scope } = (await tokenRes.json()) as { access_token: string; scope: string };

  await saveShopToken({
    shop,
    accessToken,
    scope,
    installedAt: new Date().toISOString(),
  });

  // Hand the frontend a short-lived session token (NOT the Shopify access
  // token itself) so it can call our own API as this shop without ever
  // seeing the real Admin API credential.
  const sessionToken = issueSessionToken(shop);
  const redirectTo = new URL(env.appUrl);
  redirectTo.pathname = "/store-builder";
  redirectTo.searchParams.set("shopifyConnected", shop);
  redirectTo.searchParams.set("session", sessionToken);

  res.redirect(redirectTo.toString());
}
