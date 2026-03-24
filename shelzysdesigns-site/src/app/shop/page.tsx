"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { products, getAllCategories } from "@/data/products";

type SortOption = "best-selling" | "newest" | "price-low" | "price-high";
type PriceRange = "all" | "under-5" | "5-7" | "8-plus";

export default function ShopPage() {
  const categories = getAllCategories();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [sort, setSort] = useState<SortOption>("best-selling");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Price filter
    if (priceRange === "under-5") {
      result = result.filter((p) => p.price < 5);
    } else if (priceRange === "5-7") {
      result = result.filter((p) => p.price >= 5 && p.price <= 7);
    } else if (priceRange === "8-plus") {
      result = result.filter((p) => p.price >= 8);
    }

    // Sort
    if (sort === "best-selling") {
      result.sort((a, b) => {
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return 1;
        return 0;
      });
    } else if (sort === "newest") {
      result.sort((a, b) => b.id - a.id);
    } else if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategories, priceRange, sort]);

  return (
    <>
      <Header />
      <main className="bg-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-6 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
              Shop All Templates
            </h1>
            <p className="text-text-light text-sm">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden mb-6 flex items-center gap-2 px-4 py-2 border border-mid-gray rounded-lg text-charcoal text-sm font-semibold hover:border-pink transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="12" y2="18" />
            </svg>
            Filters
          </button>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside
              className={`${
                filtersOpen ? "block" : "hidden"
              } md:block w-full md:w-64 shrink-0`}
            >
              <div className="space-y-8">
                {/* Category filter */}
                <div>
                  <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-charcoal mb-3">
                    Category
                  </h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <label
                        key={cat.slug}
                        className="flex items-center gap-2 cursor-pointer text-sm text-charcoal hover:text-pink transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => toggleCategory(cat.slug)}
                          className="w-4 h-4 rounded border-mid-gray accent-pink"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price filter */}
                <div>
                  <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-charcoal mb-3">
                    Price
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "all" as PriceRange, label: "All" },
                      { value: "under-5" as PriceRange, label: "Under $5" },
                      { value: "5-7" as PriceRange, label: "$5 - $7" },
                      { value: "8-plus" as PriceRange, label: "$8+" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer text-sm text-charcoal hover:text-pink transition"
                      >
                        <input
                          type="radio"
                          name="price"
                          checked={priceRange === option.value}
                          onChange={() => setPriceRange(option.value)}
                          className="w-4 h-4 accent-pink"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-heading font-semibold text-sm uppercase tracking-wide text-charcoal mb-3">
                    Sort By
                  </h3>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="w-full border border-mid-gray rounded-lg px-3 py-2 text-sm text-charcoal bg-white focus:outline-none focus:border-pink transition"
                  >
                    <option value="best-selling">Best Selling</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <p className="text-text-light text-sm py-12 text-center">
                  No products match your filters. Try adjusting your selection.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
