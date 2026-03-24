import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { products, getAllCategories } from "@/data/products";

// Virtual collections that combine multiple categories
const virtualCollections: Record<
  string,
  { name: string; description: string; categorySlugs: string[] }
> = {
  templates: {
    name: "Templates",
    description:
      "Spreadsheet templates for budgets, business, productivity, and education",
    categorySlugs: ["budget-finance", "business", "productivity", "education"],
  },
  planners: {
    name: "Planners",
    description: "Wedding and event planners to keep every detail on track",
    categorySlugs: ["wedding", "party-events"],
  },
  bundles: {
    name: "Printables + Bundles",
    description: "Curated bundles and printable activities at a discount",
    categorySlugs: ["printables-bundles"],
  },
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
      description: virtual.description,
      openGraph: {
        title: `${virtual.name} | Shelzy's Designs`,
        description: virtual.description,
        type: "website",
        siteName: "Shelzy's Designs",
      },
    };
  }

  const category = allCategories.find((cat) => cat.slug === slug);
  if (!category) {
    return { title: "Collection Not Found | Shelzy's Designs" };
  }

  return {
    title: `${category.name} | Shelzy's Designs`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Shelzy's Designs`,
      description: category.description,
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
          <div className="mx-auto max-w-[1200px] px-6 py-8">
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
                {virtual.name}
              </h1>
              <p className="text-text-light text-sm">{virtual.description}</p>
              <p className="text-text-light text-sm mt-1">
                {collectionProducts.length} product
                {collectionProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
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

  return (
    <>
      <Header />
      <main className="bg-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
              {category.name}
            </h1>
            <p className="text-text-light text-sm">{category.description}</p>
            <p className="text-text-light text-sm mt-1">
              {collectionProducts.length} product
              {collectionProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
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
