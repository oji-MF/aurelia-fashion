import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/products/product-grid";
import { EmptyState } from "@/components/ui/primitives";
import { getWishlistProducts } from "@/lib/data/wishlist";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  const products = await getWishlistProducts(user?.id ?? null);
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-10">
        <p className="eyebrow mb-3 text-accent">Saved for later</p>
        <h1 className="font-display text-4xl">Your wishlist</h1>
      </div>
      {products.length ? (
        <ProductGrid products={products} wishlist={products.map((p) => p.id)} />
      ) : (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here. Your saved pieces will follow you when you sign in."
          action={<Link href="/new-arrivals" className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accentSolid">Explore new arrivals</Link>}
        />
      )}
    </div>
  );
}
