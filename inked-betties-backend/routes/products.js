import express from "express";
import ShopifyProductCache from "../models/ShopifyProductCache.js";
import { shopifyRequest } from "../utils/shopifyRequest.js";

const router = express.Router();

// GET — Shopify products, served from the local Mongo cache instead of
// calling Shopify live on every page load. This is what used to make
// "Shop New" feel slow: every visit waited on a fresh round trip to
// Shopify's API before showing anything. Now it's a normal, fast Mongo
// read — the cache itself is kept current in real time by Shopify
// webhooks (routes/shopifyProductWebhooks.js) and refreshed fully on
// every server restart (utils/syncProducts.js), so the data is still
// live-accurate, just not fetched live on each request.
router.get("/", async (req, res) => {
  try {
    const cached = await ShopifyProductCache.find({});

    if (cached.length > 0) {
      return res.json(cached.map((doc) => doc.data));
    }

    // Safety fallback: if the cache is empty (e.g. very first boot
    // before the startup sync finishes, or the sync failed), fall back
    // to the old live Shopify call so the app never just shows nothing.
    console.warn("ShopifyProductCache empty — falling back to a live Shopify fetch.");
    const response = await shopifyRequest("GET", "/products.json?status=active");
    res.json(response.products);
  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to load products",
    });
  }
});

export default router;
