// ─────────────────────────────────────────────
// Shopify integration config
// ─────────────────────────────────────────────
// Phase 1: Buy Buttons. Phase 2: Storefront API.
//
// Required env vars (set in .env.local + Vercel project settings):
//   NEXT_PUBLIC_SHOPIFY_DOMAIN           e.g. shelzys-designs.myshopify.com
//   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN Storefront API public access token
//   NEXT_PUBLIC_SHOPIFY_CHECKOUT_ENABLED "true" to render Shopify buttons on cards
//
// Until NEXT_PUBLIC_SHOPIFY_CHECKOUT_ENABLED === "true" the site behaves exactly
// as today: product cards link to /products/[slug] and product detail pages
// route buyers to Etsy. Flipping the flag swaps in Shopify Add-to-Cart.

export const shopifyConfig = {
  domain: process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? "",
  storefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "",
  enabled: process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_ENABLED === "true",
};

export const isShopifyEnabled = (): boolean =>
  shopifyConfig.enabled &&
  shopifyConfig.domain.length > 0 &&
  shopifyConfig.storefrontToken.length > 0;

// Shopify Buy Button SDK CDN URL
export const SHOPIFY_BUY_BUTTON_SDK =
  "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";
