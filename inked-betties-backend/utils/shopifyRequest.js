import { getAccessToken } from "../utils/shopifyToken.js";
import { request } from "undici";

let cachedToken = null;
let tokenExpiresAt = null;

// Keep your 24-hour token logic
async function ensureToken() {
  if (!cachedToken || Date.now() > tokenExpiresAt) {
    cachedToken = await getAccessToken();
    tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    console.log("NEW SHOPIFY TOKEN GENERATED");
  }
}

export async function shopifyRequest(method, endpoint, body = null) {
  await ensureToken();

  // FIX: Ensure endpoint always starts with a slash
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": cachedToken,
    "Accept": "application/json"
  };

  const response = await request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.body.text();

  try {
    const json = JSON.parse(text);

    // FIX: Shopify returns { products: [...] }
    return json;
  } catch (err) {
    console.error("Failed to parse Shopify response:", text);
    throw err;
  }
}
