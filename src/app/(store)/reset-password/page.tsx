"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent, userId: string, secret: string) {
    e.preventDefault();
    const res = await fetch("/api/auth/confirm-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, secret, password }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not reset password.");
    else setMessage("Your password has been updated.");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Choose a new password</h1>
      <PasswordForm onSubmit={submit} password={password} setPassword={setPassword} message={message} error={error} />
      <p className="mt-6 text-center"><Link href="/login" className="text-xs text-stone underline underline-offset-4">Back to sign in</Link></p>
    </div>
  );
}

function PasswordForm({
  onSubmit, password, setPassword, message, error,
}: {
  onSubmit: (e: React.FormEvent, userId: string, secret: string) => void;
  password: string;
  setPassword: (v: string) => void;
  message: string;
  error: string;
}) {
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  return (
    <form onSubmit={(e) => onSubmit(e, userId, secret)} className="mt-8 space-y-5">
      <label className="block"><span className="label">User ID (from reset link)</span><input value={userId} onChange={(e) => setUserId(e.target.value)} className="input" /></label>
      <label className="block"><span className="label">Reset secret (from reset link)</span><input value={secret} onChange={(e) => setSecret(e.target.value)} className="input" /></label>
      <label className="block"><span className="label">New password</span><input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="input" /></label>
      {error && <p className="text-xs text-accent">{error}</p>}
      {message && <p className="text-xs text-success">{message}</p>}
      <button className="w-full bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white">Update password</button>
    </form>
  );
}
