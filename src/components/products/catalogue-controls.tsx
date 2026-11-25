"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Brand, Category } from "@/lib/types";

type Params = Record<string, string | string[] | undefined>;

const sortOptions = [
  ["recommended", "Recommended"],
  ["newest", "Newest arrivals"],
  ["price_asc", "Price: Low to High"],
  ["price_desc", "Price: High to Low"],
  ["popular", "Most Popular"],
  ["rating", "Highest Rated"],
  ["discount", "Biggest Discount"],
];

export function CatalogueControls({
  categories,
  brands,
  sizes,
  colours,
  materials,
  styles,
  total,
  page,
  totalPages,
  className,
  children,
}: {
  categories: Category[];
  brands: Brand[];
  sizes: string[];
  colours: { name: string; hex: string }[];
  materials: string[];
  styles: string[];
  total: number;
  page: number;
  totalPages: number;
  className?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current: Params = Object.fromEntries(searchParams.entries());
  const list = (key: string): string[] => {
    const value = current[key];
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  function update(key: string, value: string | string[] | null) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    if (value) {
      if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
      else next.set(key, value);
    }
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  function toggle(key: string, value: string) {
    const values = list(key);
    update(key, values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }

  const activeCount = Object.keys(current).filter(
    (k) => !["sort", "page", "q"].includes(k) && Boolean(current[k]),
  ).length;

  const filterPanel = (
    <div className={cn("space-y-7", pending && "opacity-60 transition-opacity")}>
      <div className="flex items-center justify-between">
        <p className="eyebrow text-ink">Filters {activeCount > 0 && `(${activeCount})`}</p>
        {activeCount > 0 && (
          <button onClick={() => router.push(pathname, { scroll: false })} className="text-xs text-accent underline underline-offset-4">
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Category">
        {categories.map((cat) => (
          <CheckRow key={cat.id} label={cat.name} checked={list("category").includes(cat.slug)} onChange={() => toggle("category", cat.slug)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Brand">
        {brands.map((brand) => (
          <CheckRow key={brand.id} label={brand.name} checked={list("brand").includes(brand.id)} onChange={() => toggle("brand", brand.id)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            defaultValue={current.priceMin || ""}
            onBlur={(e) => update("priceMin", e.target.value || null)}
            className="w-full border border-ink/15 bg-white px-2 py-2 text-xs outline-none focus:border-accent"
          />
          <span className="text-stone">—</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            defaultValue={current.priceMax || ""}
            onBlur={(e) => update("priceMax", e.target.value || null)}
            className="w-full border border-ink/15 bg-white px-2 py-2 text-xs outline-none focus:border-accent"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggle("size", size)}
              className={cn(
                "min-w-9 border px-2.5 py-1.5 text-xs transition-colors",
                list("size").includes(size) ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-ink",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2.5">
          {colours.map((colour) => (
            <button
              key={colour.name}
              onClick={() => toggle("colour", colour.name)}
              title={colour.name}
              aria-label={colour.name}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                list("colour").includes(colour.name) ? "border-accent ring-2 ring-accent/30" : "border-white ring-1 ring-black/10",
              )}
              style={{ background: colour.hex }}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Gender">
        {["women", "men", "unisex"].map((gender) => (
          <CheckRow key={gender} label={gender[0].toUpperCase() + gender.slice(1)} checked={current.gender === gender} onChange={() => update("gender", current.gender === gender ? null : gender)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Material">
        {materials.slice(0, 8).map((material) => (
          <CheckRow key={material} label={material} checked={list("material").includes(material)} onChange={() => toggle("material", material)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Style">
        {styles.map((style) => (
          <CheckRow key={style} label={style} checked={list("style").includes(style)} onChange={() => toggle("style", style)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability & Offers">
        <CheckRow label="In stock only" checked={Boolean(current.availability)} onChange={() => update("availability", current.availability ? null : "true")} />
        <CheckRow label="On sale" checked={Boolean(current.discount)} onChange={() => update("discount", current.discount ? null : "true")} />
        <CheckRow label="Rated 4★ and above" checked={current.rating === "4"} onChange={() => update("rating", current.rating === "4" ? null : "4")} />
      </FilterGroup>
    </div>
  );

  return (
    <>
      <div className={cn("mb-6 flex items-center justify-between gap-4 border-b border-ink/10 pb-4", className)}>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        <p className="text-xs text-stone">{total} {total === 1 ? "product" : "products"}</p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">Sort products</label>
          <select
            id="sort"
            value={String(current.sort || "recommended")}
            onChange={(e) => update("sort", e.target.value === "recommended" ? null : e.target.value)}
            className="border-b border-ink/20 bg-transparent py-1.5 pr-6 text-xs font-medium outline-none"
          >
            {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">{filterPanel}</aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Close filters" />
          <div className="absolute inset-y-0 right-0 w-[88vw] max-w-sm overflow-y-auto bg-paper p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="eyebrow">Filters</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters"><X className="h-5 w-5" /></button>
            </div>
            {filterPanel}
            <button onClick={() => setMobileOpen(false)} className="mt-8 w-full bg-ink py-3.5 text-xs font-semibold uppercase tracking-wider text-white">
              Show {total} products
            </button>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const active = p === page;
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`${pathname}?${params.toString()}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 w-9 items-center justify-center text-xs",
                  active ? "bg-ink text-white" : "border border-ink/15 hover:border-ink",
                )}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-ink/10 pt-5">
      <button onClick={() => setOpen(!open)} className="mb-3 flex w-full items-center justify-between text-left">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-2.5">{children}</div>}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs text-charcoal">
      <span className={cn("flex h-4 w-4 items-center justify-center border", checked ? "border-ink bg-ink text-white" : "border-ink/25")}>
        {checked && <Check className="h-3 w-3" />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="capitalize">{label}</span>
    </label>
  );
}
