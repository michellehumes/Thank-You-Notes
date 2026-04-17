# Phase 0 -- Shopify Admin Audit Handoff (Claude in Chrome)

**Who runs this:** Claude in Chrome, authenticated as Michelle in Shopify admin
**Output:** Markdown audit report saved to `/Users/michellehumes/shelzysdesigns-site/docs/shopify-migration/02-shopify-audit-results.md`
**Time:** ~10 minutes

---

## READY-TO-PASTE PROMPT FOR CLAUDE IN CHROME

```
You are auditing Michelle's Shopify admin to prepare shelzysdesigns.com for direct checkout integration. Navigate to https://admin.shopify.com and use her existing authenticated session. Produce a markdown report covering every section below. Be specific -- include counts, plan names, dollar amounts, app names with versions, and exact SKUs. If a section has nothing, write "none" -- do not skip.

Save the final report to:
/Users/michellehumes/shelzysdesigns-site/docs/shopify-migration/02-shopify-audit-results.md

## 1. Store basics
- Store name and .myshopify.com URL
- Current plan (Basic / Shopify / Advanced / Lite / other) and monthly cost
- Billing status (current / past due)
- Primary domain + any custom domains mapped
- Store currency
- Store timezone

## 2. Products
- Total product count (Products tab)
- Breakdown: active vs. draft vs. archived
- List the first 30 active products: title, SKU, price, inventory qty, product type
- Are any products "digital" (no shipping required)? List them.
- Are any products connected to a POD app (Printify / Printful / Gelato / SPOD)? List which provider and how many.

## 3. Apps installed
- Full list of installed apps with name, developer, and monthly cost
- Highlight specifically: any POD app, any Digital Downloads app, any product-options/personalization app, any email tool

## 4. Payments
- Which payment providers are enabled (Shopify Payments, PayPal, Stripe, other)
- Is Shopify Payments activated and able to accept live charges? (look for "Accept payments" status)
- Payout bank account on file: yes/no (do NOT reveal account numbers)

## 5. Orders
- Total orders all-time
- Orders in last 30 days
- Orders in last 7 days
- Most recent order date
- Any unfulfilled orders older than 72 hours? List them.

## 6. Customers + Email
- Total customer count
- Email marketing tool: Shopify Email / Klaviyo / Mailchimp / other / none
- Email subscriber count

## 7. Shipping + Tax
- Shipping zones configured (list zones + rate count per zone)
- Tax settings: automatic tax (Shopify Tax) enabled? Which states registered?

## 8. Checkout settings
- Checkout language
- Accelerated checkout options enabled (Shop Pay / Apple Pay / Google Pay / PayPal)
- Post-purchase redirect URL (if any)
- Order confirmation email customized? yes/no

## 9. Storefront API access
- Navigate to Settings → Apps and sales channels → Develop apps
- Is there an existing custom app with Storefront API access? If yes, list its name.
- Do NOT create one yet -- just report whether one exists.

## 10. Sales channels
- Active sales channels (Online Store, Facebook, Instagram, Shop app, Google, etc.)

## 11. Red flags
Anything that looks broken, abandoned, misconfigured, duplicate, test data, or expensive-but-unused. Call it out.

## 12. Recommendations summary
Based on what you found, give Michelle a 5-bullet summary:
- Keep or cancel current plan?
- Which POD app to standardize on?
- Is the product catalog usable as-is or does it need a rebuild?
- Are payments live-ready?
- Biggest blocker to launching direct checkout in the next 7 days?

When finished, save the report to the path above and reply in this chat with a 3-sentence summary + the full file path.
```

---

## What Michelle does

1. Open Claude in Chrome extension
2. Paste the prompt above
3. Let it run (~10 minutes)
4. When it returns the summary, come back to Claude Code and say "audit done" -- Claude Code will read the results file and continue Phase 1.
