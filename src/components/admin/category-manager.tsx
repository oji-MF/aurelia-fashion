"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { Category } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="font-display text-3xl">Categories</h1><p className="mt-1 text-sm text-stone">Organise your catalogue.</p></div>
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accentSolid"><Plus className="h-4 w-4" /> Add category</button>
      </div>
      <div className="overflow-x-auto border border-line/10 bg-surface">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-line/10 bg-cream/40 text-[10px] uppercase tracking-wider text-stone"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Parent</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-line/10">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-10 w-10 overflow-hidden bg-cream">{cat.image && <Image src={cat.image} alt="" fill sizes="40px" className="object-cover" />}</div><div><p className="font-medium">{cat.name}</p><p className="text-[11px] text-stone">/{cat.slug}</p></div></div></td>
                <td className="px-4 py-3 text-xs text-stone">{categories.find((c) => c.id === cat.parentId)?.name || "—"}</td>
                <td className="px-4 py-3 text-xs">{cat.order}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${cat.active ? "bg-success/10 text-success" : "bg-cream text-stone"}`}>{cat.active ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => setEditing(cat)} className="p-2 text-stone hover:text-accent"><Pencil className="h-4 w-4" /></button><DeleteButton id={cat.id} name={cat.name} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing !== undefined && <CategoryForm category={editing} categories={categories} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  return <button disabled={pending} onClick={() => { if (!confirm(`Delete ${name}?`)) return; startTransition(async () => { const r = await deleteCategoryAction(id); toast(r.message, r.ok ? "success" : "error"); }); }} className="p-2 text-stone hover:text-accent" title="Delete"><Trash2 className="h-4 w-4" /></button>;
}

function CategoryForm({ category, categories, onClose }: { category: Category | null; categories: Category[]; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveCategoryAction, initial);
  const { toast } = useToast();
  useEffect(() => {
    if (state.message) {
      toast(state.message, state.ok ? "success" : "error");
      if (state.ok) onClose();
    }
  }, [state, onClose, toast]);
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-paper p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-2xl">{category ? "Edit category" : "New category"}</h2><button onClick={onClose}><X className="h-5 w-5" /></button></div>
        <form action={action} className="space-y-4">
          {category && <input type="hidden" name="id" value={category.id} />}
          <label className="block"><span className="label">Name</span><input name="name" required defaultValue={category?.name} className="input" /></label>
          <label className="block"><span className="label">Description</span><textarea name="description" rows={3} defaultValue={category?.description} className="input" /></label>
          <label className="block"><span className="label">Image URL</span><input name="image" defaultValue={category?.image} className="input" /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="label">Parent</span><select name="parentId" defaultValue={category?.parentId || ""} className="input"><option value="">None (top level)</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="block"><span className="label">Display order</span><input name="order" type="number" defaultValue={category?.order || 0} className="input" /></label>
            <label className="block"><span className="label">Gender</span><select name="gender" defaultValue={category?.gender || "unisex"} className="input"><option value="women">Women</option><option value="men">Men</option><option value="unisex">Unisex</option></select></label>
          </div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="active" defaultChecked={category?.active ?? true} className="accent-accent" /> Active</label>
          <button disabled={pending} className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save category"}</button>
          {state.message && <p className={`text-xs ${state.ok ? "text-success" : "text-accent"}`}>{state.message}</p>}
        </form>
      </div>
    </div>
  );
}
