# ShelzysDesigns.com -- Shopify Direct Checkout Migration

**Owner:** Michelle
**Started:** 2026-04-16
**Goal:** Enable direct checkout on shelzysdesigns.com without rebuilding fulfillment/tax/digital-delivery from scratch.
**Architecture:** Next.js frontend (shelzysdesigns.com) + Shopify backend (checkout, POD, digital downloads, tax, orders)

---

## Phase 1 -- Buy Buttons (TARGET: live checkout within 7 days)

**Why first:** Ships working checkout in days, not weeks. Proves unit economics before deeper integration.

### Architecture
- Shopify hosts: products, inventory, checkout, payments, POD, digital delivery, orders
- Next.js hosts: marketing, SEO, product browsing
- Integration: Shopify Buy Button JS embedded per product card. Opens Shopify checkout modal. Customer never leaves the brand experience more than needed.

### Catalog scope at launch
- 82 products total in `src/data/products.ts`
- 6 physical (water bottles + personalized goods) -- POD routed through Printify or Printful
- 76 digital templates -- Shopify Digital Downloads app

### Required Shopify setup
1. Plan: Shopify Basic ($39/mo) -- NOT Shopify Lite (Lite is retired)
2. Apps:
   - **Printify** or **Printful** (POD for physical) -- pick one
   - **Shopify Digital Downloads** (free, first-party) -- delivers files post-purchase
   - **Infinite Options by ShopPad** (free tier) -- custom name field on water bottles
3. Payments: Shopify Payments (cheapest) OR Stripe. Verify live.
4. Tax: Shopify Tax auto-setup (US nexus = PA only unless Michelle confirms otherwise)
5. Domain: keep shelzysdesigns.com pointed at Vercel. Shopify checkout runs on `checkout.shelzysdesigns.com` subdomain (optional polish) or default `shop.shelzysdesigns.com`.

### Catalog sync (one-time)
Each product in `products.ts` needs a matching Shopify product. We add a `shopifyProductId` and `shopifyVariantId` field to the `Product` interface. Build the Buy Button against variant ID.

- Digital templates: bulk CSV import into Shopify. Attach the PDF/Excel/Sheets file to each via Digital Downloads app.
- Physical: manual setup in Printify/Printful, then imported to Shopify.

### Code changes needed
1. **`src/data/products.ts`** -- add `shopifyVariantId?: string` field to interface
2. **`src/components/ProductCard.tsx`** -- when `shopifyVariantId` present, render "Add to Cart" button instead of Etsy link
3. **`src/components/ShopifyBuyButton.tsx`** -- new component, loads Shopify Buy Button SDK once, renders cart
4. **`src/lib/shopify.ts`** -- config (shop domain, storefront access token)
5. **`src/app/layout.tsx`** -- load Shopify BUY SDK script globally, mount persistent cart icon in header

### Cart UX
- Persistent cart icon in Header (top right)
- Add to Cart opens slide-out drawer (Shopify default)
- Checkout button in drawer goes to Shopify-hosted checkout
- Post-purchase: Shopify "thank you" page, then customer returned to shelzysdesigns.com/thank-you (configured in Shopify checkout settings)

### Launch gate
- [ ] Shopify audit complete (Phase 0, below)
- [ ] All 82 products loaded in Shopify with matching SKUs to `products.ts`
- [ ] POD app configured + 1 physical test order placed at cost
- [ ] 1 digital test purchase -- confirm auto-delivery email works
- [ ] Storefront access token generated
- [ ] Next.js changes deployed behind feature flag or hidden CTA
- [ ] Two real test purchases (1 physical, 1 digital) on live site, refunded via Shopify
- [ ] Flip switch: ProductCards prefer Shopify over Etsy for products with variant IDs

---

## Phase 2 -- Storefront API (post-launch, if Phase 1 converts)

Upgrade path only if Phase 1 proves direct checkout converts. Replaces Buy Button embed with native Next.js cart using Shopify Storefront API (GraphQL). Fully on-brand. No modal. Adds ~1-2 weeks of work.

Decision point: after 30 days of Phase 1 sales data.

---

## Phase 0 -- Shopify Admin Audit (BLOCKING -- needs Michelle + Claude in Chrome)

Cannot proceed until we know what's already in Shopify. See `01-shopify-audit-handoff.md` for the ready-to-paste prompt for Claude in Chrome.

---

## Cost summary

| Line item | Monthly |
|---|---|
| Shopify Basic | $39 |
| Printify / Printful Free Plan | $0 |
| Digital Downloads app | $0 |
| Infinite Options free tier | $0 |
| **Total** | **$39/mo** |

Per-transaction:
- Shopify Payments: 2.9% + $0.30 per sale (vs. Etsy ~10.5% all-in)
- Printify/Printful: cost of goods + shipping (unchanged)

Break-even vs. Etsy at ~5 sales/mo of average $15 order.

---

## Risk register

1. **Physical POD provider mismatch** -- If current Etsy physical products use a different POD supplier, SKUs won't match. Mitigation: audit first, pick one provider, re-upload designs if needed.
2. **Digital file delivery reliability** -- Customers expect instant email. Test before launch.
3. **Tax nexus** -- Confirm PA-only. If Michelle has nexus elsewhere (e.g., Shopify auto-detects based on ship-to), she may owe registration in other states at volume. Low risk at current scale.
4. **Brand continuity at checkout** -- Shopify checkout is branded but not pixel-perfect. Buy Button modal keeps customer on shelzysdesigns.com visually; full redirect does not. Use modal.
