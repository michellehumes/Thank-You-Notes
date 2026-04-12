import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

interface ProductGridProps {
  products: Product[];
  columns?: number;
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
