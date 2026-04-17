"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /download  --  Self-serve digital download portal
//
// After purchasing, customers select their product and click Download to get
// their file from Shopify CDN. No login required -- honor-system for MVP.
//
// Flow:
//   1. Customer completes purchase on Shopify checkout
//   2. Returns to shelzysdesigns.com/download
//   3. Finds their product in the list (or searches)
//   4. Clicks Download -- page calls /api/get-download?productId=...
//   5. Browser receives CDN URL and triggers download
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

// All 52 products that have digital files attached.
// Slug is included so we can link back to the product page.
const DIGITAL_PRODUCTS = [
  { id: "15086039105904", name: "Monthly Budget Tracker", slug: "monthly-budget-tracker", category: "Budget & Finance" },
  { id: "15086039171440", name: "Paycheck Budget Planner", slug: "paycheck-budget-planner", category: "Budget & Finance" },
  { id: "15086039236976", name: "Family Budget Planner", slug: "family-budget-planner", category: "Budget & Finance" },
  { id: "15086039269744", name: "2026 Annual Finance Planner", slug: "2026-annual-budget-planner", category: "Budget & Finance" },
  { id: "15086039335280", name: "Debt Payoff Tracker", slug: "debt-payoff-tracker", category: "Budget & Finance" },
  { id: "15086039368048", name: "Debt Payoff + Savings Tracker", slug: "debt-payoff-savings-tracker", category: "Budget & Finance" },
  { id: "15086039400816", name: "Small Business Planner 2026", slug: "small-business-planner-2026", category: "Business" },
  { id: "15086039433584", name: "Side Hustle Income + Expense Tracker", slug: "side-hustle-income-expense-tracker", category: "Business" },
  { id: "15086039499120", name: "12-Month Side Hustle Log", slug: "12-month-side-hustle-log", category: "Business" },
  { id: "15086039531888", name: "Business Finance + Net Worth Dashboard", slug: "business-finance-net-worth-dashboard", category: "Business" },
  { id: "15086039564656", name: "Etsy Seller Analytics Dashboard", slug: "etsy-seller-analytics-dashboard", category: "Business" },
  { id: "15086039597424", name: "Etsy Seller Profit Calculator", slug: "etsy-seller-profit-calculator", category: "Business" },
  { id: "15086039630192", name: "ADHD Life Dashboard", slug: "adhd-life-dashboard", category: "Life & Wellness" },
  { id: "15086039662960", name: "Project + Goal Tracker", slug: "project-goal-tracker", category: "Life & Wellness" },
  { id: "15086039695728", name: "Moving Day Planner", slug: "moving-day-planner", category: "Life & Wellness" },
  { id: "15086039728496", name: "Vacation Trip Planner", slug: "vacation-trip-planner", category: "Life & Wellness" },
  { id: "15086039794032", name: "Weekly Meal Planner", slug: "weekly-meal-planner", category: "Life & Wellness" },
  { id: "15086039826800", name: "Meal Planner + Auto Grocery List", slug: "meal-planner-auto-grocery-list", category: "Life & Wellness" },
  { id: "15086039859568", name: "Workout Tracker", slug: "workout-tracker", category: "Life & Wellness" },
  { id: "15086039892336", name: "Kids Chore Chart + Routine Tracker", slug: "kids-chore-chart-routine-tracker", category: "Life & Wellness" },
  { id: "15086039925104", name: "Home Cleaning + Organization Planner", slug: "home-cleaning-organization-planner", category: "Life & Wellness" },
  { id: "15086039957872", name: "Student Academic Planner 2026", slug: "student-academic-planner-2026", category: "School & Teaching" },
  { id: "15086039990640", name: "Teacher Planner 2026", slug: "teacher-planner-2026", category: "School & Teaching" },
  { id: "15086040023408", name: "Social Media Planner 2026", slug: "social-media-planner-2026", category: "Business" },
  { id: "15086040056176", name: "Social Media Content Planner", slug: "social-media-content-planner", category: "Business" },
  { id: "15086040088944", name: "UGC Creator Media Kit", slug: "ugc-creator-media-kit", category: "Business" },
  { id: "15086040121712", name: "Rental Property Income Tracker", slug: "rental-property-income-tracker", category: "Budget & Finance" },
  { id: "15086040154480", name: "Pet Expense Tracker", slug: "pet-expense-tracker", category: "Life & Wellness" },
  { id: "15086040187248", name: "Baby Shower Planner", slug: "baby-shower-planner", category: "Wedding & Events" },
  { id: "15086040220016", name: "Co-Parenting Schedule Planner", slug: "co-parenting-schedule-planner", category: "Life & Wellness" },
  { id: "15086040252784", name: "Job Search Command Center", slug: "job-search-command-center", category: "Life & Wellness" },
  { id: "15086040285552", name: "Bridal Shower Planner", slug: "bridal-shower-planner", category: "Wedding & Events" },
  { id: "15086040318320", name: "Wedding Vendor Comparison Tool", slug: "wedding-vendor-comparison-tool", category: "Wedding & Events" },
  { id: "15086040351088", name: "Wedding Budget Tracker", slug: "wedding-budget-tracker", category: "Wedding & Events" },
  { id: "15086040383856", name: "Wedding Planning Checklist + Budget", slug: "wedding-planning-checklist-budget", category: "Wedding & Events" },
  { id: "15086040449392", name: "Wedding Planner Dashboard", slug: "interactive-wedding-planner-dashboard", category: "Wedding & Events" },
  { id: "15086040482160", name: "Bachelorette Party Planner", slug: "bachelorette-party-planner", category: "Wedding & Events" },
  { id: "15086040514928", name: "Graduation Party Planner", slug: "graduation-party-planner", category: "Wedding & Events" },
  { id: "15086040547696", name: "Easter Basket Budget Planner", slug: "easter-basket-budget-planner", category: "Wedding & Events" },
  { id: "15086041071984", name: "Mother's Day Self-Care Planner", slug: "mothers-day-self-care-planner", category: "Wedding & Events" },
  { id: "15086041104752", name: "Teacher Appreciation Gift Tags", slug: "teacher-appreciation-gift-tags", category: "School & Teaching" },
  { id: "15086041137520", name: "Mother's Day Gift Tracker", slug: "mothers-day-gift-tracker", category: "Wedding & Events" },
  { id: "15086041170288", name: "Mother's Day Brunch Party Planner", slug: "mothers-day-brunch-party-planner", category: "Wedding & Events" },
  { id: "15086041203056", name: "Graduation Party Invitation", slug: "graduation-party-invitation", category: "Wedding & Events" },
  { id: "15086041268592", name: "Father's Day Activity Planner", slug: "fathers-day-activity-planner", category: "Wedding & Events" },
  { id: "15086041301360", name: "Wedding Planning Bundle", slug: "wedding-planning-bundle", category: "Wedding & Events" },
  { id: "15086041334128", name: "Coastal Bridal Shower Games", slug: "coastal-bridal-shower-games", category: "Wedding & Events" },
  { id: "15086041366896", name: "Wedding Seating Chart", slug: "wedding-seating-chart", category: "Wedding & Events" },
  { id: "15086041399664", name: "Wedding Day Timeline Card", slug: "wedding-day-timeline-card", category: "Wedding & Events" },
  { id: "15086041432432", name: "Coastal Wedding Welcome Sign", slug: "coastal-wedding-welcome-sign", category: "Wedding & Events" },
  { id: "15086041465200", name: "Wedding Menu Card", slug: "wedding-menu-card", category: "Wedding & Events" },
  { id: "15086041530736", name: "Bachelorette Weekend Itinerary", slug: "bachelorette-weekend-itinerary", category: "Wedding & Events" },
] as const;

