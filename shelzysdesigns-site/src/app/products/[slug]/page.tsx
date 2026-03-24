import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "@/components/ProductCard";
import ProductTabs from "@/components/ProductTabs";
import {
  products,
  getProductBySlug,
  getProductsByCategory,
  getAllCategories,
} from "@/data/products";

// Blog back-links: maps product slug → relevant blog article(s)
const productBlogLinks: Record<string, { href: string; title: string }[]> = {
  "monthly-budget-tracker": [
    { href: "/blog/best-budget-spreadsheet-templates-2026", title: "Best Budget Spreadsheet Templates for 2026 (Free and Paid Compared)" },
  ],
  "paycheck-budget-planner": [
    { href: "/blog/best-budget-spreadsheet-templates-2026", title: "Best Budget Spreadsheet Templates for 2026 (Free and Paid Compared)" },
  ],
  "family-budget-planner": [
    { href: "/blog/best-budget-spreadsheet-templates-2026", title: "Best Budget Spreadsheet Templates for 2026 (Free and Paid Compared)" },
  ],
  "interactive-wedding-planner-dashboard": [
    { href: "/blog/best-wedding-planning-spreadsheet-templates", title: "The Best Wedding Planning Spreadsheet Templates (From a Real Bride)" },
  ],
  "wedding-budget-tracker": [
    { href: "/blog/best-wedding-planning-spreadsheet-templates", title: "The Best Wedding Planning Spreadsheet Templates (From a Real Bride)" },
  ],
  "wedding-vendor-comparison-tool": [
    { href: "/blog/best-wedding-planning-spreadsheet-templates", title: "The Best Wedding Planning Spreadsheet Templates (From a Real Bride)" },
  ],
  "bridal-shower-planner": [
    { href: "/blog/best-wedding-planning-spreadsheet-templates", title: "The Best Wedding Planning Spreadsheet Templates (From a Real Bride)" },
  ],
  "adhd-life-dashboard": [
    { href: "/blog/adhd-planner-templates-adults", title: "ADHD Planner Templates That Actually Work for Adult Brains" },
  ],
  "project-goal-tracker": [
    { href: "/blog/adhd-planner-templates-adults", title: "ADHD Planner Templates That Actually Work for Adult Brains" },
  ],
  "small-business-planner-2026": [
    { href: "/blog/small-business-planner-spreadsheet", title: "Small Business Planner Spreadsheet: Everything You Need to Track in One Place" },
  ],
  "side-hustle-income-expense-tracker": [
    { href: "/blog/small-business-planner-spreadsheet", title: "Small Business Planner Spreadsheet: Everything You Need to Track in One Place" },
  ],
  "etsy-seller-analytics-dashboard": [
    { href: "/blog/etsy-seller-dashboard-templates", title: "Etsy Seller Dashboard Templates: Track Your Shop Like a Pro" },
    { href: "/blog/small-business-planner-spreadsheet", title: "Small Business Planner Spreadsheet: Everything You Need to Track in One Place" },
  ],
  "etsy-seller-profit-calculator": [
    { href: "/blog/etsy-seller-dashboard-templates", title: "Etsy Seller Dashboard Templates: Track Your Shop Like a Pro" },
  ],
};

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  const categoryName = getCategoryName(product.category);
  const metaTitle = `${product.name} | ${categoryName} -- Shelzy's Designs`;
  const metaDesc = product.description.length > 155
    ? product.description.slice(0, 152) + "..."
    : product.description;
  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "website",
      siteName: "Shelzy's Designs",
    },
  };
}

function getCategoryName(categorySlug: string): string {
  const categories = getAllCategories();
  const cat = categories.find((c) => c.slug === categorySlug);
  return cat ? cat.name : categorySlug;
}

function getCompatibilityLabels(
  compatibility: "excel" | "sheets" | "both" | "pdf" | "physical"
): string[] {
  switch (compatibility) {
    case "both":
      return ["Excel", "Google Sheets"];
    case "excel":
      return ["Excel"];
    case "sheets":
      return ["Google Sheets"];
    case "pdf":
      return ["PDF"];
    case "physical":
      return ["Permanent Sublimation Print", "Free Personalization"];
  }
}

