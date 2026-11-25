import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";
import { getWishlistProducts } from "@/lib/data/wishlist";
import { getAddresses } from "@/lib/data/account";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountOverview() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [orders, wishlist, addresses] = await Promise.all([
    getOrdersForUser(user.id),
    getWishlistProducts(user.id),
    getAddresses(user.id),
  ]);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Orders", value: orders.length, icon: Package, href: "/account/orders" },
          { label: "Saved pieces", value: wishlist.length, icon: Heart, href: "/account/wishlist" },
          { label: "Addresses", value: addresses.length, icon: MapPin, href: "/account/addresses" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="group border border-line/10 bg-surface/60 p-5 transition-colors hover:border-line/30">
            <Icon className="h-5 w-5 text-accent" />
            <p className="mt-4 font-display text-3xl">{value}</p>
            <p className="mt-1 text-xs text-stone">{label} <ArrowRight className="inline h-3 w-3 transition-transform group-hover:translate-x-1" /></p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl">Recent orders</h2><Link href="/account/orders" className="text-xs text-accent underline underline-offset-4">View all</Link></div>
        {orders.length ? (
          <div className="divide-y divide-line/10 border border-line/10 bg-surface/60">
            {orders.slice(0, 4).map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-cream/40">
                <div><p className="text-sm font-medium">{order.orderNumber}</p><p className="mt-1 text-xs text-stone">{formatDate(order.createdAt)} · {order.items.length} items</p></div>
                <div className="text-right"><p className="text-sm">{formatMoney(order.total)}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-stone">{order.status.replace(/_/g, " ")}</p></div>
              </Link>
            ))}
          </div>
        ) : <p className="border border-dashed border-line/15 p-8 text-center text-sm text-stone">No orders yet. <Link href="/new-arrivals" className="text-accent underline">Start shopping</Link>.</p>}
      </section>

      <section className="border border-line/10 bg-cream/40 p-6">
        <h2 className="font-display text-xl">Account details</h2>
        <div className="mt-4 grid gap-2 text-sm">
          <p><span className="text-stone">Name: </span>{user.name}</p>
          <p><span className="text-stone">Email: </span>{user.email}</p>
          <p><span className="text-stone">Phone: </span>{user.phone || "Not set"}</p>
        </div>
        <Link href="/account/profile" className="mt-5 inline-block text-xs text-accent underline underline-offset-4">Edit profile</Link>
      </section>
    </div>
  );
}
