"use client";

// ─────────────────────────────────────────────
// ShopifyBuyButton -- Phase 1 checkout component
// ─────────────────────────────────────────────
// Renders a Shopify-powered "Add to Cart" button that opens the hosted
// Shopify cart/checkout modal. Gated on isShopifyEnabled() so nothing
// renders until env vars are set.
//
// Usage:
//   <ShopifyBuyButton variantId={product.shopifyVariantId} />
//
// Expects the Shopify Buy Button SDK to be loaded once in app/layout.tsx.

import { useEffect, useRef } from "react";
import { isShopifyEnabled, shopifyConfig } from "@/lib/shopify";

interface ShopifyBuyButtonProps {
  productId: string;
  variantId: string;
  label?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ShopifyBuy?: any;
  }
}

export default function ShopifyBuyButton({
  productId,
  variantId,
  label = "Add to cart",
}: ShopifyBuyButtonProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isShopifyEnabled() || !mountRef.current) return;

    let cancelled = false;

    const mount = () => {
      if (cancelled || !window.ShopifyBuy || !mountRef.current) return;

      const client = window.ShopifyBuy.buildClient({
        domain: shopifyConfig.domain,
        storefrontAccessToken: shopifyConfig.storefrontToken,
      });

      window.ShopifyBuy.UI.onReady(client).then((ui: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ui as any).createComponent("product", {
          id: productId,
          node: mountRef.current,
          moneyFormat: "%24%7B%7Bamount%7D%7D",
          options: {
            product: {
              contents: { img: false, title: false, price: false },
              text: { button: label },
              styles: {
                button: {
                  "background-color": "#E91E63",
                  "font-family": "Inter, sans-serif",
                  "font-weight": "600",
                  ":hover": { "background-color": "#C2185B" },
                  "border-radius": "9999px",
                  padding: "12px 24px",
                },
              },
            },
            cart: {
              styles: {
                button: { "background-color": "#E91E63" },
              },
              popup: false,
            },
            toggle: {
              styles: {
                toggle: { "background-color": "#E91E63" },
              },
            },
          },
        });
      });
    };

    if (window.ShopifyBuy) {
      mount();
    } else {
      const interval = setInterval(() => {
        if (window.ShopifyBuy) {
          clearInterval(interval);
          mount();
        }
      }, 200);
      setTimeout(() => clearInterval(interval), 10000);
    }

    return () => {
      cancelled = true;
    };
  }, [productId, variantId, label]);

  if (!isShopifyEnabled()) return null;
  return <div ref={mountRef} />;
}
