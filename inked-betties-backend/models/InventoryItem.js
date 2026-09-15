import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vendor: { type: String, default: "" },
  vendorLink: { type: String, default: "" },
  quantity: { type: Number, default: 0 },
  lowStock: { type: Number, default: 0 },
  bettiesAvailable: { type: Boolean, default: false },
  bettiesProductId: { type: String, default: null },
  lastRestockedAt: { type: Date, default: null },
  lastRestockedQuantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("InventoryItem", InventoryItemSchema);
