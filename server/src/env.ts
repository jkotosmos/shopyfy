import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name} — copy server/.env.example to server/.env and fill it in.`);
  }
  return value;
}

export const env = {
  shopifyApiKey: required("SHOPIFY_API_KEY"),
  shopifyApiSecret: required("SHOPIFY_API_SECRET"),
  shopifyScopes: process.env.SHOPIFY_SCOPES ?? "write_products,read_products",
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-01",
  host: required("HOST").replace(/\/+$/, ""),
  appUrl: required("APP_URL").replace(/\/+$/, ""),
  sessionSecret: required("SESSION_SECRET"),
  port: Number(process.env.PORT ?? 8787),
  dataDir: process.env.DATA_DIR ?? "./data",
};
