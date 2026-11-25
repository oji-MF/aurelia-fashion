"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Check } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Could not send message.");
      else setSent(true);
    } catch {
      setError("Could not send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="eyebrow text-accent">Customer service</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">We're here to help</h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone">Questions about an order, a product or a return? Send us a message and we'll get back to you within one business day.</p>

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "hello@aurelia.example" },
            { icon: Phone, label: "Phone", value: "+233 20 000 0000" },
            { icon: MapPin, label: "Visit us", value: "Accra, Ghana" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <Icon className="mt-0.5 h-5 w-5 text-accent" />
              <div><p className="eyebrow text-stone">{label}</p><p className="mt-1 text-sm">{value}</p></div>
            </div>
          ))}
          <div className="border-t border-line/10 pt-6 text-xs leading-relaxed text-stone">
            <p className="font-medium text-fg">Support hours</p>
            <p className="mt-1">Monday–Friday, 9am–6pm GMT<br />Saturday, 10am–2pm GMT</p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-start justify-center border border-success/30 bg-success/5 p-10">
            <Check className="h-8 w-8 text-success" />
            <h2 className="mt-4 font-display text-2xl">Message sent</h2>
            <p className="mt-2 text-sm text-stone">Thank you for getting in touch. We'll reply to {form.email} shortly.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="label">Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></label>
            <label className="block"><span className="label">Email</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></label>
            <label className="block sm:col-span-2"><span className="label">Subject</span><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" /></label>
            <label className="block sm:col-span-2"><span className="label">Message</span><textarea required minLength={10} rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input resize-y" /></label>
            {error && <p className="text-xs text-accent sm:col-span-2">{error}</p>}
            <button disabled={sending} className="bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50 sm:col-span-2 sm:justify-self-start">{sending ? "Sending…" : "Send message"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
