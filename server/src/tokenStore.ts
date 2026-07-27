import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "./env.js";

// DEMO-ONLY STORAGE. This persists per-shop access tokens to a plain JSON
// file on disk with no encryption. That is fine for trying the OAuth flow
// locally, but an Admin API access token grants real control over a real
// store — before deploying this anywhere reachable, replace this module
// with a real database (Postgres/MySQL/etc.) and encrypt tokens at rest
// (e.g. with a KMS-backed key), the same way any Shopify app is required to
// for the App Store review.

interface ShopRecord {
  shop: string;
  accessToken: string;
  scope: string;
  installedAt: string;
}

const filePath = () => join(env.dataDir, "shops.json");

async function readAll(): Promise<Record<string, ShopRecord>> {
  try {
    const raw = await readFile(filePath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, ShopRecord>): Promise<void> {
  await mkdir(env.dataDir, { recursive: true });
  await writeFile(filePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function saveShopToken(record: ShopRecord): Promise<void> {
  const all = await readAll();
  all[record.shop] = record;
  await writeAll(all);
}

export async function getShopToken(shop: string): Promise<ShopRecord | undefined> {
  const all = await readAll();
  return all[shop];
}
