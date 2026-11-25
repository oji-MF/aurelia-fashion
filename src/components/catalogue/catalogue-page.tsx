import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CatalogueControls } from "@/components/products/catalogue-controls";
import { ProductGrid } from "@/components/products/product-grid";
import { EmptyState, SkeletonGrid } from "@/components/ui/primitives";
import { getBrands, getCategories, listProducts } from "@/lib/data/catalogue";
import { getWishlistIds } from "@/lib/data/wishlist";
import { getCurrentUser } from "@/lib/auth";
import { unique } from "@/lib/utils";
import type { ProductFilters, SortOption } from "@/lib/types";

function str(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function arr(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

export async function CataloguePage({
  title,
  eyebrow,
  description,
  filters = {},
  searchParams,
  breadcrumbs = [],
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  filters?: ProductFilters;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const [categories, brands, wishlist] = await Promise.all([
    getCategories(),
    getBrands(),
    getWishlistIds(user?.id ?? null),
  ]);

  const activeFilters: ProductFilters = {
    ...filters,
    category: str(sp.category) || filters.category,
    brand: arr(sp.brand) || filters.brand,
    size: arr(sp.size),
    colour: arr(sp.colour),
    material: arr(sp.material),
    style: arr(sp.style),
    priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
    gender: str(sp.gender) || filters.gender,
    availability: sp.availability === "true",
    discount: sp.discount === "true",
    rating: sp.rating ? Number(sp.rating) : undefined,
    q: str(sp.q) || filters.q,
    sort: (str(sp.sort) as SortOption) || "recommended",
    page: sp.page ? Number(sp.page) : 1,
    limit: 12,
  };

  const result = await listProducts(activeFilters);
  const allProducts = await listProducts({ ...filters, limit: 500 });
  const sizes = unique(allProducts.items.flatMap((p) => p.sizes));
  const colours = uniqueBy(
    allProducts.items.flatMap((p) => p.colours.map((c) => ({ name: c.name, hex: c.hex }))),
    (c) => c.name,
  );
  const materials = unique(allProducts.items.map((p) => p.material).filter(Boolean));
  const styles = unique(allProducts.items.map((p) => p.style).filter(Boolean));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <nav className="mb-8 flex items-center gap-1.5 text-[11px] text-stone" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">Home</Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {crumb.href ? <Link href={crumb.href} className="hover:text-accent">{crumb.label}</Link> : <span className="text-ink">{crumb.label}</span>}
          </span>
        ))}
      </nav>

      <div className="mb-10 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3 text-accent">{eyebrow}</p>}
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-sm leading-relaxed text-stone">{description}</p>}
      </div>

      <Suspense fallback={<SkeletonGrid />}>
        <CatalogueControls
          categories={categories}
          brands={brands}
          sizes={sizes}
          colours={colours}
          materials={materials}
          styles={styles}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
        >
          {result.items.length ? (
            <ProductGrid products={result.items} wishlist={wishlist} />
          ) : (
            <EmptyState
              title="No products found"
              description="Try removing a filter or broadening your search to see more pieces."
              action={<Link href="/new-arrivals" className="text-sm text-accent underline underline-offset-4">Browse new arrivals</Link>}
            />
          )}
        </CatalogueControls>
      </Suspense>
    </div>
  );
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