type DownloadState = "idle" | "loading" | "success" | "error";

interface ProductRowProps {
  id: string;
  name: string;
  slug: string;
  category: string;
}

function ProductRow({ id, name, slug, category }: ProductRowProps) {
  const [state, setState] = useState<DownloadState>("idle");
  const [error, setError] = useState("");

  async function handleDownload() {
    setState("loading");
    setError("");
    try {
      const res = await fetch(`/api/get-download?productId=${id}`);
      if (!res.ok) throw new Error("File not found");
      const { fileUrl, filename } = await res.json();

      // Trigger browser download via hidden anchor
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setState("success");
      // Reset after 4s so button is usable again
      setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("error");
      setError("Something went wrong. Please try again or contact support.");
      setTimeout(() => { setState("idle"); setError(""); }, 5000);
    }
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-light-gray transition group">
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${slug}`}
          className="font-heading font-semibold text-charcoal group-hover:text-pink transition text-sm md:text-base truncate block"
        >
          {name}
        </Link>
        <span className="text-xs text-text-light">{category}</span>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
      <button
        onClick={handleDownload}
        disabled={state === "loading"}
        className={`ml-4 flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition ${
          state === "success"
            ? "bg-teal/10 text-teal"
            : state === "error"
            ? "bg-red-100 text-red-600"
            : "bg-pink text-white hover:bg-pink-hover disabled:opacity-60"
        }`}
      >
        {state === "loading" ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            <span>Fetching...</span>
          </>
        ) : state === "success" ? (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Downloaded!</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function DownloadPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return DIGITAL_PRODUCTS;
    return DIGITAL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [search]);

  // Group by category
  const categories = useMemo(() => {
    const map = new Map<string, typeof DIGITAL_PRODUCTS[number][]>();
    for (const p of filtered) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[860px] px-6 py-12">
          {/* Page header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-teal/10 text-teal text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Digital Download Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-charcoal mb-3">
              Access Your Downloads
            </h1>
            <p className="text-text-light text-base max-w-lg mx-auto">
              Find the product you purchased below and click Download. Your file opens immediately -- no account needed.
            </p>
          </div>

          {/* Info banner */}
          <div className="bg-orange/10 border border-orange/20 rounded-xl px-5 py-4 mb-8 flex gap-3">
            <svg className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="text-sm text-charcoal">
              <strong>Just purchased?</strong> Your download is ready instantly. Files are also sent via your Shopify order confirmation email.
              If you need help, email <a href="mailto:hello@shelzysdesigns.com" className="text-pink hover:underline">hello@shelzysdesigns.com</a>.
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search your product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-mid-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink/30 focus:border-pink transition"
            />
          </div>

          {/* Product list grouped by category */}
          {categories.size === 0 ? (
            <div className="text-center text-text-light py-12">
              No products found matching &ldquo;{search}&rdquo;
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {Array.from(categories.entries()).map(([category, products]) => (
                <div key={category}>
                  <h2 className="text-xs font-bold font-heading text-text-light uppercase tracking-widest mb-2 px-4">
                    {category}
                  </h2>
                  <div className="bg-white border border-mid-gray/50 rounded-2xl overflow-hidden divide-y divide-mid-gray/40">
                    {products.map((p) => (
                      <ProductRow key={p.id} {...p} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <p className="text-center text-xs text-text-light mt-10">
            Looking for something else?{" "}
            <Link href="/shop" className="text-pink hover:underline">
              Browse all products
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-pink hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
