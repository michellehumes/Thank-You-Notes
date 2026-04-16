#!/usr/bin/env node
// Pulls main product images from Etsy listing pages and downloads them to public/shelzy_images/
// Uses og:image meta tag -- no API key needed

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Map: etsy listing ID → product slug
const listingToSlug = {
  // Water Bottles (physical)
  '4427123494': 'personalized-water-bottle',
  '4435252492': 'wedding-water-bottle-set',
  '4465825536': 'bachelorette-party-water-bottles',
  '4428315092': 'kids-personalized-water-bottle',
  '4426781154': 'corporate-bulk-water-bottles',
  '4435264870': 'holiday-water-bottle',
  // Budget + Finance
  '4430861134': 'interactive-wedding-planner-dashboard',  // also wedding
  '4455332835': 'job-search-command-center',
  '4455461292': 'rental-property-income-tracker',
  '4472387217': 'pet-expense-tracker',
  '4472491170': 'co-parenting-schedule-planner',
  '4460558570': 'babys-first-year-milestone-tracker',
  '4455378310': 'student-academic-planner-2026',
  '4455359615': 'teacher-planner-2026',
  '4455352356': 'social-media-planner-2026',
  '4453348355': 'social-media-content-planner',
  '4469948638': 'ugc-creator-media-kit',
  '4455450716': 'kids-chore-chart-routine-tracker',
  '4455371770': 'home-cleaning-organization-planner',
  '4455432592': 'workout-tracker',
  '4455422930': 'weekly-meal-planner',
  '4466832536': 'vacation-trip-planner',
  // Wedding
  '4439536794': 'bridal-shower-planner',
  '4458817296': 'wedding-vendor-comparison-tool',
  '4453351463': 'wedding-planning-checklist-budget',
  '4431620170': 'bachelorette-party-planner',
  '4476200829': 'wedding-planning-bundle',
  '4488636881': 'coastal-bridal-shower-games',
  // Printables + Bundles
  '4434199130': 'bachelorette-scavenger-hunt',
  '4457898606': 'villa-vibes-bachelorette-bundle',
  '4461345391': 'st-patricks-day-kids-activity-bundle',
  '4461340341': 'st-patricks-day-png-bundle',
  '4461552541': '40-day-lent-devotional-activity-bundle',
  '4467420325': 'mothers-day-svg-bundle',
  // Save the Dates
  '4452708398': 'san-jose-skyline-save-the-date',
  '4458588248': 'hillsboro-lighthouse-save-the-date',
  '4452705060': 'philadelphia-skyline-save-the-date',
  '4452707708': 'dallas-skyline-save-the-date',
  '4452708980': 'austin-skyline-save-the-date',
  '4452698201': 'chicago-skyline-save-the-date',
  '4452697625': 'los-angeles-skyline-save-the-date',
  '4452692821': 'nyc-skyline-save-the-date',
  // Other
  '4472597131': 'easter-basket-budget-planner',
  '4485871957': 'graduation-memory-book',
  '4485867310': 'graduation-gift-tracker',
  '4473208227': 'birthday-party-planner',
};

const outputDir = path.join(__dirname, '../public/shelzy_images');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    });
    req.on('error', (err) => { fs.unlinkSync(dest); reject(err); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractOgImage(html) {
  const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return match ? match[1] : null;
}

function slugToFilename(slug) {
  return slug.replace(/-/g, '_') + '.jpg';
}

async function processListing(listingId, slug) {
  const url = `https://www.etsy.com/listing/${listingId}`;
  const filename = slugToFilename(slug);
  const dest = path.join(outputDir, filename);

  // Skip if already downloaded
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log(`  SKIP  ${slug} (already exists)`);
    return { slug, filename, skipped: true };
  }

  try {
    const html = await fetch(url);
    let imgUrl = extractOgImage(html);

    if (!imgUrl) {
      console.log(`  WARN  ${slug}: no og:image found`);
      return { slug, filename: null, error: 'no og:image' };
    }

    // Upgrade to higher resolution if possible
    imgUrl = imgUrl.replace(/il_\d+xN/, 'il_1588xN').replace(/il_\d+x\d+/, 'il_1588xN');

    await downloadFile(imgUrl, dest);
    const size = fs.statSync(dest).size;
    console.log(`   OK   ${slug} → ${filename} (${Math.round(size/1024)}KB)`);
    return { slug, filename, imgUrl };
  } catch (err) {
    console.log(`  ERR   ${slug}: ${err.message}`);
    return { slug, filename: null, error: err.message };
  }
}

async function main() {
  console.log(`\nPulling Etsy product images for ${Object.keys(listingToSlug).length} listings...\n`);

  const entries = Object.entries(listingToSlug);
  const results = [];

  // Process in batches of 3 to avoid rate limiting
  for (let i = 0; i < entries.length; i += 3) {
    const batch = entries.slice(i, i + 3);
    const batchResults = await Promise.all(
      batch.map(([id, slug]) => processListing(id, slug))
    );
    results.push(...batchResults);
    // Small delay between batches
    if (i + 3 < entries.length) await new Promise(r => setTimeout(r, 1000));
  }

  // Output summary + products.ts image path updates
  const successful = results.filter(r => r.filename && !r.skipped);
  const failed = results.filter(r => !r.filename);

  console.log(`\n✓ ${results.filter(r => r.filename).length} images ready`);
  if (failed.length) console.log(`✗ ${failed.length} failed: ${failed.map(r => r.slug).join(', ')}`);

  // Write mapping file for products.ts update
  const mapping = results
    .filter(r => r.filename)
    .map(r => `  "${r.slug}": "/shelzy_images/${r.filename}"`)
    .join(',\n');

  fs.writeFileSync(path.join(__dirname, 'image-mapping.json'),
    JSON.stringify(
      Object.fromEntries(results.filter(r => r.filename).map(r => [r.slug, `/shelzy_images/${r.filename}`])),
      null, 2
    )
  );
  console.log('\nMapping saved to scripts/image-mapping.json');
}

main().catch(console.error);
