"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, type Product } from "@/data/products";

const STORAGE_KEY = "shelzy_recently_viewed";
const MAX_ITEMS = 8;

export function trackProductView(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
    const updated = [slug, ...stored.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

export default function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
      const resolved = stored
        .filter((s) => s !== currentSlug)
        .map(getProductBySlug)
        .filter((p): p is Product => p !== undefined)
        .slice(0, 4);
      setProducts(resolved);
    } catch {
      // localStorage unavailable
    }
  }, [currentSlug]);

  if (products.length === 0) return null;

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold font-heading text-charcoal mb-8 text-center">
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
