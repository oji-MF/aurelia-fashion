import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCart } from "@/lib/data/cart";
import { getStoreSettings } from "@/lib/data/admin";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [cart, settings, user] = await Promise.all([getCart(), getStoreSettings(), getCurrentUser()]);
  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <p className="mt-4 text-sm text-stone">Add something you love before heading to checkout.</p>
        <Link href="/new-arrivals" className="mt-8 inline-block bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white">Explore new arrivals</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-10">
        <p className="eyebrow mb-3 text-accent">Almost there</p>
        <h1 className="font-display text-4xl">Checkout</h1>
      </div>
      <CheckoutForm items={cart.items} settings={settings} user={user} />
    </div>
  );
}
