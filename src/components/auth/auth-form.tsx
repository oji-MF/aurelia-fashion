"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginAction, registerAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";

const initial: ActionState = { ok: false, message: "" };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, action, pending] = useActionState(
    mode === "login" ? loginAction : registerAction,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      toast(state.message);
      router.push("/account");
      router.refresh();
    } else if (state.message) {
      toast(state.message, "error");
    }
  }, [state, router, toast]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="eyebrow text-accent">{mode === "login" ? "Welcome back" : "Join AURELIA"}</p>
        <h1 className="mt-3 font-display text-4xl">{mode === "login" ? "Sign in" : "Create an account"}</h1>
        <p className="mt-3 text-sm text-stone">
          {mode === "login" ? "Sign in to view your orders, wishlist and saved details." : "One account for a faster checkout, order tracking and saved pieces."}
        </p>
      </div>

      <form action={action} className="mt-10 space-y-5">
        {mode === "register" && (
          <Field label="Full name"><input name="name" required minLength={2} autoComplete="name" placeholder="Your full name" className="input" /></Field>
        )}
        <Field label="Email address"><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" /></Field>
        <Field label="Password">
          <input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" className="input" />
        </Field>
        {mode === "login" && (
          <div className="flex justify-end"><Link href="/forgot-password" className="text-xs text-stone underline underline-offset-4 hover:text-accent">Forgot password?</Link></div>
        )}
        <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent disabled:opacity-50">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone">
        {mode === "login" ? "New to AURELIA?" : "Already have an account?"}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-medium text-accent underline underline-offset-4">
          {mode === "login" ? "Create an account" : "Sign in"}
        </Link>
      </p>

      <div className="mt-10 border-t border-ink/10 pt-6 text-center">
        <p className="eyebrow mb-3 text-stone">Demo accounts</p>
        <p className="text-xs leading-relaxed text-stone">Administrator: <strong>admin@aurelia.demo</strong><br />Customer: <strong>customer@aurelia.demo</strong><br />Password: <strong>Aurelia!2026</strong></p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-medium">{label}</span>{children}</label>;
}
