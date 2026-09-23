import express from "express";
import crypto from "crypto";
import ShopifyCustomer from "../models/ShopifyCustomer.js";

const router = express.Router();

// ---------------------------------------------------------------------
// Keeps the ordering app's MongoDB in sync with Shopify's native customer
// accounts on the storefront. Every time someone registers or updates
// their info through the storefront's "Log In" flow, Shopify calls this
// endpoint and we upsert a matching record here — same database the app
// already uses for Artist accounts, just its own collection.
//
// Register this URL in Shopify admin under
// Settings > Notifications > Webhooks, for both:
//   - Customer creation  (topic: customers/create)
//   - Customer update    (topic: customers/update)
// Format: JSON, API version: latest (2024-04 or newer works fine).
//
// After you create the first webhook there, Shopify shows a
// "Signing secret" on that same page — copy it into this app's
// environment variables (on Render) as SHOPIFY_WEBHOOK_SECRET.
// Without that secret set, every request is rejected (fails safe).
// ---------------------------------------------------------------------

function verifyShopifyWebhook(req) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256");

  if (!secret || !hmacHeader || !req.rawBody) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody)
    .digest("base64");

  // timingSafeEqual needs equal-length buffers, or it throws instead of
  // just returning false — guard that first.
  const digestBuffer = Buffer.from(digest, "utf8");
  const headerBuffer = Buffer.from(hmacHeader, "utf8");

  if (digestBuffer.length !== headerBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, headerBuffer);
}

// Shopify sends both customers/create and customers/update to whatever
// URL you register for that topic — the payload shape is the same either
// way, so one handler covers both.
router.post("/customers", async (req, res) => {
  if (!verifyShopifyWebhook(req)) {
    return res.status(401).json({ status: "error", message: "Invalid webhook signature" });
  }

  try {
    const topic = req.get("X-Shopify-Topic") || "unknown";
    const customer = req.body;

    if (!customer || !customer.id) {
      return res.status(400).json({ status: "error", message: "Missing customer payload" });
    }

    const email = (customer.email || "").trim().toLowerCase() || undefined;

    await ShopifyCustomer.findOneAndUpdate(
      { shopifyCustomerId: String(customer.id) },
      {
        shopifyCustomerId: String(customer.id),
        email,
        firstName: customer.first_name || "",
        lastName: customer.last_name || "",
        phone: customer.phone || "",
        acceptsMarketing: !!customer.accepts_marketing,
        tags: (customer.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ordersCount: customer.orders_count || 0,
        totalSpent: customer.total_spent || "0.00",
        shopifyCreatedAt: customer.created_at ? new Date(customer.created_at) : undefined,
        shopifyUpdatedAt: customer.updated_at ? new Date(customer.updated_at) : undefined,
        lastWebhookTopic: topic,
        syncedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Shopify just needs a 2xx quickly, or it'll retry (and eventually
    // disable the webhook after enough failures).
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Shopify customer webhook error:", err);
    // Still worth a 200 here in most cases so Shopify doesn't hammer
    // retries over something that needs a code fix, not a resend — but
    // surfacing a 500 during initial setup makes bugs easy to catch in
    // the Shopify webhook delivery log. Flip to 200 once this has been
    // running cleanly for a while, if you'd rather it fail silently.
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Mandatory GDPR webhooks Shopify requires for stores using customer
// accounts + a custom app with an access token (which this store has).
// These don't need to do anything fancy yet, but they must exist and
// return 200, or Shopify will flag the app during any future app review
// and, more immediately, some stores won't let you keep custom-app
// webhooks active without them responding correctly.
router.post("/customers/data_request", async (req, res) => {
  if (!verifyShopifyWebhook(req)) return res.status(401).end();
  console.log("GDPR data request received:", req.body);
  res.status(200).end();
});

router.post("/customers/redact", async (req, res) => {
  if (!verifyShopifyWebhook(req)) return res.status(401).end();
  try {
    const customerId = req.body?.customer?.id;
    if (customerId) {
      await ShopifyCustomer.deleteOne({ shopifyCustomerId: String(customerId) });
    }
    res.status(200).end();
  } catch (err) {
    console.error("Customer redact webhook error:", err);
    res.status(500).end();
  }
});

router.post("/shop/redact", async (req, res) => {
  if (!verifyShopifyWebhook(req)) return res.status(401).end();
  console.log("Shop redact received:", req.body);
  res.status(200).end();
});

export default router;
