"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not send reset email.");
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center">
        <Mail className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-5 font-display text-4xl">Reset your password</h1>
        <p className="mt-3 text-sm text-stone">Enter your email and we'll send you a link to choose a new password.</p>
      </div>
      {sent ? (
        <div className="mt-10 flex items-start gap-3 border border-success/30 bg-success/5 p-5 text-sm text-success">
          <Check className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-medium">Check your inbox</p><p className="mt-1 text-xs text-stone">If an account exists for {email}, a reset link is on its way.</p></div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 space-y-5">
          <label className="block"><span className="label">Email address</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" /></label>
          {error && <p className="text-xs text-accent">{error}</p>}
          <button className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent">Send reset link</button>
        </form>
      )}
      <p className="mt-6 text-center"><Link href="/login" className="text-xs text-stone underline underline-offset-4">Back to sign in</Link></p>
    </div>
  );
}
