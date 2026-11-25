"use client";

import { useActionState, useEffect, useState } from "react";
import { inventoryAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { InventoryMovement, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const initial: ActionState = { ok: false, message: "" };

export function InventoryManager({ products, movements }: { products: Product[]; movements: InventoryMovement[] }) {
  const variants = products.flatMap((p) => p.variants.map((v) => ({ ...v, productName: p.name, productSlug: p.slug })));
  return (
    <div>
      <h1 className="font-display text-3xl">Inventory</h1>
      <p className="mt-1 text-sm text-stone">Stock is managed per variant. Adjustments are logged.</p>
      <div className="mt-6 overflow-x-auto border border-line/10 bg-surface">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-line/10 bg-cream/40 text-[10px] uppercase tracking-wider text-stone"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Option</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3 text-right">Adjust</th></tr></thead>
          <tbody className="divide-y divide-line/10">
            {variants.slice(0, 120).map((variant) => <VariantRow key={variant.id} variant={variant} />)}
          </tbody>
        </table>
      </div>
      <section className="mt-8 border border-line/10 bg-surface p-6">
        <h2 className="font-display text-xl">Stock movement history</h2>
        {movements.length ? (
          <div className="mt-4 divide-y divide-line/10">
            {movements.slice(0, 30).map((m) => <div key={m.id} className="flex justify-between gap-4 py-2.5 text-xs"><span><strong className="font-medium">{m.productName}</strong> · {m.reason}</span><span className={cn(m.change > 0 ? "text-success" : "text-accent")}>{m.change > 0 ? "+" : ""}{m.change} units</span></div>)}
          </div>
        ) : <p className="mt-4 text-sm text-stone">No manual adjustments yet. Placing an order will record stock movement automatically.</p>}
      </section>
    </div>
  );
}

function VariantRow({ variant }: { variant: { id: string; productName: string; colour: string; size: string; sku: string; stock: number; lowStockThreshold: number } }) {
  const [open, setOpen] = useState(false);
  return (
    <tr>
      <td className="px-4 py-3 font-medium">{variant.productName}</td>
      <td className="px-4 py-3 text-xs text-stone">{variant.colour} / {variant.size}</td>
      <td className="px-4 py-3 text-[11px] text-stone">{variant.sku}</td>
      <td className={cn("px-4 py-3 text-xs", variant.stock <= variant.lowStockThreshold ? "font-semibold text-accent" : "")}>{variant.stock}</td>
      <td className="px-4 py-3 text-right"><button onClick={() => setOpen(!open)} className="text-xs text-accent underline">{open ? "Close" : "Adjust"}</button>{open && <AdjustForm variantId={variant.id} onDone={() => setOpen(false)} />}</td>
    </tr>
  );
}

function AdjustForm({ variantId, onDone }: { variantId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState(inventoryAction, initial);
  const { toast } = useToast();
  useEffect(() => {
    if (state.message) { toast(state.message, state.ok ? "success" : "error"); if (state.ok) onDone(); }
  }, [state, onDone, toast]);
  return (
    <form action={action} className="mt-2 flex flex-wrap justify-end gap-2">
      <input type="hidden" name="variantId" value={variantId} />
      <select name="change" className="border border-line/15 bg-surface px-2 py-1.5 text-xs"><option value="5">+5</option><option value="10">+10</option><option value="-5">−5</option><option value="-10">−10</option></select>
      <input name="reason" placeholder="Reason" className="w-28 border border-line/15 px-2 py-1.5 text-xs" />
      <button disabled={pending} className="bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-50">Save</button>
    </form>
  );
}
