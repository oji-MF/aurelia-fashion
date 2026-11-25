import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { ConfirmDemoPayment } from "@/components/checkout/confirm-button";
import { getOrderByNumber } from "@/lib/data/orders";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center">
        {paid ? <CheckCircle2 className="mx-auto h-12 w-12 text-success" /> : <Clock className="mx-auto h-12 w-12 text-accent" />}
        <p className="eyebrow mt-6 text-accent">Order {order.orderNumber}</p>
        <h1 className="mt-3 font-display text-4xl">{paid ? "Thank you for your order" : "Awaiting payment confirmation"}</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone">
          {paid
            ? `We've received your payment and your order is being prepared. A confirmation email has been sent to ${order.guestEmail}.`
            : `Your order has been saved. Complete payment to start processing. We sent details to ${order.guestEmail}.`}
        </p>
        {!paid && <ConfirmDemoPayment orderNumber={order.orderNumber} />}
      </div>

      <div className="mt-12 border border-ink/10 bg-white/60 p-6 sm:p-8">
        <h2 className="font-display text-2xl">Order summary</h2>
        <div className="mt-6 space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between gap-4 text-sm">
              <span className="min-w-0 flex-1"><strong className="font-medium">{item.quantity} × {item.name}</strong><span className="block text-xs text-stone">{item.colour} / {item.size}</span></span>
              <span>{formatMoney(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 border-t border-ink/10 pt-5 text-sm">
          <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-success"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>−{formatMoney(order.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-stone">Delivery</span><span>{order.shipping === 0 ? "Complimentary" : formatMoney(order.shipping)}</span></div>
          <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium"><span>Total</span><span>{formatMoney(order.total)}</span></div>
        </div>
        <div className="mt-8 grid gap-6 border-t border-ink/10 pt-6 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2 text-stone">Delivery to</p>
            <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{order.address ? `${order.address.street}, ${order.address.city}, ${order.address.region}, ${order.address.country}` : "Address on file"}</span></p>
            <p className="mt-2 text-xs text-stone">Estimated delivery: {order.deliveryMethod === "express" ? "1–3 business days" : "2–5 business days"}</p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-stone">Placed on</p>
            <p className="text-sm">{formatDate(order.createdAt)}</p>
            <p className="mt-2 text-xs text-stone">Payment: {paid ? "Confirmed" : "Pending"}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="inline-block bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent">Continue shopping</Link>
        <div className="mt-4"><Link href="/account/orders" className="text-xs text-stone underline underline-offset-4">View all my orders</Link></div>
      </div>
    </div>
  );
}
