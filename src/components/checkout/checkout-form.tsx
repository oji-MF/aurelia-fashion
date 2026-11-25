"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Lock, Loader2 } from "lucide-react";
import { checkoutAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { cn, formatMoney } from "@/lib/utils";
import type { CartItem, StoreSettings, User } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };
const steps = ["Information", "Delivery", "Shipping", "Payment"];

export function CheckoutForm({
  items,
  settings,
  user,
}: {
  items: CartItem[];
  settings: StoreSettings;
  user: User | null;
}) {
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState(checkoutAction, initial);
  const [provider, setProvider] = useState("paystack");
  const { toast } = useToast();

  const [form, setForm] = useState({
    email: user?.email || "",
    name: user?.name || "",
    phone: user?.phone || "",
    country: "Ghana",
    region: "",
    city: "",
    street: "",
    postalCode: "",
    deliveryMethod: "standard" as "standard" | "express",
    couponCode: "",
  });
  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    form.deliveryMethod === "express"
      ? settings.expressShipping
      : subtotal >= settings.freeShippingThreshold
        ? 0
        : settings.standardShipping;

  useEffect(() => {
    if (!state.ok || !state.data) return;
    const data = state.data as { url?: string; orderNumber?: string };
    if (data.url) {
      toast("Redirecting to secure payment…");
      window.location.href = data.url;
    } else if (data.orderNumber) {
      window.location.href = `/checkout/confirmation/${data.orderNumber}`;
    }
  }, [state, toast]);

  useEffect(() => {
    if (!state.ok && state.message) toast(state.message, "error");
  }, [state, toast]);

  function next() {
    if (step === 0 && (!form.email.includes("@") || form.name.length < 2 || form.phone.length < 7)) {
      toast("Please complete your contact details.", "error");
      return;
    }
    if (step === 1 && (!form.country || !form.region || !form.city || form.street.length < 4)) {
      toast("Please complete your delivery address.", "error");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form action={action} className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
      <input type="hidden" name="email" value={form.email} />
      <input type="hidden" name="name" value={form.name} />
      <input type="hidden" name="phone" value={form.phone} />
      <input type="hidden" name="country" value={form.country} />
      <input type="hidden" name="region" value={form.region} />
      <input type="hidden" name="city" value={form.city} />
      <input type="hidden" name="street" value={form.street} />
      <input type="hidden" name="postalCode" value={form.postalCode} />
      <input type="hidden" name="deliveryMethod" value={form.deliveryMethod} />
      <input type="hidden" name="couponCode" value={form.couponCode} />
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="items" value={JSON.stringify(items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })))} />

      <div>
        {/* Stepper */}
        <ol className="mb-10 flex items-center gap-2">
          {steps.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  i < step ? "bg-success text-white" : i === step ? "bg-ink text-white" : "bg-cream text-stone",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </button>
              <span className={cn("hidden text-[11px] sm:block", i === step ? "font-semibold text-fg" : "text-stone")}>{label}</span>
              {i < steps.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-success" : "bg-line/15")} />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section>
            <h2 className="font-display text-2xl">Contact information</h2>
            <p className="mt-2 text-sm text-stone">We'll send your order confirmation here.</p>
            <div className="mt-7 space-y-5">
              <Field label="Full name" required><Input value={form.name} onChange={(v) => set("name", v)} placeholder="Your full name" autoComplete="name" /></Field>
              <Field label="Email address" required><Input type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@example.com" autoComplete="email" /></Field>
              <Field label="Phone number" required><Input value={form.phone} onChange={(v) => set("phone", v)} placeholder="+233 24 000 0000" autoComplete="tel" /></Field>
              {!user && <p className="text-xs text-stone">Already have an account? <Link href="/login" className="text-accent underline underline-offset-4">Sign in</Link> for a faster checkout.</p>}
            </div>
            <NextButton onClick={next} label="Continue to delivery" />
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className="font-display text-2xl">Delivery address</h2>
            <p className="mt-2 text-sm text-stone">Where should we send your order?</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Country" required><Input value={form.country} onChange={(v) => set("country", v)} /></Field>
              <Field label="Region / State" required><Input value={form.region} onChange={(v) => set("region", v)} placeholder="e.g. Greater Accra" /></Field>
              <Field label="City" required><Input value={form.city} onChange={(v) => set("city", v)} placeholder="e.g. Accra" /></Field>
              <Field label="Postal code"><Input value={form.postalCode} onChange={(v) => set("postalCode", v)} placeholder="Optional" /></Field>
              <div className="sm:col-span-2"><Field label="Street address" required><Input value={form.street} onChange={(v) => set("street", v)} placeholder="House number and street name" autoComplete="street-address" /></Field></div>
            </div>
            <div className="mt-8 flex gap-3">
              <BackButton onClick={() => setStep(0)} />
              <NextButton onClick={next} label="Continue to shipping" />
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-display text-2xl">Delivery method</h2>
            <p className="mt-2 text-sm text-stone">Choose how quickly you'd like your order.</p>
            <div className="mt-7 space-y-3">
              <ShippingOption
                active={form.deliveryMethod === "standard"}
                onClick={() => set("deliveryMethod", "standard")}
                title="Standard delivery"
                detail="2–5 business days"
                price={subtotal >= settings.freeShippingThreshold ? "Complimentary" : formatMoney(settings.standardShipping)}
              />
              <ShippingOption
                active={form.deliveryMethod === "express"}
                onClick={() => set("deliveryMethod", "express")}
                title="Express delivery"
                detail="1–3 business days"
                price={formatMoney(settings.expressShipping)}
              />
            </div>
            <div className="mt-8 flex gap-3">
              <BackButton onClick={() => setStep(1)} />
              <NextButton onClick={next} label="Continue to payment" />
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-display text-2xl">Payment</h2>
            <p className="mt-2 text-sm text-stone">All transactions are secure and encrypted.</p>
            <div className="mt-7 space-y-3">
              {[
                { id: "paystack", title: "Paystack", detail: "Card, Mobile Money, bank transfer" },
                { id: "stripe", title: "Stripe", detail: "International cards (subject to availability)" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setProvider(option.id)}
                  className={cn("flex w-full items-center gap-4 border p-4 text-left transition-colors", provider === option.id ? "border-line bg-cream/40" : "border-line/15 hover:border-line/40")}
                >
                  <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", provider === option.id ? "border-line" : "border-line/30")}>
                    {provider === option.id && <span className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{option.title}</span>
                    <span className="block text-xs text-stone">{option.detail}</span>
                  </span>
                  <Lock className="h-4 w-4 text-stone" />
                </button>
              ))}
            </div>
            <div className="mt-6">
              <Field label="Discount code (optional)"><Input value={form.couponCode} onChange={(v) => set("couponCode", v)} placeholder="e.g. WELCOME10" /></Field>
            </div>
            <div className="mt-8 flex gap-3">
              <BackButton onClick={() => setStep(2)} />
              <button
                type="submit"
                disabled={pending}
                className="flex flex-1 items-center justify-center gap-2 bg-accent py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-accent-dark disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {pending ? "Processing…" : `Pay ${formatMoney(subtotal + shipping)}`}
              </button>
            </div>
            <p className="mt-4 text-center text-[11px] text-stone">By placing your order you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
          </section>
        )}
      </div>

      {/* Summary */}
      <aside className="lg:pt-1">
        <div className="border border-line/10 bg-surface/60 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl">Your order</h2>
          <div className="mt-5 max-h-72 space-y-4 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-cream">
                  <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] text-white">{item.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{item.name}</p>
                  <p className="text-[11px] text-stone">{item.colour} / {item.size}</p>
                </div>
                <span className="text-xs">{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-line/10 pt-5 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatMoney(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{shipping === 0 ? "Complimentary" : formatMoney(shipping)}</span></div>
            <div className="flex justify-between border-t border-line/10 pt-3 font-medium"><span>Total</span><span>{formatMoney(subtotal + shipping)}</span></div>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-stone">All prices and stock are re-verified on the server before payment is captured.</p>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium">{label} {required && <span className="text-accent">*</span>}</span>
      {children}
    </label>
  );
}

function Input({
  value, onChange, placeholder, type = "text", autoComplete,
}: {
  value: string; onChange: (value: string) => void; placeholder?: string; type?: string; autoComplete?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full border border-line/15 bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
    />
  );
}

function ShippingOption({ active, onClick, title, detail, price }: { active: boolean; onClick: () => void; title: string; detail: string; price: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex w-full items-center gap-4 border p-4 text-left transition-colors", active ? "border-line bg-cream/40" : "border-line/15 hover:border-line/40")}
    >
      <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", active ? "border-line" : "border-line/30")}>
        {active && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
      <span className="flex-1"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-stone">{detail}</span></span>
      <span className="text-sm font-medium">{price}</span>
    </button>
  );
}

function NextButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="mt-8 flex items-center gap-2 bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent">
      {label} <ChevronRight className="h-4 w-4" />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-8 flex items-center gap-2 border border-line/20 px-6 py-4 text-xs font-medium uppercase tracking-wider hover:border-line">
      <ChevronLeft className="h-4 w-4" /> Back
    </button>
  );
}
