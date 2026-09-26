import crypto from "crypto";

// Shared HMAC check for every Shopify webhook this app registers
// (customer sync in routes/shopifyWebhooks.js, product sync in
// routes/shopifyProductWebhooks.js). All Shopify webhook topics for one
// app/shop share a single signing secret, so one function + one env var
// (SHOPIFY_WEBHOOK_SECRET) covers all of them.
export function verifyShopifyWebhook(req) {
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
