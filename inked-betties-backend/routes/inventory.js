import express from "express";
import InventoryItem from "../models/InventoryItem.js";
import Products from "../models/Products.js"; // your Shopify product model

const router = express.Router();

/* ⭐ GET ALL INVENTORY */
router.get("/", async (req, res) => {
  const items = await InventoryItem.find();
  res.json(items);
});

/* ⭐ ADD INVENTORY ITEM */
router.post("/", async (req, res) => {
  const { name, vendor, vendorLink, quantity, lowStock } = req.body;

  // Check if Inked Betties carries this item
  const bettiesMatch = await Products.findOne({
    title: { $regex: name, $options: "i" },
  });

  const item = await InventoryItem.create({
    name,
    vendor,
    vendorLink,
    quantity,
    lowStock,
    bettiesAvailable: !!bettiesMatch,
    bettiesProductId: bettiesMatch?._id || null,
  });

  res.json(item);
});

/* ⭐ UPDATE INVENTORY ITEM */
router.put("/:id", async (req, res) => {
  const updated = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

/* ⭐ DELETE INVENTORY ITEM */
router.delete("/:id", async (req, res) => {
  await InventoryItem.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ⭐ AUTO-RESTOCK FROM INKED BETTIES */
router.post("/reorder/betties", async (req, res) => {
  const { itemId, quantity } = req.body;

  const item = await InventoryItem.findById(itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  // Increase inventory automatically
  item.quantity += quantity;
  item.lastRestockedAt = new Date();
  item.lastRestockedQuantity = quantity;

  await item.save();

  res.json({ success: true, item });
});

/* ⭐ MANUAL RESTOCK (EXTERNAL VENDOR) */
router.post("/reorder/external", async (req, res) => {
  const { itemId, quantity } = req.body;

  const item = await InventoryItem.findById(itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  // Manual update
  item.quantity += quantity;
  item.lastRestockedAt = new Date();
  item.lastRestockedQuantity = quantity;

  await item.save();

  res.json({ success: true, item });
});

export default router;
