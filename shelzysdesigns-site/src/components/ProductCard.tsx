"use client";

import Link from "next/link";
import Image from "next/image";
import ReviewStars from "@/components/ReviewStars";
import type { Product } from "@/data/products";
export type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isPhysical = product.compatibility === "physical";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1.5"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.13), 0 4px 12px rgba(0,0,0,0.07)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)")}
    >
      {/* Image area — tinted bg per type */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: isPhysical ? "#FDE8EF" : "#E8F7F8" }}
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-heading font-extrabold text-3xl opacity-20 select-none text-charcoal">
              {product.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {product.bestSeller && (
          <span className="absolute top-3 left-3 bg-pink text-white text-[9px] font-heading font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
            Popular
          </span>
        )}
        {product.featured && !product.bestSeller && (
          <span className="absolute top-3 left-3 bg-charcoal text-white text-[9px] font-heading font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-sm text-charcoal leading-snug mb-2 group-hover:text-pink transition-colors line-clamp-2">
          {product.name}
        </h3>
        {(product.bestSeller || product.featured) && (
          <div className="mb-2">
            <ReviewStars size="sm" showCount={false} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-charcoal text-sm">
            ${product.price.toFixed(2)}
          </span>
          <span
            className="text-[9px] font-heading font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background: isPhysical ? "rgba(254,140,67,0.12)" : "rgba(60,164,215,0.12)",
              color: isPhysical ? "var(--color-orange)" : "var(--color-blue)",
            }}
          >
            {isPhysical ? "Ships 3–5d" : "Instant DL"}
          </span>
        </div>
      </div>
    </Link>
  );
}
