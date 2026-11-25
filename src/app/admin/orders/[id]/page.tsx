import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/data/orders";
import { OrderStatusControl, RefundButton } from "@/components/admin/order-status";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-stone hover:text-accent">← All orders</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-3xl">{order.orderNumber}</h1><p className="mt-1 text-sm text-stone">Placed {formatDate(order.createdAt)} · {order.deliveryMethod} delivery</p></div>
        <div className="flex flex-wrap items-center gap-3"><OrderStatusControl orderId={order.id} status={order.status} /><RefundButton orderId={order.id} /></div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="border border-line/10 bg-surface p-6">
          <h2 className="font-display text-xl">Items</h2>
          <div className="mt-5 divide-y divide-line/10">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-4 first:pt-0">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-cream"><img src={item.image} alt="" className="h-full w-full object-cover" /></div>
                <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-stone">{item.colour} / {item.size} · {item.quantity} × {formatMoney(item.unitPrice)}</p></div>
                <span className="text-sm">{formatMoney(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-line/10 pt-5 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-success"><span>Discount {order.couponCode}</span><span>−{formatMoney(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{formatMoney(order.shipping)}</span></div>
            <div className="flex justify-between border-t border-line/10 pt-3 font-medium"><span>Total</span><span>{formatMoney(order.total)}</span></div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="border border-line/10 bg-surface p-6">
            <h2 className="eyebrow mb-4 text-stone">Customer</h2>
            <p className="text-sm font-medium">{order.customerName}</p>
            <p className="mt-1 text-xs text-stone">{order.guestEmail}</p>
            <p className="text-xs text-stone">{order.phone}</p>
            <div className="mt-4 border-t border-line/10 pt-4">
              <p className="eyebrow mb-2 text-stone">Delivery address</p>
              <p className="text-xs leading-relaxed">{order.address ? `${order.address.street}, ${order.address.city}, ${order.address.region}, ${order.address.country}` : "—"}</p>
            </div>
          </section>
          <section className="border border-line/10 bg-surface p-6">
            <h2 className="eyebrow mb-4 text-stone">Payment</h2>
            <div className="space-y-2 text-xs"><p>Provider: <strong>{order.paymentProvider || "—"}</strong></p><p>Status: <strong className="capitalize">{order.paymentStatus}</strong></p><p>Reference: <strong>{order.paymentReference || "—"}</strong></p></div>
          </section>
          <section className="border border-line/10 bg-surface p-6">
            <h2 className="eyebrow mb-4 text-stone">Activity log</h2>
            <ol className="space-y-3">
              {order.timeline.map((event, i) => <li key={i} className="text-xs"><strong className="capitalize">{event.status.replace(/_/g, " ")}</strong> — {event.note || "Status updated"}<span className="block text-stone">{formatDate(event.at)}</span></li>)}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
