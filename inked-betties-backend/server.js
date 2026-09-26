import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

import productsRouter from "./routes/products.js";   // Shopify products route

// ⭐ NEW ROUTES YOU WILL CREATE
import ordersRouter from "./routes/orders.js";
import artistsRouter from "./routes/artists.js";
import settingsRouter from "./routes/settings.js";
import notificationsRouter from "./routes/notifications.js";
import previousOrdersRouter from "./routes/previousOrders.js";

// ⭐ INVENTORY ROUTE
import inventoryRouter from "./routes/inventory.js";

// ⭐ SHOPIFY → MONGO CUSTOMER SYNC (storefront Log In / register webhooks)
import shopifyWebhooksRouter from "./routes/shopifyWebhooks.js";

// ⭐ SHOPIFY → MONGO PRODUCT CACHE (Shop New page speed fix)
import shopifyProductWebhooksRouter from "./routes/shopifyProductWebhooks.js";
import { syncAllProducts } from "./utils/syncProducts.js";

dotenv.config();

const app = express();

// Debug env
console.log("ENV TEST:", process.env.SHOPIFY_CLIENT_ID);

// Parse JSON bodies. The `verify` callback stashes the raw request bytes
// on req.rawBody — Shopify webhook signatures (routes/shopifyWebhooks.js)
// have to be checked against the exact raw body, not a re-stringified
// version of the parsed JSON, or every signature check fails.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// Enable CORS BEFORE routes
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://inked-betties-frontend.onrender.com",
      "https://inked-betties-studio-ordering.onrender.com",
      "https://admin.shopify.com",
      "https://dev.shopify.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);


// Connect to MongoDB (ONLY for final orders + Inked Betties accounts)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Full product-cache refresh on every boot, so the "Shop New" page
    // has correct data immediately even if a webhook delivery was ever
    // missed while the server was down. Runs in the background — it
    // does not block the server from accepting requests.
    syncAllProducts();
  })
  .catch((err) => console.error("MongoDB error:", err));

// Ensure final-orders folder exists
const ordersDir = path.resolve("final-orders");
if (!fs.existsSync(ordersDir)) {
  fs.mkdirSync(ordersDir);
}

// PDF generator function
function generateFinalOrderPDF(finalOrder) {
  const doc = new PDFDocument();
  const fileName = `order-${Date.now()}.pdf`;
  const filePath = path.join(ordersDir, fileName);

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(22).text("Inked Betties - Final Combined Order", { underline: true });
  doc.moveDown();

  doc.fontSize(14).text(`Generated: ${finalOrder.timestamp}`);
  doc.text(`Studio: ${finalOrder.studio}`);
  doc.moveDown();

  doc.fontSize(18).text("Combined Items:");
  doc.moveDown();

  finalOrder.combinedItems.forEach((item) => {
    doc.fontSize(14).text(
      `${item.name} — Qty: ${item.qty} — Price: $${item.price.toFixed(2)}`
    );
  });

  doc.moveDown();

  doc.fontSize(18).text("Artist Orders:");
  doc.moveDown();

  finalOrder.orders.forEach((order) => {
    doc.fontSize(14).text(`Artist: ${order.artist} — Status: ${order.status}`);
    order.items.forEach((item) => {
      doc.text(`   • ${item.name} — Qty: ${item.qty} — $${item.price}`);
    });
    doc.moveDown();
  });

  doc.end();

  return filePath;
}

// ⭐ ROUTES
app.use("/api/products", productsRouter);          // Shopify products
app.use("/api/orders", ordersRouter);              // Artist orders → Shopify Draft Orders
app.use("/api/artists", artistsRouter);            // Inked Betties accounts + limits
app.use("/api/settings", settingsRouter);          // Studio-wide settings
app.use("/api/notifications", notificationsRouter);// Notifications
app.use("/api/previous-orders", previousOrdersRouter); // Combined orders history

// ⭐ INVENTORY ROUTE (added cleanly)
app.use("/api/inventory", inventoryRouter);

// ⭐ SHOPIFY WEBHOOKS (storefront customer → Mongo sync)
app.use("/api/webhooks/shopify", shopifyWebhooksRouter);

// ⭐ SHOPIFY WEBHOOKS (product create/update/delete → Mongo cache sync)
app.use("/api/webhooks/shopify", shopifyProductWebhooksRouter);

// Root route
app.get("/", (req, res) => {
  res.send("App is running!");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ⭐ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