function StarIcon() {
  return (
    <svg
      className="w-5 h-5 text-orange"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categoryName = getCategoryName(product.category);
  const compatLabels = getCompatibilityLabels(product.compatibility);

  const relatedProducts = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const initials = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Product schema for rich snippets
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images[0] || undefined,
    url: `https://shelzysdesigns.com/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Shelzy's Designs",
    },
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://shelzysdesigns.com/products/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "Shelzy's Designs",
      },
    },
    category: categoryName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "47",
    },
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://shelzysdesigns.com/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://shelzysdesigns.com/shop" },
      { "@type": "ListItem", position: 3, name: categoryName, item: `https://shelzysdesigns.com/shop?category=${product.category}` },
      { "@type": "ListItem", position: 4, name: product.name },
    ],
  };

  return (
    <>
      <Header />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-text-light mb-8">
            <Link href="/" className="hover:text-charcoal transition">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-charcoal transition">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/shop?category=${product.category}`}
              className="hover:text-charcoal transition"
            >
              {categoryName}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal">{product.name}</span>
          </nav>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            {/* LEFT: Image Gallery */}
            <div>
              <div className="aspect-square bg-light-gray rounded-lg overflow-hidden mb-4">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-heading font-bold text-5xl text-mid-gray select-none">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              {/* Thumbnail strip — show additional images when available */}
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className={`aspect-square bg-light-gray rounded-lg overflow-hidden ${
                      i === 0 ? "ring-2 ring-pink" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div>
              <h1 className="text-3xl font-bold font-heading text-charcoal mb-3">
                {product.name}
              </h1>

              {/* Star rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <span className="text-text-light text-sm">(47 reviews)</span>
              </div>

              {/* Price */}
              <p className="text-2xl font-bold text-charcoal mb-4">
                ${product.price.toFixed(2)}
              </p>

              {/* Compatibility badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {compatLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-block bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Buy Now button — Lemon Squeezy overlay when URL set, Etsy fallback */}
              {(() => {
                const isPhysical = product.compatibility === "physical";
                const hasLsUrl =
                  product.lemonSqueezyUrl &&
                  product.lemonSqueezyUrl !== "#";
                const buyUrl = hasLsUrl
                  ? product.lemonSqueezyUrl
                  : product.etsyUrl;
                return (
                  <a
                    href={buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full bg-pink text-white font-heading font-semibold text-center py-4 rounded-lg hover:bg-pink-hover transition mb-3${hasLsUrl && !isPhysical ? " lemonsqueezy-button" : ""}`}
                  >
                    {isPhysical
                      ? `Shop on Etsy — $${product.price.toFixed(2)}`
                      : hasLsUrl
                      ? `Buy Now — $${product.price.toFixed(2)}`
                      : `Shop on Etsy — $${product.price.toFixed(2)}`}
                  </a>
                );
              })()}

              {/* Fulfillment note */}
              <div className="flex items-center justify-center gap-2 text-text-light text-sm mb-6">
                {product.compatibility === "physical" ? (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span>Ships in 3-5 Business Days</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Instant Download</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-text-light leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Tab section */}
          <div className="mb-16">
            <ProductTabs
              category={product.category}
              compatibility={product.compatibility}
              productName={product.name}
            />
          </div>

          {/* Cross-sell section */}
          {relatedProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold font-heading text-charcoal mb-8 text-center">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* From the Blog */}
          {productBlogLinks[product.slug] && (
            <div className="mb-16">
              <h2 className="text-xl font-bold font-heading text-charcoal mb-4">
                From the Blog
              </h2>
              <div className="flex flex-col gap-3">
                {productBlogLinks[product.slug].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-4 bg-light-gray hover:bg-mid-gray/40 rounded-xl px-6 py-4 transition group"
                  >
                    <span className="text-pink text-xl">✦</span>
                    <span className="font-heading font-semibold text-charcoal group-hover:text-pink transition text-sm md:text-base">
                      {link.title}
                    </span>
                    <svg
                      className="ml-auto w-4 h-4 text-text-light group-hover:text-pink transition flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <TrustBadges />
        </div>
      </main>

      <Footer />
    </>
  );
}
