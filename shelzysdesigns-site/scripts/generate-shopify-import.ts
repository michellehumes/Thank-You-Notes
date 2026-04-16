// ─────────────────────────────────────────────
// Generate Shopify bulk import CSV from products.ts
// ─────────────────────────────────────────────
// Produces two files:
//   scripts/output/shopify-products-digital.csv   (76 digital templates)
//   scripts/output/shopify-products-physical.csv  (6 physical POD items)
//
// Usage:
//   npx tsx scripts/generate-shopify-import.ts
//
// The physical CSV still requires manual POD-provider wiring (Printify/Printful)
// after import. The digital CSV is upload-ready; attach files via the Shopify
// Digital Downloads app after import.

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { products, type Product } from "../src/data/products";

const OUTPUT_DIR = join(__dirname, "output");
mkdirSync(OUTPUT_DIR, { recursive: true });

// Shopify Product CSV column order (official)
const HEADERS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "SEO Title",
  "SEO Description",
  "Status",
];

const SITE_ORIGIN = "https://shelzysdesigns.com";

function esc(value: string | number | boolean): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(p: Product): string[] {
  const isPhysical = p.compatibility === "physical";
  const imageUrl = p.images[0] ? `${SITE_ORIGIN}${p.images[0]}` : "";

  return [
    p.slug, // Handle
    p.name, // Title
    p.description, // Body (HTML)
    "Shelzy's Designs", // Vendor
    isPhysical ? "Home & Garden > Kitchen & Dining > Tableware > Drinkware" : "Software > Digital Goods", // Product Category
    isPhysical ? "Personalized Drinkware" : "Digital Template", // Type
    p.tags.join(", "), // Tags
    "TRUE", // Published
    "Title", // Option1 Name
    "Default Title", // Option1 Value
    `SD-${p.id}`, // Variant SKU
    isPhysical ? "500" : "0", // Variant Grams
    isPhysical ? "shopify" : "", // Variant Inventory Tracker
    isPhysical ? "100" : "", // Variant Inventory Qty
    "continue", // Variant Inventory Policy
    isPhysical ? "manual" : "manual", // Variant Fulfillment Service
    p.price.toFixed(2), // Variant Price
    "", // Variant Compare At Price
    isPhysical ? "TRUE" : "FALSE", // Variant Requires Shipping
    "TRUE", // Variant Taxable
    imageUrl, // Image Src
    "1", // Image Position
    p.name, // Image Alt Text
    p.name, // SEO Title
    p.description.slice(0, 160), // SEO Description
    "active", // Status
  ].map(esc);
}

const digital = products.filter((p) => p.compatibility !== "physical");
const physical = products.filter((p) => p.compatibility === "physical");

function writeCsv(filename: string, rows: Product[]) {
  const lines = [HEADERS.map(esc).join(",")];
  for (const p of rows) lines.push(row(p).join(","));
  const path = join(OUTPUT_DIR, filename);
  writeFileSync(path, lines.join("\n"), "utf8");
  console.log(`  ✓ ${path} (${rows.length} products)`);
}

console.log("Generating Shopify bulk import CSVs...");
writeCsv("shopify-products-digital.csv", digital);
writeCsv("shopify-products-physical.csv", physical);
console.log(`\nDone. Import digital first via Shopify Admin → Products → Import.`);
console.log(`Then attach files via Digital Downloads app.`);
console.log(`Then wire physical products through your POD provider.`);
