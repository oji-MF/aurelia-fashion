"use client";

import { useActionState } from "react";
import { profileAction, type ActionState } from "@/app/actions";
import type { User } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function ProfileForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState(profileAction, initial);
  return (
    <form action={action} className="max-w-lg space-y-5">
      <label className="block"><span className="label">Full name</span><input name="name" required defaultValue={user.name} className="input" /></label>
      <label className="block"><span className="label">Email address</span><input value={user.email} disabled className="input opacity-60" /></label>
      <label className="block"><span className="label">Phone number</span><input name="phone" defaultValue={user.phone} className="input" /></label>
      <button disabled={pending} className="bg-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Saving…" : "Save changes"}</button>
      {state.message && <p className={`text-xs ${state.ok ? "text-success" : "text-accent"}`}>{state.message}</p>}
    </form>
  );
}
