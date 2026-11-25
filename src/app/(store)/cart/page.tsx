import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getCart } from "@/lib/data/cart";
import { getStoreSettings } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Shopping Bag" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [cart, settings] = await Promise.all([getCart(), getStoreSettings()]);
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-10">
        <p className="eyebrow mb-3 text-accent">Your selection</p>
        <h1 className="font-display text-4xl">Shopping bag</h1>
      </div>
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <CartView items={cart.items} settings={settings} />
      </div>
    </div>
  );
}
