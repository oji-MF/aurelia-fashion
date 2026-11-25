import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin, CreditCard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrderById } from "@/lib/data/orders";
import { formatMoney, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const flow: OrderStatus[] = ["payment_confirmed", "processing", "packed", "dispatched", "in_transit", "delivered"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;
  const order = await getOrderById(id);
  if (!order || (order.userId && order.userId !== user.id)) notFound();

  const currentIndex = flow.indexOf(order.status);
  const cancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div>
      <Link href="/account/orders" className="text-xs text-stone hover:text-accent">← All orders</Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="font-display text-2xl">{order.orderNumber}</h2><p className="mt-1 text-xs text-stone">Placed {formatDate(order.createdAt)}</p></div>
        <span className={cn("rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider", cancelled ? "bg-cream text-stone" : "bg-success/10 text-success")}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {!cancelled && (
        <section className="mt-8 border border-line/10 bg-surface/60 p-6">
          <h3 className="eyebrow mb-6 text-stone">Order progress</h3>
          <ol className="flex flex-wrap gap-y-6">
            {flow.map((status, i) => {
              const done = currentIndex >= i || order.status === "delivered";
              return (
                <li key={status} className="flex min-w-[120px] flex-1 flex-col items-start">
                  <div className="flex w-full items-center">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[10px]", done ? "bg-success text-white" : "bg-cream text-stone")}>
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    {i < flow.length - 1 && <span className={cn("h-px flex-1", done ? "bg-success" : "bg-line/10")} />}
                  </div>
                  <span className={cn("mt-2 text-[10px] capitalize", done ? "font-medium text-fg" : "text-stone")}>{status.replace(/_/g, " ")}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-6 border-t border-line/10 pt-4">
            <p className="text-xs text-stone">Estimated delivery: {order.deliveryMethod === "express" ? "1–3 business days" : "2–5 business days"} from confirmation.</p>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <section className="border border-line/10 bg-surface/60 p-6">
          <h3 className="eyebrow mb-4 text-stone">Items</h3>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-cream"><img src={item.image} alt="" className="h-full w-full object-cover" /></div>
                <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-stone">{item.colour} / {item.size} · Qty {item.quantity}</p></div>
                <span className="text-sm">{formatMoney(item.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-line/10 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>−{formatMoney(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{formatMoney(order.shipping)}</span></div>
            <div className="flex justify-between border-t border-line/10 pt-2 font-medium"><span>Total</span><span>{formatMoney(order.total)}</span></div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="border border-line/10 bg-surface/60 p-6">
            <h3 className="eyebrow mb-4 text-stone">Delivery address</h3>
            <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{order.address ? `${order.address.street}, ${order.address.city}, ${order.address.region}, ${order.address.country}` : "—"}</p>
            <p className="mt-3 text-xs text-stone">{order.customerName} · {order.phone}</p>
          </section>
          <section className="border border-line/10 bg-surface/60 p-6">
            <h3 className="eyebrow mb-4 text-stone">Payment</h3>
            <p className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4 text-accent" /> {order.paymentProvider || "Paystack"} · {order.paymentStatus}</p>
            <p className="mt-3 text-xs text-stone">Reference: {order.paymentReference || "Pending"}</p>
          </section>
          <section className="border border-line/10 bg-surface/60 p-6">
            <h3 className="eyebrow mb-4 text-stone">Activity</h3>
            <ol className="space-y-3">
              {order.timeline.map((event, i) => (
                <li key={i} className="flex gap-3 text-xs">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span><strong className="font-medium capitalize">{event.status.replace(/_/g, " ")}</strong> — {event.note}<span className="block text-stone">{formatDate(event.at)}</span></span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/contact" className="border border-line/20 px-6 py-3 text-xs font-medium uppercase tracking-wider hover:border-line">Need help with this order?</Link>
        <Link href={`/checkout/confirmation/${order.orderNumber}`} className="text-xs text-accent underline underline-offset-4">View confirmation</Link>
      </div>
    </div>
  );
}
