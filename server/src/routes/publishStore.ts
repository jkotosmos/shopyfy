import type { Request, Response } from "express";
import { getShopToken } from "../tokenStore.js";
import { verifySessionToken } from "../session.js";
import { shopifyRequest } from "../shopifyClient.js";

interface PublishStoreBody {
  productName: string;
  description: string;
  usps: string[];
  collections: string[];
  price: number;
  bundleUpsell?: { title: string; discount: string };
}

interface ShopifyProduct {
  product: { id: number; title: string; handle: string };
}
interface ShopifyCollectionList {
  custom_collections: { id: number; title: string }[];
}
interface ShopifyCollection {
  custom_collection: { id: number; title: string };
}
interface ShopifyPriceRule {
  price_rule: { id: number };
}

function bearerToken(req: Request): string | undefined {
  const header = req.headers.authorization ?? "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

function extractPercentOff(bundleTitle: string | undefined): number | null {
  const match = bundleTitle?.match(/(\d+)\s*%/);
  return match ? Number(match[1]) : null;
}

// POST /api/stores/publish
// Takes the AI-generated store (same shape the frontend already renders in
// the demo) and creates it as a real, live product in the connected
// Shopify store: a product with the generated copy, a custom collection per
// generated collection name, and — if a bundle upsell percentage is present
// — a discount code implementing it.
export async function publishStore(req: Request, res: Response) {
  const session = verifySessionToken(bearerToken(req));
  if (!session) {
    return res.status(401).json({ error: "Missing or expired session. Reconnect the Shopify store." });
  }

  const shopRecord = await getShopToken(session.shop);
  if (!shopRecord) {
    return res.status(404).json({ error: "This shop has not completed installation." });
  }

  const body = req.body as PublishStoreBody;
  if (!body?.productName || !body?.price) {
    return res.status(400).json({ error: "productName and price are required." });
  }

  const { shop, accessToken } = shopRecord;

  const bodyHtml = `<p>${body.description ?? ""}</p><ul>${(body.usps ?? []).map((u) => `<li>${u}</li>`).join("")}</ul>`;

  const created = await shopifyRequest<ShopifyProduct>({
    shop,
    accessToken,
    method: "POST",
    path: "products.json",
    body: {
      product: {
        title: body.productName,
        body_html: bodyHtml,
        status: "draft", // merchant reviews and publishes from the Shopify admin
        variants: [{ price: body.price.toFixed(2) }],
      },
    },
  });

  const productId = created.product.id;

  const collectionResults: { title: string; id: number }[] = [];
  for (const title of body.collections ?? []) {
    const existing = await shopifyRequest<ShopifyCollectionList>({
      shop,
      accessToken,
      path: `custom_collections.json?title=${encodeURIComponent(title)}`,
    });

    const collectionId =
      existing.custom_collections[0]?.id ??
      (
        await shopifyRequest<ShopifyCollection>({
          shop,
          accessToken,
          method: "POST",
          path: "custom_collections.json",
          body: { custom_collection: { title } },
        })
      ).custom_collection.id;

    await shopifyRequest({
      shop,
      accessToken,
      method: "POST",
      path: "collects.json",
      body: { collect: { product_id: productId, collection_id: collectionId } },
    });

    collectionResults.push({ title, id: collectionId });
  }

  let discountCode: string | null = null;
  const percentOff = extractPercentOff(body.bundleUpsell?.title);
  if (percentOff) {
    const priceRule = await shopifyRequest<ShopifyPriceRule>({
      shop,
      accessToken,
      method: "POST",
      path: "price_rules.json",
      body: {
        price_rule: {
          title: `BUNDLE-${productId}`,
          target_type: "line_item",
          target_selection: "entitled",
          allocation_method: "across",
          value_type: "percentage",
          value: `-${percentOff}.0`,
          customer_selection: "all",
          entitled_product_ids: [productId],
          starts_at: new Date().toISOString(),
        },
      },
    });

    const code = `BUNDLE${percentOff}-${productId}`;
    await shopifyRequest({
      shop,
      accessToken,
      method: "POST",
      path: `price_rules/${priceRule.price_rule.id}/discount_codes.json`,
      body: { discount_code: { code } },
    });
    discountCode = code;
  }

  res.json({
    productId,
    productAdminUrl: `https://${shop}/admin/products/${productId}`,
    collections: collectionResults,
    discountCode,
  });
}
