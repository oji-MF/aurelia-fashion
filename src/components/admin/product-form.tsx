"use client";

import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";
import { saveProductAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { Brand, Category, Product } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function ProductForm({
  product,
  categories,
  brands,
  onClose,
}: {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(saveProductAction, initial);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
    if (state.ok) onClose();
  }, [state, onClose, toast]);

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close form" />
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-paper p-6 shadow-2xl sm:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div><p className="eyebrow text-accent">Catalogue</p><h2 className="mt-2 font-display text-2xl">{product ? "Edit product" : "New product"}</h2></div>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <form action={action} className="space-y-5">
          {product && <input type="hidden" name="id" value={product.id} />}
          <label className="block"><span className="label">Product name</span><input name="name" required defaultValue={product?.name} className="input" /></label>
          <label className="block"><span className="label">Description</span><textarea name="description" required rows={4} defaultValue={product?.description} className="input resize-y" /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">Brand</span><select name="brandId" required defaultValue={product?.brandId || brands[0]?.id} className="input">{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
            <label className="block"><span className="label">Category</span><select name="categoryId" required defaultValue={product?.categoryId || categories[0]?.id} className="input">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="block"><span className="label">Price (pesewas)</span><input name="price" type="number" min="1" required defaultValue={product?.price} className="input" /></label>
            <label className="block"><span className="label">Compare-at price</span><input name="comparePrice" type="number" min="0" defaultValue={product?.comparePrice || ""} className="input" /></label>
            <label className="block"><span className="label">Gender</span><select name="gender" defaultValue={product?.gender || "unisex"} className="input"><option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option></select></label>
            <label className="block"><span className="label">Style</span><input name="style" defaultValue={product?.style} className="input" placeholder="Everyday, Workwear…" /></label>
          </div>
          <label className="block"><span className="label">Image URLs (one per line)</span><textarea name="images" rows={3} required defaultValue={product?.images.join("\n") || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80"} className="input resize-y" /></label>
          <label className="block"><span className="label">Colours (JSON array of name + hex objects)</span><textarea name="colours" rows={3} required defaultValue={JSON.stringify(product?.colours || [{ name: "Black", hex: "#161616" }])} className="input resize-y" /></label>
          <label className="block"><span className="label">Sizes (comma separated)</span><input name="sizes" required defaultValue={product?.sizes.join(", ") || "XS, S, M, L, XL"} className="input" /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">Material</span><input name="material" defaultValue={product?.material} className="input" /></label>
            <label className="block"><span className="label">Status</span><select name="status" defaultValue={product?.status || "draft"} className="input"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          </div>
          <label className="block"><span className="label">Care instructions</span><textarea name="care" rows={2} defaultValue={product?.care} className="input resize-y" /></label>
          <div className="flex flex-wrap gap-5 border-t border-ink/10 pt-5">
            {[["featured", "Featured"], ["newArrival", "New arrival"], ["trending", "Trending"]].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 text-xs"><input type="checkbox" name={name} defaultChecked={Boolean(product?.[name as "featured"])} className="accent-accent" /> {label}</label>
            ))}
          </div>
          <button disabled={pending} className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save product"}</button>
        </form>
      </div>
    </div>
  );
}
