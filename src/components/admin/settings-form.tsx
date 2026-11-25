"use client";

import { useActionState, useEffect } from "react";
import { settingsAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { StoreSettings } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState(settingsAction, initial);
  const { toast } = useToast();
  useEffect(() => { if (state.message) toast(state.message, state.ok ? "success" : "error"); }, [state, toast]);
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">Store settings</h1>
      <p className="mt-1 text-sm text-stone">Configure your store identity, shipping and homepage messaging.</p>
      <form action={action} className="mt-6 space-y-8">
        <fieldset className="space-y-4 border border-ink/10 bg-white p-6">
          <legend className="eyebrow px-2 text-accent">Store</legend>
          <label className="block"><span className="label">Store name</span><input name="storeName" defaultValue={settings.storeName} className="input" /></label>
          <label className="block"><span className="label">Announcement bar</span><input name="announcement" defaultValue={settings.announcement} className="input" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="label">Contact email</span><input name="contactEmail" defaultValue={settings.contactEmail} className="input" /></label>
            <label className="block"><span className="label">Contact phone</span><input name="contactPhone" defaultValue={settings.contactPhone} className="input" /></label>
          </div>
        </fieldset>
        <fieldset className="space-y-4 border border-ink/10 bg-white p-6">
          <legend className="eyebrow px-2 text-accent">Shipping</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block"><span className="label">Standard (pesewas)</span><input name="standardShipping" type="number" min="0" defaultValue={settings.standardShipping} className="input" /></label>
            <label className="block"><span className="label">Express (pesewas)</span><input name="expressShipping" type="number" min="0" defaultValue={settings.expressShipping} className="input" /></label>
            <label className="block"><span className="label">Free over (pesewas)</span><input name="freeShippingThreshold" type="number" min="0" defaultValue={settings.freeShippingThreshold} className="input" /></label>
          </div>
        </fieldset>
        <fieldset className="space-y-4 border border-ink/10 bg-white p-6">
          <legend className="eyebrow px-2 text-accent">Homepage hero</legend>
          <label className="block"><span className="label">Heading</span><input name="heroHeading" defaultValue={settings.heroHeading} className="input" /></label>
          <label className="block"><span className="label">Subheading</span><textarea name="heroSubheading" rows={2} defaultValue={settings.heroSubheading} className="input" /></label>
          <label className="block"><span className="label">Hero image URL</span><input name="heroImage" defaultValue={settings.heroImage} className="input" /></label>
        </fieldset>
        <button disabled={pending} className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save settings"}</button>
        {state.message && <p className={`text-xs ${state.ok ? "text-success" : "text-accent"}`}>{state.message}</p>}
      </form>
    </div>
  );
}
