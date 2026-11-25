"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { saveCouponAction, deleteCouponAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { Coupon } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [editing, setEditing] = useState<Coupon | null | undefined>(undefined);
  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><div><h1 className="font-display text-3xl">Promotions</h1><p className="mt-1 text-sm text-stone">Discount codes and campaigns.</p></div><button onClick={() => setEditing(null)} className="flex items-center gap-2 bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent"><Plus className="h-4 w-4" /> New code</button></div>
      <div className="overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-cream/40 text-[10px] uppercase tracking-wider text-stone"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Valid until</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-ink/10">
            {coupons.map((coupon) => <tr key={coupon.id}><td className="px-4 py-3 font-medium">{coupon.code}</td><td className="px-4 py-3 text-xs capitalize text-stone">{coupon.type.replace(/_/g, " ")}</td><td className="px-4 py-3">{coupon.type === "percentage" ? `${coupon.value}%` : coupon.type === "fixed" ? `GH₵${(coupon.value / 100).toFixed(2)}` : "Free delivery"}</td><td className="px-4 py-3 text-xs">{coupon.usedCount} / {coupon.usageLimit}</td><td className="px-4 py-3 text-xs text-stone">{new Date(coupon.endAt).toLocaleDateString("en-GB")}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] uppercase ${coupon.active ? "bg-success/10 text-success" : "bg-cream text-stone"}`}>{coupon.active ? "Active" : "Inactive"}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => setEditing(coupon)} className="text-xs text-accent underline">Edit</button><DeleteButton id={coupon.id} /></div></td></tr>)}
          </tbody>
        </table>
      </div>
      {editing !== undefined && <CouponForm coupon={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  return <button disabled={pending} onClick={() => { if (!confirm("Delete this promotion?")) return; startTransition(async () => { const r = await deleteCouponAction(id); toast(r.message, r.ok ? "success" : "error"); }); }} className="text-accent hover:underline" title="Delete"><Trash2 className="h-4 w-4" /></button>;
}

function CouponForm({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const [state, action, pending] = useActionState(saveCouponAction, initial);
  const { toast } = useToast();
  useEffect(() => { if (state.message) { toast(state.message, state.ok ? "success" : "error"); if (state.ok) onClose(); } }, [state, onClose, toast]);
  return (
    <div className="fixed inset-0 z-[80] flex justify-end"><button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-paper p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-2xl">{coupon ? "Edit promotion" : "New promotion"}</h2><button onClick={onClose}><X className="h-5 w-5" /></button></div>
        <form action={action} className="space-y-4">
          {coupon && <input type="hidden" name="id" value={coupon.id} />}
          <label className="block"><span className="label">Code</span><input name="code" required defaultValue={coupon?.code} placeholder="SUMMER20" className="input uppercase" /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="label">Type</span><select name="type" defaultValue={coupon?.type || "percentage"} className="input"><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option><option value="free_shipping">Free shipping</option></select></label>
            <label className="block"><span className="label">Value (percent / pesewas)</span><input name="value" type="number" min="0" defaultValue={coupon?.value || 10} className="input" /></label>
            <label className="block"><span className="label">Minimum order</span><input name="minOrder" type="number" min="0" defaultValue={coupon?.minOrder || 0} className="input" /></label>
            <label className="block"><span className="label">Usage limit</span><input name="usageLimit" type="number" min="1" defaultValue={coupon?.usageLimit || 100} className="input" /></label>
            <label className="block"><span className="label">Starts</span><input name="startAt" type="date" defaultValue={coupon?.startAt.slice(0, 10) || new Date().toISOString().slice(0, 10)} className="input" /></label>
            <label className="block"><span className="label">Ends</span><input name="endAt" type="date" defaultValue={coupon?.endAt.slice(0, 10) || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)} className="input" /></label>
          </div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="active" defaultChecked={coupon?.active ?? true} className="accent-accent" /> Active</label>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="firstOrderOnly" defaultChecked={coupon?.firstOrderOnly} className="accent-accent" /> First orders only</label>
          <button disabled={pending} className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save promotion"}</button>
        </form>
      </div>
    </div>
  );
}
