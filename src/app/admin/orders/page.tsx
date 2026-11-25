import Link from "next/link";
import { getAllOrders } from "@/lib/data/orders";
import { OrderStatusControl } from "@/components/admin/order-status";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-stone">{orders.length} orders in total</p>
      <div className="mt-6 overflow-x-auto border border-ink/10 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-cream/40 text-[10px] uppercase tracking-wider text-stone"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">View</th></tr></thead>
          <tbody className="divide-y divide-ink/10">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-cream/30">
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3"><span className="block text-xs">{order.customerName}</span><span className="text-[11px] text-stone">{order.guestEmail}</span></td>
                <td className="px-4 py-3 text-xs text-stone">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">{formatMoney(order.total)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${order.paymentStatus === "paid" ? "bg-success/10 text-success" : order.paymentStatus === "failed" ? "bg-accent/10 text-accent" : "bg-cream text-stone"}`}>{order.paymentStatus}</span></td>
                <td className="px-4 py-3"><OrderStatusControl orderId={order.id} status={order.status} /></td>
                <td className="px-4 py-3 text-right"><Link href={`/admin/orders/${order.id}`} className="text-xs text-accent underline">Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="p-12 text-center text-sm text-stone">No orders yet. Place a test order from the storefront to see it here.</p>}
      </div>
    </div>
  );
}
