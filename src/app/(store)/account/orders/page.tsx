import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  delivered: "bg-success/10 text-success",
  refunded: "bg-cream text-stone",
  cancelled: "bg-cream text-stone",
  paid: "bg-success/10 text-success",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const orders = await getOrdersForUser(user.id);

  return (
    <div>
      <h2 className="font-display text-2xl">Order history</h2>
      {orders.length ? (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block border border-ink/10 bg-white/60 p-5 transition-colors hover:border-ink/30">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-stone">Placed {formatDate(order.createdAt)} · {order.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatMoney(order.total)}</p>
                  <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusTone[order.status] || "bg-accent/10 text-accent"}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-3 border-t border-ink/10 pt-4">
                {order.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="relative h-16 w-14 overflow-hidden bg-cream"><img src={item.image} alt="" className="h-full w-full object-cover" /></div>
                ))}
                {order.items.length > 4 && <span className="self-center text-xs text-stone">+{order.items.length - 4} more</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : <p className="mt-6 border border-dashed border-ink/15 p-10 text-center text-sm text-stone">You haven't placed any orders yet.</p>}
    </div>
  );
}
