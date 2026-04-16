#!/usr/bin/env node
// Updates products.ts: replaces SVG placeholder images with real JPG paths
// for every product that has a downloaded image in public/product_images/

const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '../src/data/products.ts');
const imageDir = path.join(__dirname, '../public/product_images');

// Get all downloaded image slugs
const availableImages = new Set(
  fs.readdirSync(imageDir)
    .filter(f => f.endsWith('.jpg'))
    .map(f => f.replace('.jpg', ''))
);

console.log(`Found ${availableImages.size} downloaded images`);

let content = fs.readFileSync(productsFile, 'utf8');
let updateCount = 0;

// Replace each shelzy_images SVG with product_images JPG where we have the image
// Pattern: slug: "SLUG", followed eventually by images: ["/shelzy_images/shelzy_NN_img01.svg"]
// We process line by line, tracking current slug

const lines = content.split('\n');
let currentSlug = null;

const updated = lines.map(line => {
  // Capture current slug
  const slugMatch = line.match(/^\s+slug:\s+"([^"]+)"/);
  if (slugMatch) {
    currentSlug = slugMatch[1];
  }

  // Replace image if we have a real one for this slug
  if (line.includes('images: ["/shelzy_images/') && currentSlug && availableImages.has(currentSlug)) {
    const newPath = `/product_images/${currentSlug}.jpg`;
    const newLine = line.replace(/images: \["\/shelzy_images\/[^"]+"\]/, `images: ["${newPath}"]`);
    if (newLine !== line) {
      console.log(`  Updated: ${currentSlug} → ${newPath}`);
      updateCount++;
      return newLine;
    }
  }

  return line;
});

fs.writeFileSync(productsFile, updated.join('\n'));
console.log(`\n✓ Updated ${updateCount} product image paths`);
