import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const PreviousOrderSchema = new mongoose.Schema({
  timestamp: String,
  studio: String,
  combinedItems: Array,
  orders: Array,
  pdfPath: String
});

const PreviousOrder = mongoose.model("PreviousOrder", PreviousOrderSchema);

// Get all previous combined orders
router.get("/", async (req, res) => {
  const orders = await PreviousOrder.find().sort({ timestamp: -1 });
  res.json(orders);
});

// Save combined order
router.post("/", async (req, res) => {
  const saved = await PreviousOrder.create(req.body);
  res.json(saved);
});

export default router;
