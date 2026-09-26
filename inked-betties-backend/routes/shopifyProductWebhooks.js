import express from "express";
import ShopifyProductCache from "../models/ShopifyProductCache.js";
import { verifyShopifyWebhook } from "../utils/verifyShopifyWebhook.js";

const router = express.Router();

// ---------------------------------------------------------------------
// Keeps ShopifyProductCache in sync in real time, so the app's "Shop
// New" page never has to call Shopify live to load products (see
// routes/products.js). Shopify calls these endpoints the instant a
// product is created, changed, or deleted in the admin — the cache
// updates in well under a second, and utils/syncProducts.js's
// startup pass is just a safety net in case a delivery is ever missed.
//
// Register this URL in Shopify admin under
// Settings > Notifications > Webhooks, for:
//   - Product creation  (topic: products/create)
//   - Product update    (topic: products/update)
//   - Product deletion  (topic: products/delete)
// Format: JSON, API version: latest (2024-04 or newer works fine).
//
// These share the same signing secret as the customer webhooks
// (SHOPIFY_WEBHOOK_SECRET) — Shopify uses one secret per app/shop for
// every topic, so nothing new needs to be added in Render if that's
// already set.
// ---------------------------------------------------------------------

// products/create and products/update both send the full current
// product object — an upsert handles both with one handler.
router.post("/products/create", handleUpsert);
router.post("/products/update", handleUpsert);

async function handleUpsert(req, res) {
  if (!verifyShopifyWebhook(req)) {
    return res.status(401).json({ status: "error", message: "Invalid webhook signature" });
  }

  try {
    const product = req.body;

    if (!product || !product.id) {
      return res.status(400).json({ status: "error", message: "Missing product payload" });
    }

    // Only mirror products that are actually orderable on the
    // storefront — same "active only" rule the rest of this app uses.
    // A product that gets switched to draft/archived should disappear
    // from the app's cache, not linger there.
    if (product.status && product.status !== "active") {
      await ShopifyProductCache.deleteOne({ shopifyId: String(product.id) });
      return res.status(200).json({ status: "ok", removed: true });
    }

    await ShopifyProductCache.findOneAndUpdate(
      { shopifyId: String(product.id) },
      { shopifyId: String(product.id), data: product, syncedAt: new Date() },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Shopify product webhook error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

router.post("/products/delete", async (req, res) => {
  if (!verifyShopifyWebhook(req)) {
    return res.status(401).json({ status: "error", message: "Invalid webhook signature" });
  }

  try {
    // Shopify's products/delete payload is just { id: <product id> }.
    const productId = req.body?.id;
    if (productId) {
      await ShopifyProductCache.deleteOne({ shopifyId: String(productId) });
    }
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Shopify product delete webhook error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
