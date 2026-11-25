"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeAction, type ActionState } from "@/app/actions";
import { cn } from "@/lib/utils";

const initial: ActionState = { ok: false, message: "" };

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, formAction, pending] = useActionState(subscribeAction, initial);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (state.ok) setDone(true);
  }, [state.ok]);

  if (done) {
    return (
      <div className={cn("flex items-center gap-2 text-sm", dark ? "text-emerald-300" : "text-success")}>
        <Check className="h-4 w-4" /> Thank you for subscribing.
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div className="flex border-b border-white/30">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className={cn(
            "w-full bg-transparent py-2.5 text-sm outline-none",
            dark ? "text-white placeholder:text-white/40" : "text-ink placeholder:text-stone",
          )}
        />
        <button type="submit" disabled={pending} aria-label="Subscribe" className="p-2 hover:text-accent">
          {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      {!state.ok && state.message && <p className="mt-2 text-xs text-rose-300">{state.message}</p>}
    </form>
  );
}
