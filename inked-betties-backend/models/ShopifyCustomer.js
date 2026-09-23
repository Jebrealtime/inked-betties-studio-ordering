import mongoose from "mongoose";

// Mirrors a Shopify storefront customer (created via the store's native
// Log In / account flow) inside the SAME MongoDB database the ordering app
// uses. Kept as its own collection rather than merged into the Artist
// collection — a storefront shopper isn't a studio artist account (no
// spendingLimit / checklist / role logic applies to them), but both live in
// the same Mongo database so the app can look someone up by email in one
// place if it ever needs to.
const ShopifyCustomerSchema = new mongoose.Schema({
  shopifyCustomerId: { type: String, unique: true, required: true, index: true },
  email: { type: String, unique: true, sparse: true, index: true },
  firstName: String,
  lastName: String,
  phone: String,
  acceptsMarketing: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  ordersCount: { type: Number, default: 0 },
  totalSpent: { type: String, default: "0.00" },
  shopifyCreatedAt: Date,
  shopifyUpdatedAt: Date,
  lastWebhookTopic: String,
  syncedAt: { type: Date, default: Date.now }
});

export default mongoose.models.ShopifyCustomer ||
  mongoose.model("ShopifyCustomer", ShopifyCustomerSchema);
