import ShopifyProductCache from "../models/ShopifyProductCache.js";
import { shopifyRequest } from "./shopifyRequest.js";

// Pulls every ACTIVE product from Shopify and mirrors it into
// ShopifyProductCache. Runs once on server startup (see server.js) so the
// cache is correct even after a restart or a missed webhook, and can also
// be called any time as a manual "resync" safety valve.
//
// Only status=active products are kept — same rule as the old live
// route (routes/products.js) — so drafts/archived items already staged
// in Shopify admin never leak into the app's ordering screens before
// you intend them to.
export async function syncAllProducts() {
  try {
    let nextPageInfo = null;
    let totalSynced = 0;
    const seenShopifyIds = [];

    do {
      // Once you're on page 2+, Shopify requires the request to be JUST
      // page_info + limit (no status filter) — it's already baked into
      // the cursor from the first request.
      const endpoint = nextPageInfo
        ? `/products.json?limit=250&page_info=${nextPageInfo}`
        : `/products.json?limit=250&status=active`;

      const { json, linkHeader } = await shopifyRequest("GET", endpoint, null, {
        includeLinkHeader: true
      });

      const products = json?.products || [];
      for (const product of products) {
        const shopifyId = String(product.id);
        seenShopifyIds.push(shopifyId);
        await ShopifyProductCache.findOneAndUpdate(
          { shopifyId },
          { shopifyId, data: product, syncedAt: new Date() },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
      }
      totalSynced += products.length;

      nextPageInfo = extractNextPageInfo(linkHeader);
    } while (nextPageInfo);

    // Anything in the cache that Shopify didn't return this pass is no
    // longer active (deleted, archived, or switched to draft) — drop it
    // so the app never shows a stale product that can't actually be
    // ordered anymore.
    if (seenShopifyIds.length > 0) {
      await ShopifyProductCache.deleteMany({ shopifyId: { $nin: seenShopifyIds } });
    }

    console.log(`Shopify product cache synced: ${totalSynced} active product(s).`);
    return totalSynced;
  } catch (err) {
    console.error("Error syncing products from Shopify:", err.message);
    return 0;
  }
}

function extractNextPageInfo(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.endsWith('rel="next"'));
  if (!match) return null;
  const urlMatch = match.match(/<([^>]+)>/);
  if (!urlMatch) return null;
  try {
    const url = new URL(urlMatch[1]);
    return url.searchParams.get("page_info");
  } catch {
    return null;
  }
}
