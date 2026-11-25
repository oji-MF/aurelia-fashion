"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { saveBrandAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { Brand } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function BrandManager({ brands }: { brands: Brand[] }) {
  const [editing, setEditing] = useState<Brand | null | undefined>(undefined);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h1 className="font-display text-3xl">Brands</h1><p className="mt-1 text-sm text-stone">Manage the labels you stock.</p></div><button onClick={() => setEditing(null)} className="flex items-center gap-2 bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent"><Plus className="h-4 w-4" /> Add brand</button></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-start justify-between border border-ink/10 bg-white p-5">
            <div><p className="font-display text-lg">{brand.name}</p><p className="mt-1 text-xs text-stone">{brand.description}</p><span className={`mt-3 inline-block rounded-full px-2 py-1 text-[10px] uppercase ${brand.active ? "bg-success/10 text-success" : "bg-cream text-stone"}`}>{brand.active ? "Active" : "Inactive"}</span></div>
            <button onClick={() => setEditing(brand)} className="p-2 text-stone hover:text-accent"><Pencil className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      {editing !== undefined && <BrandForm brand={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function BrandForm({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveBrandAction, initial);
  const { toast } = useToast();
  useEffect(() => {
    if (state.message) { toast(state.message, state.ok ? "success" : "error"); if (state.ok) onClose(); }
  }, [state, onClose, toast]);
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-paper p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-2xl">{brand ? "Edit brand" : "New brand"}</h2><button onClick={onClose}><X className="h-5 w-5" /></button></div>
        <form action={action} className="space-y-4">
          {brand && <input type="hidden" name="id" value={brand.id} />}
          <label className="block"><span className="label">Name</span><input name="name" required defaultValue={brand?.name} className="input" /></label>
          <label className="block"><span className="label">Description</span><textarea name="description" rows={3} defaultValue={brand?.description} className="input" /></label>
          <label className="block"><span className="label">Logo URL</span><input name="logo" defaultValue={brand?.logo} className="input" /></label>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="active" defaultChecked={brand?.active ?? true} className="accent-accent" /> Active</label>
          <button disabled={pending} className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save brand"}</button>
        </form>
      </div>
    </div>
  );
}
