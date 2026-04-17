import Link from "next/link";
import Image from "next/image";
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
      className="group block bg-white border border-mid-gray hover:border-pink hover:shadow-md transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-heading font-bold text-3xl text-mid-gray select-none">
              {product.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Badge */}
        {product.bestSeller && (
          <span className="absolute top-2.5 left-2.5 text-[9px] tracking-widest uppercase px-2 py-1 font-heading font-bold bg-pink text-white">
            Popular
          </span>
        )}
        {product.featured && !product.bestSeller && (
          <span className="absolute top-2.5 left-2.5 text-[9px] tracking-widest uppercase px-2 py-1 font-heading font-bold bg-charcoal text-white">
            Featured
          </span>
        )}

        {/* Arrow on hover */}
        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-pink text-white flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          →
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t border-mid-gray">
        <h3 className="font-heading font-semibold text-sm text-charcoal leading-snug mb-2 group-hover:text-pink transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-sm text-charcoal">
            ${product.price.toFixed(2)}
          </span>
          <span
            className="text-[9px] tracking-widest uppercase px-2 py-0.5 font-heading font-semibold"
            style={{
              background: isPhysical ? "rgba(254,140,67,0.1)" : "rgba(138,219,222,0.15)",
              color: isPhysical ? "var(--color-orange)" : "var(--color-teal)" ,
              // override teal to be slightly darker for readability
              ...(isPhysical ? {} : { color: "#2a9ea3" }),
            }}
          >
            {isPhysical ? "Ships 3–5d" : "Instant DL"}
          </span>
        </div>
      </div>
    </Link>
  );
}
