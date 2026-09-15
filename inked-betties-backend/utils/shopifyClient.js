// shopifyClient.js (CommonJS version)

const fetch = require("node-fetch");

/**
 * Shopify API request helper
 * Uses the 24-hour access token you generate with the client_credentials flow.
 *
 * IMPORTANT:
 * You must refresh SHOPIFY_ACCESS_TOKEN manually every 24 hours
 * using the curl command Shopify provided.
 */

async function shopifyRequest(path, method = "GET", body = null) {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Missing SHOPIFY_ACCESS_TOKEN in environment variables.");
  }

  const url = `https://${storeDomain}/admin/api/2024-04/${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Shopify API error:", response.status, text);
    throw new Error(`Shopify API error: ${response.status}`);
  }

  return response.json();
}

module.exports = { shopifyRequest };
