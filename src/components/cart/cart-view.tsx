"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, Tag, ArrowRight, Loader2 } from "lucide-react";
import { updateCartAction, removeCartAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { formatMoney, cn } from "@/lib/utils";
import type { CartItem, StoreSettings } from "@/lib/types";

type Pricing = {
  lines: unknown[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  couponError?: string;
};

export function CartView({
  items,
  settings,
}: {
  items: CartItem[];
  settings: StoreSettings;
}) {
  const [pending, startTransition] = useTransition();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const shipping = pricing?.shipping ?? (subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShipping);
  const discount = pricing?.discount ?? 0;
  const total = pricing?.total ?? Math.max(0, subtotal - discount + shipping);

  function changeQty(variantId: string, quantity: number) {
    startTransition(async () => {
      await updateCartAction(variantId, quantity);
    });
  }

  function remove(variantId: string) {
    startTransition(async () => {
      const result = await removeCartAction(variantId);
      toast(result.message);
    });
  }

  async function fetchPricing(code: string, showToast = false) {
    setChecking(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          couponCode: code || undefined,
          deliveryMethod: "standard",
          country,
        }),
      });
      const data = await res.json();
      if (data.couponError && code) {
        toast(data.couponError, "error");
      } else {
        if (code) {
          setApplied(code.trim().toUpperCase());
          if (showToast) toast("Discount applied.");
        }
        setPricing(data);
      }
    } catch {
      toast("Could not update pricing.", "error");
    } finally {
      setChecking(false);
    }
  }

  async function applyCoupon() {
    if (!coupon.trim()) return;
    await fetchPricing(coupon.trim(), true);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <p className="mt-4 text-sm text-stone">Discover the season's edit and find something you'll love.</p>
        <Link href="/new-arrivals" className="mt-8 inline-flex items-center gap-2 bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent">
          Explore new arrivals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-6", pending && "opacity-60 transition-opacity")}>
        {items.map((item) => (
          <article key={item.variantId} className="flex gap-4 border-b border-line/10 pb-6">
            <Link href={`/product/${item.slug}`} className="relative h-36 w-28 shrink-0 overflow-hidden bg-cream sm:h-44 sm:w-32">
              <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex justify-between gap-4">
                <div>
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium hover:text-accent">{item.name}</Link>
                  <p className="mt-1 text-xs text-stone">Colour: {item.colour} · Size: {item.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatMoney(item.price * item.quantity)}</p>
                  {item.price * item.quantity !== item.price && <p className="text-[11px] text-stone">{formatMoney(item.price)} each</p>}
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="flex items-center border border-line/20">
                  <button onClick={() => changeQty(item.variantId, item.quantity - 1)} className="px-3 py-2 text-xs hover:bg-cream" aria-label="Decrease quantity"><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-xs">{item.quantity}</span>
                  <button onClick={() => changeQty(item.variantId, Math.min(item.maxStock, item.quantity + 1))} className="px-3 py-2 text-xs hover:bg-cream" aria-label="Increase quantity"><Plus className="h-3 w-3" /></button>
                </div>
                <button onClick={() => remove(item.variantId)} className="flex items-center gap-1.5 text-[11px] text-stone hover:text-accent"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
              </div>
              {item.quantity >= item.maxStock && <p className="mt-2 text-[10px] text-accent">Maximum available quantity</p>}
            </div>
          </article>
        ))}
      </div>

      <aside className="mt-10 lg:mt-0">
        <div className="border border-line/10 bg-surface/60 p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>{formatMoney(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-success"><span>Discount {applied && `(${applied})`}</span><span>−{formatMoney(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{shipping === 0 ? "Complimentary" : formatMoney(shipping)}</span></div>
          </div>
          <div className="my-5 border-t border-line/10" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Total</span>
            <span className="font-display text-2xl">{formatMoney(total)}</span>
          </div>
          <p className="mt-1 text-[11px] text-stone">Taxes included where applicable.</p>

          <div className="mt-6 border-t border-line/10 pt-5">
            <label className="eyebrow text-stone" htmlFor="country">Delivery destination</label>
            <select
              id="country"
              value={country}
              onChange={(e) => { setCountry(e.target.value); void fetchPricing(applied); }}
              className="mt-2 w-full border border-line/15 bg-surface px-3 py-2.5 text-xs outline-none focus:border-accent"
            >
              <option>Ghana</option>
              <option>West Africa</option>
              <option>International</option>
            </select>
          </div>

          <div className="mt-6 border-t border-line/10 pt-5">
            <label className="eyebrow text-stone" htmlFor="coupon">Discount code</label>
            <div className="mt-2 flex gap-2">
              <div className="flex flex-1 items-center gap-2 border border-line/15 bg-surface px-3">
                <Tag className="h-4 w-4 text-stone" />
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter code"
                  className="w-full bg-transparent py-2.5 text-xs outline-none"
                />
              </div>
              <button onClick={applyCoupon} disabled={checking} className="bg-ink px-4 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent disabled:opacity-50">
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-stone">Try WELCOME10 or SUMMER20</p>
          </div>

          <Link href={`/checkout?coupon=${encodeURIComponent(applied)}`} className="mt-6 flex w-full items-center justify-center gap-2 bg-accent py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-accent-dark">
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/new-arrivals" className="mt-4 block text-center text-xs text-stone underline underline-offset-4 hover:text-accent">Continue shopping</Link>
        </div>
      </aside>
    </>
  );
}
