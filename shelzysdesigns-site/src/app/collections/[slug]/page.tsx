import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { products, getAllCategories } from "@/data/products";

// Virtual collections that combine multiple categories
const virtualCollections: Record<
  string,
  { name: string; description: string; metaDescription: string; categorySlugs: string[] }
> = {
  templates: {
    name: "Templates",
    description:
      "Spreadsheet templates for budgets, business, productivity, and education",
    metaDescription:
      "Browse 40+ instant-download spreadsheet templates for budgeting, business, productivity, and education. Works in Excel and Google Sheets. Download instantly and start today.",
    categorySlugs: ["budget-finance", "business", "productivity", "education"],
  },
  planners: {
    name: "Planners",
    description: "Wedding and event planners to keep every detail on track",
    metaDescription:
      "Wedding planners, bachelorette party planners, and event organizers -- all as instant-download spreadsheets. Works in Excel and Google Sheets. Plan your perfect event without the stress.",
    categorySlugs: ["wedding", "party-events"],
  },
  bundles: {
    name: "Printables + Bundles",
    description: "Curated bundles and printable activities at a discount",
    metaDescription:
      "Printable activity bundles, party games, and digital art packs. Instant download PDF files ready to print at home. Great for parties, holidays, and family activities.",
    categorySlugs: ["printables-bundles"],
  },
};

// SEO meta descriptions per category slug
const categoryMetaDescriptions: Record<string, string> = {
  "budget-finance":
    "Instant-download budget trackers, debt payoff tools, and financial planners. Works in Excel and Google Sheets. Take control of your money with templates that actually work.",
  "business":
    "Small business planners, Etsy seller dashboards, side hustle trackers, and social media content planners. Instant download. Built for entrepreneurs and side hustlers.",
  "productivity":
    "ADHD dashboards, meal planners, workout trackers, job search command centers, and life organizers. Instant-download spreadsheet templates for every part of your life.",
  "education":
    "Student academic planners and teacher planners for 2026. Track grades, assignments, lesson plans, and schedules. Instant download. Works in Excel and Google Sheets.",
  "wedding":
    "Interactive wedding planners, budget trackers, vendor comparison tools, and bachelorette party planners. Download instantly and plan your perfect day without the stress.",
  "party-events":
    "Graduation party planners, holiday budget planners, and event organizers. Instant-download spreadsheets for planning any celebration.",
  "save-the-dates":
    "Custom city skyline save-the-date cards for your wedding. Hand-drawn designs featuring NYC, Chicago, Austin, Dallas, LA, Philadelphia, and more. Instant download PDF.",
  "printables-bundles":
    "Printable activity bundles, bachelorette games, holiday packs, and seasonal graphics. Instant download PDFs ready to print at home.",
  "water-bottles":
    "Personalized stainless steel water bottles with permanent sublimation printing. Free personalization on every bottle. Perfect for bridesmaids, bachelorette parties, kids, and corporate gifts. Ships in 3-5 business days.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const allCategories = getAllCategories();

  const virtual = virtualCollections[slug];
  if (virtual) {
    return {
      title: `${virtual.name} | Shelzy's Designs`,
      description: virtual.metaDescription,
      openGraph: {
        title: `${virtual.name} | Shelzy's Designs`,
        description: virtual.metaDescription,
        type: "website",
        siteName: "Shelzy's Designs",
      },
    };
  }

  const category = allCategories.find((cat) => cat.slug === slug);
  if (!category) {
    return { title: "Collection Not Found | Shelzy's Designs" };
  }

  const metaDesc = categoryMetaDescriptions[slug] || category.description;
  return {
    title: `${category.name} | Shelzy's Designs`,
    description: metaDesc,
    openGraph: {
      title: `${category.name} | Shelzy's Designs`,
      description: metaDesc,
      type: "website",
      siteName: "Shelzy's Designs",
    },
  };
}

export function generateStaticParams() {
  const categories = getAllCategories();
  const categorySlugs = categories.map((cat) => ({ slug: cat.slug }));
  const virtualSlugs = Object.keys(virtualCollections).map((slug) => ({
    slug,
  }));
  return [...categorySlugs, ...virtualSlugs];
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const allCategories = getAllCategories();

  // Check virtual collections first
  const virtual = virtualCollections[slug];
  if (virtual) {
    const collectionProducts = products.filter((p) =>
      virtual.categorySlugs.includes(p.category)
    );

    return (
      <>
        <Header />
        <main className="bg-white min-h-screen">
          {/* Collection hero */}
          <div className="bg-light-gray border-b border-mid-gray py-10">
            <div className="mx-auto max-w-[1200px] px-6">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal mb-3">
                {virtual.name}
              </h1>
              <p className="text-text-light max-w-xl mb-2">{virtual.description}</p>
              <p className="text-sm text-pink font-semibold">
                {collectionProducts.length} product{collectionProducts.length !== 1 ? "s" : ""} -- instant download
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-[1200px] px-6 py-8">
            {collectionProducts.length > 0 ? (
              <ProductGrid products={collectionProducts} />
            ) : (
              <p className="text-text-light text-sm py-12 text-center">
                No products in this collection yet.
              </p>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Standard category collection
  const category = allCategories.find((cat) => cat.slug === slug);

  if (!category) {
    return (
      <>
        <Header />
        <main className="bg-white min-h-screen">
          <div className="mx-auto max-w-[1200px] px-6 py-8">
            <h1 className="font-heading text-3xl font-bold text-charcoal mb-4">
              Collection not found
            </h1>
            <p className="text-text-light text-sm">
              We could not find a collection matching that URL. Check the shop
              for all available products.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const collectionProducts = products.filter((p) => p.category === slug);
  const isPhysical = slug === "water-bottles";

  return (
    <>
      <Header />
      <main className="bg-white min-h-screen">
        {/* Collection hero */}
        <div className="bg-light-gray border-b border-mid-gray py-10">
          <div className="mx-auto max-w-[1200px] px-6">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal mb-3">
              {category.name}
            </h1>
            <p className="text-text-light max-w-xl mb-2">{category.description}</p>
            <p className="text-sm text-pink font-semibold">
              {collectionProducts.length} product{collectionProducts.length !== 1 ? "s" : ""} --{" "}
              {isPhysical ? "ships in 3-5 business days" : "instant download"}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          {collectionProducts.length > 0 ? (
            <ProductGrid products={collectionProducts} />
          ) : (
            <p className="text-text-light text-sm py-12 text-center">
              No products in this collection yet.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
