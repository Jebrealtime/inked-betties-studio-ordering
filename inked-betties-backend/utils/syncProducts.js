import Product from "../models/Product.js";
import { shopifyRequest } from "./shopifyRequest.js";

export async function syncProducts() {
  try {
    const response = await shopifyRequest("/products.json");

    if (!response || !response.products) {
      console.error("Shopify returned no products");
      return;
    }

    const normalized = response.products.map(p => {
      const variant = p.variants?.[0] || {};

      return {
        shopifyId: String(p.id),
        title: p.title || "Untitled Product",
        price: Number(variant.price || 0),

        // SAFE: image will always be a string or null
        image: p.images?.[0]?.src || null,

        inStock: (variant.inventory_quantity || 0) > 0,
        stockCount: Number(variant.inventory_quantity || 0),

        availableForOrdering: p.tags?.includes("app-visible") || false,
        bestSeller: p.tags?.includes("best-seller") || false,
        commonlyBoughtWith: []
      };
    });

    await Product.deleteMany({});
    await Product.insertMany(normalized);

    console.log("Products synced from Shopify.");
  } catch (err) {
    console.error("Error syncing products:", err.message);
  }
}
