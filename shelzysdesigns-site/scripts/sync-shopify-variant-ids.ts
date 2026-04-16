// ─────────────────────────────────────────────
// Sync Shopify Variant IDs → products.ts
// ─────────────────────────────────────────────
// Fetches all products from the public Shopify storefront API
// (no auth token required) and injects shopifyProductId +
// shopifyVariantId into each matching entry in products.ts.
//
// Run:
//   npx tsx scripts/sync-shopify-variant-ids.ts

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SHOPIFY_STORE = "shelzys-designs.myshopify.com";
const PRODUCTS_TS = join(__dirname, "../src/data/products.ts");

interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  sku: string;
}

interface ShopifyProduct {
  id: number;
  handle: string;
  title: string;
  variants: ShopifyVariant[];
}

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let page = 1;
  while (true) {
    const url = `https://${SHOPIFY_STORE}/products.json?limit=250&page=${page}`;
    console.log(`  Fetching page ${page}: ${url}`);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${url}`);
    const data = (await resp.json()) as { products: ShopifyProduct[] };
    if (!data.products || data.products.length === 0) break;
    all.push(...data.products);
    if (data.products.length < 250) break;
    page++;
  }
  return all;
}

async function main() {
  console.log("Fetching products from Shopify storefront...");
  const products = await fetchAllProducts();
  console.log(`  Found ${products.length} products in Shopify`);

  // Build map: handle → { productId, variantId }
  const shopifyMap: Record<string, { productId: string; variantId: string }> = {};
  for (const product of products) {
    const handle = product.handle.toLowerCase().trim();
    if (!handle || !product.variants?.[0]) continue;
    shopifyMap[handle] = {
      productId: String(product.id),
      variantId: String(product.variants[0].id),
    };
  }

  console.log(`  Mapped ${Object.keys(shopifyMap).length} handles`);

  let ts = readFileSync(PRODUCTS_TS, "utf8");
  let patched = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [handle, ids] of Object.entries(shopifyMap)) {
    if (!ids.variantId) continue;

    const hasSlug =
      ts.includes(`slug: "${handle}"`) || ts.includes(`slug: '${handle}'`);

    if (!hasSlug) {
      notFound++;
      continue;
    }

    // Skip if already patched with this variant ID
    if (ts.includes(`shopifyVariantId: "${ids.variantId}"`)) {
      skipped++;
      continue;
    }

    // Find the product block for this slug and inject before its closing `},`
    const slugMarker = `slug: "${handle}"`;
    const idx = ts.indexOf(slugMarker);
    if (idx === -1) { notFound++; continue; }

    // Find the closing `  },` for this product block
    const afterSlug = ts.indexOf("  },", idx);
    if (afterSlug === -1) { notFound++; continue; }

    // Remove any existing (stale) shopify IDs before injecting fresh ones
    const blockStart = ts.lastIndexOf("  {", idx);
    if (blockStart !== -1) {
      const block = ts.slice(blockStart, afterSlug);
      const cleaned = block
        .replace(/\n\s+shopifyProductId:[^\n]+/g, "")
        .replace(/\n\s+shopifyVariantId:[^\n]+/g, "");
      ts = ts.slice(0, blockStart) + cleaned + ts.slice(afterSlug);
    }

    // Re-find closing brace after cleanup
    const newIdx = ts.indexOf(`slug: "${handle}"`);
    const newAfterSlug = ts.indexOf("  },", newIdx);
    if (newAfterSlug === -1) { notFound++; continue; }

    const injection = `    shopifyProductId: "${ids.productId}",\n    shopifyVariantId: "${ids.variantId}",\n`;
    ts = ts.slice(0, newAfterSlug) + injection + ts.slice(newAfterSlug);
    patched++;
  }

  writeFileSync(PRODUCTS_TS, ts, "utf8");

  console.log(`\n✓ Patched:    ${patched} products`);
  console.log(`  Skipped:    ${skipped} (already had correct variant IDs)`);
  console.log(`  Not found:  ${notFound} (Amazon/physical products -- expected)`);
  console.log("\nNext steps:");
  console.log("  1. npx next build  (verify no errors)");
  console.log("  2. Set NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in Vercel env vars");
  console.log("  3. Set NEXT_PUBLIC_SHOPIFY_CHECKOUT_ENABLED=true in Vercel env vars");
  console.log("  4. npx vercel deploy --prod");
}

main().catch((err) => { console.error(err); process.exit(1); });
