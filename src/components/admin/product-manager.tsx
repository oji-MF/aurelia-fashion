"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import { deleteProductAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { ProductForm } from "./product-form";
import { formatMoney, cn } from "@/lib/utils";
import type { Brand, Category, Product } from "@/lib/types";

export function ProductManager({
  products,
  categories,
  brands,
}: {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        `${p.name} ${p.brand?.name || ""} ${p.category?.name || ""}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-stone">{products.length} products in the catalogue</p>
        </div>
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="mb-5 flex max-w-sm items-center gap-2 border border-line/15 bg-surface px-3">
        <Search className="h-4 w-4 text-stone" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="w-full bg-transparent py-3 text-sm outline-none" />
      </div>

      <div className={cn("overflow-x-auto border border-line/10 bg-surface", pending && "opacity-60")}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line/10 bg-cream/40 text-[10px] uppercase tracking-wider text-stone">
            <tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-line/10">
            {filtered.map((product) => {
              const stock = product.variants.reduce((s, v) => s + v.stock, 0);
              const low = product.variants.some((v) => v.stock <= v.lowStockThreshold);
              return (
                <tr key={product.id} className="hover:bg-cream/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-cream"><Image src={product.images[0]} alt="" fill sizes="40px" className="object-cover" /></div>
                      <div className="min-w-0"><Link href={`/product/${product.slug}`} target="_blank" className="block truncate font-medium hover:text-accent">{product.name}</Link><span className="text-[11px] text-stone">{product.brand?.name}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone">{product.category?.name || "—"}</td>
                  <td className="px-4 py-3">{formatMoney(product.price)}</td>
                  <td className="px-4 py-3"><span className={cn("flex items-center gap-1.5 text-xs", low && "text-accent")}>{low && <AlertTriangle className="h-3.5 w-3.5" />}{stock}</span></td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold uppercase", product.status === "published" ? "bg-success/10 text-success" : "bg-cream text-stone")}>{product.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(product)} className="p-2 text-stone hover:text-accent" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button
                        onClick={() => {
                          if (!confirm(`Delete ${product.name}?`)) return;
                          startTransition(async () => {
                            const r = await deleteProductAction(product.id);
                            toast(r.message, r.ok ? "success" : "error");
                          });
                        }}
                        className="p-2 text-stone hover:text-accent" title="Delete"
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && <p className="p-10 text-center text-sm text-stone">No products match your search.</p>}
      </div>

      {editing !== undefined && (
        <ProductForm product={editing} categories={categories} brands={brands} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}
