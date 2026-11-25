import { getDashboardStats } from "@/lib/data/admin";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

const exports = [
  ["orders", "Orders report"],
  ["products", "Product performance"],
  ["customers", "Customer report"],
  ["promotions", "Discount usage"],
  ["summary", "30-day summary"],
];

export default async function AdminReportsPage() {
  const stats = await getDashboardStats(30);
  return (
    <div>
      <h1 className="font-display text-3xl">Reports & analytics</h1>
      <p className="mt-1 text-sm text-stone">Download store data as CSV for further analysis.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {exports.map(([type, label]) => (
          <a key={type} href={`/api/admin/export?type=${type}`} className="flex items-center justify-between border border-ink/10 bg-white p-5 transition-colors hover:border-ink/40">
            <div><p className="font-medium">{label}</p><p className="mt-1 text-[11px] text-stone">CSV download</p></div>
            <span className="text-xs text-accent">Download ↗</span>
          </a>
        ))}
      </div>
      <section className="mt-8 border border-ink/10 bg-white p-6">
        <h2 className="font-display text-xl">30-day summary</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Revenue", formatMoney(stats.revenue)],
            ["Orders", String(stats.orders)],
            ["Average order value", formatMoney(stats.averageOrderValue)],
            ["Low-stock variants", String(stats.lowStock)],
          ].map(([label, value]) => <div key={label}><p className="font-display text-2xl">{value}</p><p className="mt-1 text-xs text-stone">{label}</p></div>)}
        </div>
      </section>
    </div>
  );
}
