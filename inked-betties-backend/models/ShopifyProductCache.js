import mongoose from "mongoose";

// ---------------------------------------------------------------------
// Local mirror of Shopify's product catalog. The app reads from this
// collection instead of calling Shopify live on every "Shop New" page
// load — Shopify webhooks (see routes/shopifyProductWebhooks.js) keep it
// up to date whenever a product is created, changed, or deleted, and
// utils/syncProducts.js does a full refresh on server startup so the
// cache is never more than one restart away from correct even if a
// webhook delivery is ever missed.
//
// `data` stores the FULL raw Shopify product object exactly as the
// Admin API returns it (variants, images, tags, everything) so the
// existing frontend code (product.variants[0].price, etc.) keeps
// working unchanged — this is a cache of Shopify's object, not a
// reshaped copy of it.
// ---------------------------------------------------------------------
const ShopifyProductCacheSchema = new mongoose.Schema({
  shopifyId: { type: String, unique: true, required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  syncedAt: { type: Date, default: Date.now }
});

export default mongoose.models.ShopifyProductCache ||
  mongoose.model("ShopifyProductCache", ShopifyProductCacheSchema);
