import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

export function ProductGrid({
  products,
  wishlist = [],
  columns = 4,
}: {
  products: Product[];
  wishlist?: string[];
  columns?: 3 | 4;
}) {
  return (
    <div
      className={
        columns === 3
          ? "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3"
          : "grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
      }
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          wishlisted={wishlist.includes(product.id)}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
