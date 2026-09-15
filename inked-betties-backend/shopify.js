import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";

/**
 * This version is correct for a Dev Dashboard app using the
 * OAuth 2.0 client_credentials flow.
 *
 * You must refresh SHOPIFY_ACCESS_TOKEN every 24 hours
 * using the curl command Shopify gave you.
 */

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,          // Your Client ID
  apiSecretKey: process.env.SHOPIFY_API_SECRET, // Your Client Secret
  adminApiAccessToken: process.env.SHOPIFY_ACCESS_TOKEN, // 24-hour token
  apiVersion: ApiVersion.January24,
  isCustomStoreApp: false,                      // IMPORTANT: this must be false
  hostName: process.env.SHOPIFY_STORE_DOMAIN,   // e.g. "inkedbetties.myshopify.com"
});
