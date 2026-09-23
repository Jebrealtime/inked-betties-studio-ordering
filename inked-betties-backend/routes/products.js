import express from "express";
import { shopifyRequest } from "../utils/shopifyRequest.js";

const router = express.Router();

// GET  — Shopify products
router.get("/", async (req, res) => {
  try {
    const response = await shopifyRequest("GET", "/products.json?status=active");

    // Return FULL Shopify product objects
    res.json(response.products);

  } catch (err) {
    console.error("Shopify product fetch error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to load Shopify products",
    });
  }
});

export default router;
