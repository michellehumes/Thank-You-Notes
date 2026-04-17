/**
 * Lemon Squeezy Product Creator
 * Creates all 40 digital products in LS and outputs checkout URLs.
 *
 * Usage:
 *   LS_API_KEY=your_api_key LS_STORE_ID=your_store_id node scripts/create-ls-products.mjs
 *
 * Get API key: https://app.lemonsqueezy.com/settings/api
 * Get Store ID: visible in URL at https://app.lemonsqueezy.com/stores
 */

const API_KEY = process.env.LS_API_KEY;
const STORE_ID = process.env.LS_STORE_ID;

if (!API_KEY || !STORE_ID) {
  console.error("Missing env vars. Run as:");
  console.error("  LS_API_KEY=xxx LS_STORE_ID=yyy node scripts/create-ls-products.mjs");
  process.exit(1);
}

// All 40 products to create (name, price in cents)
const PRODUCTS = [
  // Tier 1 -- highest priority
  { name: "Paycheck Budget Planner", price: 599 },
  { name: "Digital Cash Stuffing System", price: 599 },
  { name: "Family Budget Planner", price: 599 },
  { name: "2026 Annual Budget Planner", price: 599 },
  { name: "Debt Payoff + Savings Tracker", price: 599 },
  { name: "Small Business Planner 2026", price: 799 },
  { name: "ADHD Life Dashboard", price: 799 },
  { name: "Interactive Wedding Planner Dashboard", price: 999 },

  // Budget + Finance
  { name: "Rental Property Income Tracker", price: 599 },
  { name: "Pet Expense Tracker", price: 599 },

  // Business Tools
  { name: "Side Hustle Income + Expense Tracker", price: 599 },
  { name: "12-Month Side Hustle Log", price: 599 },
  { name: "Business Finance + Net Worth Dashboard", price: 799 },
  { name: "Etsy Seller Analytics Dashboard", price: 799 },
  { name: "Etsy Seller Profit Calculator", price: 599 },
  { name: "Social Media Planner 2026", price: 599 },
  { name: "Social Media Content Planner", price: 599 },
  { name: "UGC Creator Media Kit", price: 599 },

  // Productivity + Life
  { name: "Project + Goal Tracker", price: 599 },
  { name: "Moving Day Planner", price: 599 },
  { name: "Meal Planner + Auto Grocery List", price: 599 },
  { name: "Workout Tracker", price: 599 },
  { name: "Kids Chore Chart + Routine Tracker", price: 599 },
  { name: "Home Cleaning + Organization Planner", price: 599 },
  { name: "Baby's First Year Milestone Tracker", price: 599 },
  { name: "Co-Parenting Schedule Planner", price: 599 },
  { name: "Job Search Command Center", price: 799 },

  // Education
  { name: "Student Academic Planner 2026", price: 599 },
  { name: "Teacher Planner 2026", price: 599 },

  // Wedding
  { name: "Bridal Shower Planner", price: 599 },
  { name: "Wedding Vendor Comparison Tool", price: 599 },
  { name: "Wedding Planning Checklist + Budget", price: 799 },

  // Party + Events
  { name: "Graduation Party Planner", price: 599 },
  { name: "Easter Basket Budget Planner", price: 399 },

  // Printables + Bundles
  { name: "Bachelorette Scavenger Hunt", price: 399 },
  { name: "Villa Vibes Bachelorette Bundle", price: 999 },
  { name: "St. Patrick's Day Kids Activity Bundle", price: 499 },
  { name: "St. Patrick's Day PNG Bundle", price: 399 },
  { name: "40-Day Lent Devotional Activity Bundle", price: 499 },
  { name: "Mother's Day SVG Bundle", price: 399 },
];

async function lsRequest(method, path, body) {
  const res = await fetch(`https://api.lemonsqueezy.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LS API ${res.status}: ${text}`);
  }

  return res.json();
}

async function createProduct(name, price) {
  // Step 1: Create product
  const productRes = await lsRequest("POST", "/products", {
    data: {
      type: "products",
      attributes: {
        name,
        description: `${name} -- digital download spreadsheet template`,
      },
      relationships: {
        store: {
          data: { type: "stores", id: String(STORE_ID) },
        },
      },
    },
  });

  const productId = productRes.data.id;

  // Step 2: Create variant (sets price + delivery type)
  const variantRes = await lsRequest("POST", "/variants", {
    data: {
      type: "variants",
      attributes: {
        name: "Default",
        price,
        is_subscription: false,
        pay_what_you_want: false,
        description: "",
      },
      relationships: {
        product: {
          data: { type: "products", id: String(productId) },
        },
      },
    },
  });

  const variantId = variantRes.data.id;

  return {
    name,
    productId,
    variantId,
    checkoutUrl: `https://shelzysdesigns.lemonsqueezy.com/checkout/buy/${variantId}`,
  };
}

async function main() {
  console.log(`Creating ${PRODUCTS.length} products in Lemon Squeezy...\n`);

  const results = [];
  const errors = [];

  for (const { name, price } of PRODUCTS) {
    try {
      process.stdout.write(`  Creating: ${name}...`);
      const result = await createProduct(name, price);
      results.push(result);
      console.log(` DONE (variant ${result.variantId})`);

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
      errors.push({ name, error: err.message });
    }
  }

  console.log("\n\n=== RESULTS ===\n");

  // Output as products.ts update snippet
  console.log("// Paste these into products.ts (search for each name):\n");
  for (const r of results) {
    console.log(`// ${r.name}`);
    console.log(`lemonSqueezyUrl: "${r.checkoutUrl}",`);
    console.log();
  }

  // Output JSON for programmatic update
  const outputPath = "./scripts/ls-product-ids.json";
  const { writeFile } = await import("fs/promises");
  await writeFile(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nFull results saved to ${outputPath}`);

  if (errors.length > 0) {
    console.log(`\n${errors.length} errors:`);
    errors.forEach((e) => console.log(`  - ${e.name}: ${e.error}`));
  }

  console.log(`\nCreated ${results.length}/${PRODUCTS.length} products successfully.`);
}

main().catch(console.error);
