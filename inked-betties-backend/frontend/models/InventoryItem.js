import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // Where the studio normally buys this item
  vendor: { type: String, default: "" },
  vendorLink: { type: String, default: "" },

  // Quantity tracking
  quantity: { type: Number, default: 0 },
  lowStock: { type: Number, default: 0 },

  // If Inked Betties carries this item
  bettiesAvailable: { type: Boolean, default: false },
  bettiesProductId: { type: String, default: null },

  // Restock history
  lastRestockedAt: { type: Date, default: null },
  lastRestockedQuantity: { type: Number, default: 0 },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("InventoryItem", InventoryItemSchema);
