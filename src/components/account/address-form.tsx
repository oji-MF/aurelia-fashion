"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { saveAddressAction, deleteAddressAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { Address } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [state, action, pending] = useActionState(saveAddressAction, initial);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl">Saved addresses</h2>
        <button onClick={() => setOpen(!open)} className="bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent">
          {open ? "Cancel" : "Add address"}
        </button>
      </div>

      {open && (
        <form action={action} className="mb-8 grid gap-4 border border-line/10 bg-surface/60 p-6 sm:grid-cols-2">
          <label className="block"><span className="label">Label</span><input name="label" required placeholder="Home, Office…" className="input" /></label>
          <label className="block"><span className="label">Full name</span><input name="fullName" required className="input" /></label>
          <label className="block"><span className="label">Phone</span><input name="phone" required className="input" /></label>
          <label className="block"><span className="label">Country</span><input name="country" required defaultValue="Ghana" className="input" /></label>
          <label className="block"><span className="label">Region</span><input name="region" required className="input" /></label>
          <label className="block"><span className="label">City</span><input name="city" required className="input" /></label>
          <label className="block sm:col-span-2"><span className="label">Street address</span><input name="street" required className="input" /></label>
          <label className="block"><span className="label">Postal code</span><input name="postalCode" className="input" /></label>
          <label className="flex items-center gap-2 self-end pb-3 text-xs"><input type="checkbox" name="isDefault" className="accent-accent" /> Set as default</label>
          <div className="sm:col-span-2">
            <button disabled={pending} className="bg-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save address"}</button>
            {state.message && <p className={`mt-2 text-xs ${state.ok ? "text-success" : "text-accent"}`}>{state.message}</p>}
          </div>
        </form>
      )}

      {addresses.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="border border-line/10 bg-surface/60 p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium">{address.label} {address.isDefault && <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[9px] uppercase tracking-wider text-stone">Default</span>}</p>
                <button
                  onClick={async () => { const r = await deleteAddressAction(address.id); toast(r.message, r.ok ? "success" : "error"); }}
                  aria-label="Delete address" className="text-stone hover:text-accent"
                ><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="mt-3 text-sm text-fg">{address.fullName}</p>
              <p className="mt-1 text-xs text-stone">{address.street}, {address.city}, {address.region}, {address.country}</p>
              <p className="mt-1 text-xs text-stone">{address.phone}</p>
            </div>
          ))}
        </div>
      ) : <p className="border border-dashed border-line/15 p-10 text-center text-sm text-stone">No saved addresses yet.</p>}
    </div>
  );
}
