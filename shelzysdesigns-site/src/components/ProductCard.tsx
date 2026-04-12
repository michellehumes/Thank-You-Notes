import Link from "next/link";
import type { Product } from "@/data/products";
export type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isPhysical = product.compatibility === "physical";
  const hasLsUrl =
    product.lemonSqueezyUrl && product.lemonSqueezyUrl !== "#";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      {/* Product image */}
      <div className="relative aspect-square bg-light-gray overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-heading font-bold text-3xl text-mid-gray select-none">
              {product.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        )}

        {product.bestSeller && (
          <span className="absolute top-0 right-0 bg-pink text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
            Best Seller
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-sm text-charcoal mb-1 group-hover:text-pink transition">
          {product.name}
        </h3>
        <p className="text-charcoal font-medium text-sm mb-2">
          ${product.price.toFixed(2)}
        </p>
        <div className="flex items-center justify-between">
          {isPhysical ? (
            <span className="inline-block bg-orange/10 text-orange text-xs px-2 py-0.5 rounded-full">
              Ships in 3-5 Days
            </span>
          ) : (
            <span className="inline-block bg-teal/10 text-teal text-xs px-2 py-0.5 rounded-full">
              Instant Download
            </span>
          )}
          <span className="text-pink text-xs font-semibold group-hover:underline">
            {isPhysical
              ? "Personalize Yours →"
              : hasLsUrl
              ? "Buy Now →"
              : "Shop on Etsy →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
