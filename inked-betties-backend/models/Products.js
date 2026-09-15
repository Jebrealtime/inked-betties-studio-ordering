import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shopifyId: { type: String, required: true },
  price: { type: Number, default: 0 },
  image: { type: String, default: "" },
  vendor: { type: String, default: "" },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Products", ProductSchema);
