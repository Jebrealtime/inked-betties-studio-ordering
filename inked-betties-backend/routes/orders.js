import express from "express";
import mongoose from "mongoose";
import { shopifyRequest } from "../utils/shopifyRequest.js";

const router = express.Router();

// Mongo schema for pending + approved orders
const ArtistOrderSchema = new mongoose.Schema({
  artist: String,
  items: Array,
  status: { type: String, default: "Pending" },
  shopifyDraftId: String,
  date: String
});

const ArtistOrder = mongoose.model("ArtistOrder", ArtistOrderSchema);

// Artist submits order → create Shopify Draft Order
router.post("/", async (req, res) => {
  const { artist, items } = req.body;

  try {
    // Build Shopify draft order payload
    const draftPayload = {
      draft_order: {
        line_items: items.map((i) => ({
          title: i.name,
          quantity: i.qty || 1,
          price: i.price
        })),
        note: `Artist Order: ${artist}`
      }
    };

    // Create draft order in Shopify
    const draft = await shopifyRequest("POST", "/draft_orders.json", draftPayload);

    // Save to Mongo
    const saved = await ArtistOrder.create({
      artist,
      items,
      status: "Pending",
      shopifyDraftId: draft.draft_order.id,
      date: new Date().toLocaleString()
    });

    res.json({ status: "ok", order: saved });
  } catch (err) {
    console.error("Draft order error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Get all artist orders
router.get("/", async (req, res) => {
  const orders = await ArtistOrder.find().sort({ date: -1 });
  res.json(orders);
});

// Approve order → complete Shopify Draft Order
router.put("/:id/approve", async (req, res) => {
  const order = await ArtistOrder.findById(req.params.id);

  try {
    await shopifyRequest("PUT", `/draft_orders/${order.shopifyDraftId}/complete.json`);

    order.status = "Approved";
    await order.save();

    res.json({ status: "ok", order });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Reject order → delete Shopify Draft Order
router.put("/:id/reject", async (req, res) => {
  const order = await ArtistOrder.findById(req.params.id);

  try {
    await shopifyRequest("DELETE", `/draft_orders/${order.shopifyDraftId}.json`);

    order.status = "Rejected";
    await order.save();

    res.json({ status: "ok", order });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
