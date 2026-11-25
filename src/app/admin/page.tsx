import Link from "next/link";
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, ArrowUpRight } from "lucide-react";
import { getDashboardStats, getAuditLogs } from "@/lib/data/admin";
import { getRecentOrders } from "@/lib/data/orders";
import { getStoreSettings } from "@/lib/data/admin";
import { RevenueChart, OrdersChart, ProductPerformanceChart } from "@/components/admin/dashboard-charts";
import { formatMoney, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = [7, 30, 90].includes(Number(sp.range)) ? Number(sp.range) : 30;
  const [stats, orders, logs, settings] = await Promise.all([
    getDashboardStats(range),
    getRecentOrders(6),
    getAuditLogs(6),
    getStoreSettings(),
  ]);

  const cards = [
    { label: "Revenue", value: formatMoney(stats.revenue), icon: DollarSign, note: `${range}-day period` },
    { label: "Orders", value: String(stats.orders), icon: ShoppingCart, note: `${stats.pendingOrders} awaiting payment` },
    { label: "Customers", value: String(stats.customers), icon: Users, note: "Registered accounts" },
    { label: "Products", value: String(stats.products), icon: Package, note: `${stats.lowStock} low-stock variants` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-3xl">Overview</h1><p className="mt-1 text-sm text-stone">A snapshot of your store's performance.</p></div>
        <div className="flex items-center gap-1 border border-line/15 bg-surface p-1">
          {[7, 30, 90].map((days) => (
            <Link
              key={days}
              href={`/admin?range=${days}`}
              className={`px-3 py-1.5 text-xs ${range === days ? "bg-ink text-white" : "text-stone hover:text-fg"}`}
            >
              {days}d
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="border border-line/10 bg-surface p-5">
            <div className="flex items-start justify-between"><Icon className="h-5 w-5 text-accent" /><ArrowUpRight className="h-4 w-4 text-stone" /></div>
            <p className="mt-5 font-display text-3xl">{value}</p>
            <p className="mt-1 text-xs font-medium">{label}</p>
            <p className="mt-1 text-[11px] text-stone">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="border border-line/10 bg-surface p-6">
          <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-xl">Revenue over time</h2><span className="text-[11px] text-stone">GHS</span></div>
          <RevenueChart data={stats.revenueSeries} />
        </section>
        <section className="border border-line/10 bg-surface p-6">
          <h2 className="mb-6 font-display text-xl">Order trends</h2>
          <OrdersChart data={stats.revenueSeries} />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="border border-line/10 bg-surface p-6">
          <h2 className="mb-6 font-display text-xl">Best-selling products</h2>
          <ProductPerformanceChart data={stats.topProducts} />
        </section>
        <section className="border border-line/10 bg-surface p-6">
          <h2 className="mb-6 font-display text-xl">Order status</h2>
          <div className="space-y-3">
            {stats.statusBreakdown.map(({ status, count }) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-32 text-xs capitalize text-stone">{status.replace(/_/g, " ")}</span>
                <div className="h-2 flex-1 bg-cream"><div className="h-full bg-accent" style={{ width: `${stats.orders ? Math.max(2, (count / stats.orders) * 100) : 0}%` }} /></div>
                <span className="w-6 text-right text-xs">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line/10 pt-5 text-center">
            <div><p className="font-display text-xl">{stats.completedOrders}</p><p className="text-[10px] text-stone">Delivered</p></div>
            <div><p className="font-display text-xl">{stats.pendingOrders}</p><p className="text-[10px] text-stone">Pending</p></div>
            <div><p className="font-display text-xl">{stats.cancelledOrders}</p><p className="text-[10px] text-stone">Cancelled</p></div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="border border-line/10 bg-surface p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-xl">Recent orders</h2><Link href="/admin/orders" className="text-xs text-accent underline">View all</Link></div>
          {orders.length ? (
            <div className="divide-y divide-line/10">
              {orders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between py-3 hover:text-accent">
                  <div><p className="text-sm font-medium">{order.orderNumber}</p><p className="text-[11px] text-stone">{order.customerName} · {formatDate(order.createdAt)}</p></div>
                  <div className="text-right"><p className="text-sm">{formatMoney(order.total)}</p><p className="text-[10px] uppercase tracking-wider text-stone">{order.status.replace(/_/g, " ")}</p></div>
                </Link>
              ))}
            </div>
          ) : <p className="py-8 text-center text-sm text-stone">No orders yet. Place a test order to see it here.</p>}
        </section>
        <section className="border border-line/10 bg-surface p-6">
          <h2 className="mb-5 font-display text-xl">Store health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-line/10 pb-3"><span className="text-sm text-stone">Low-stock variants</span><span className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="h-4 w-4 text-amber-500" />{stats.lowStock}</span></div>
            <div className="flex items-center justify-between border-b border-line/10 pb-3"><span className="text-sm text-stone">Average order value</span><span className="text-sm font-medium">{formatMoney(stats.averageOrderValue)}</span></div>
            <div className="flex items-center justify-between border-b border-line/10 pb-3"><span className="text-sm text-stone">Currency</span><span className="text-sm font-medium">{settings.currency}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-stone">Payment provider</span><span className="text-sm font-medium">Paystack</span></div>
          </div>
          <div className="mt-6 border-t border-line/10 pt-5">
            <h3 className="eyebrow mb-3 text-stone">Recent activity</h3>
            {logs.length ? (
              <ul className="space-y-2">
                {logs.map((log) => (
                  <li key={log.id} className="text-[11px] text-stone"><strong className="font-medium text-fg">{log.actorEmail}</strong> {log.action} {log.entity} · {formatDate(log.createdAt)}</li>
                ))}
              </ul>
            ) : <p className="text-xs text-stone">No activity recorded yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
