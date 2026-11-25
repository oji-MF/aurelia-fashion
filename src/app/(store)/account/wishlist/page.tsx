import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import { EmptyState } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/data/wishlist";

export const dynamic = "force-dynamic";

export default async function AccountWishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const products = await getWishlistProducts(user.id);
  return (
    <div>
      <h2 className="font-display text-2xl">Your wishlist</h2>
      <div className="mt-6">
        {products.length ? <ProductGrid products={products} wishlist={products.map((p) => p.id)} /> : (
          <EmptyState title="Nothing saved yet" description="Save pieces you love and find them here whenever you sign in." action={<Link href="/new-arrivals" className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white">Explore new arrivals</Link>} />
        )}
      </div>
    </div>
  );
}
