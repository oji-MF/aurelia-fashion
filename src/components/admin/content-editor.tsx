"use client";

import { useActionState, useEffect } from "react";
import { contentAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";

const initial: ActionState = { ok: false, message: "" };

export function ContentEditor({ content }: { content: string }) {
  const [state, action, pending] = useActionState(contentAction, initial);
  const { toast } = useToast();
  useEffect(() => { if (state.message) toast(state.message, state.ok ? "success" : "error"); }, [state, toast]);
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl">Homepage content</h1>
      <p className="mt-1 text-sm text-stone">Edit editorial copy, campaign cards and sections. Changes appear on the storefront immediately after saving.</p>
      <form action={action} className="mt-6 space-y-4">
        <textarea name="content" rows={24} defaultValue={content} className="input resize-y font-mono text-xs" spellCheck={false} />
        <button disabled={pending} className="bg-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save homepage content"}</button>
        {state.message && <p className={`text-xs ${state.ok ? "text-success" : "text-accent"}`}>{state.message}</p>}
      </form>
    </div>
  );
}
