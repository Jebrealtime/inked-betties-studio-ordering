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

// options.includeLinkHeader: true — return { json, linkHeader } instead
// of just the parsed body. Needed for paginating /products.json past 250
// items (Shopify's page cap), where the next page's cursor only comes
// back in the response's Link header, never in the JSON body itself.
// Every existing caller that doesn't pass this option is unaffected —
// it still gets the parsed JSON body back directly, exactly as before.
export async function shopifyRequest(method, endpoint, body = null, options = {}) {
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

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Shopify response:", text);
    throw err;
  }

  if (options.includeLinkHeader) {
    // undici lower-cases header names; Shopify sends "Link".
    const linkHeader = response.headers["link"] || response.headers["Link"] || null;
    return { json, linkHeader };
  }

  // FIX: Shopify returns { products: [...] }
  return json;
}
