import { getUsers } from "@/lib/data/admin";
import { getOrdersForUser } from "@/lib/data/orders";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const users = await getUsers();
  const withCounts = await Promise.all(users.map(async (u) => ({ ...u, orders: (await getOrdersForUser(u.id)).length })));

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <p className="mt-1 text-sm text-stone">{users.length} registered accounts</p>
      <div className="mt-6 overflow-x-auto border border-line/10 bg-surface">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-line/10 bg-cream/40 text-[10px] uppercase tracking-wider text-stone"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Joined</th></tr></thead>
          <tbody className="divide-y divide-line/10">
            {withCounts.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-xs">{user.email}</td>
                <td className="px-4 py-3 text-xs text-stone">{user.phone || "—"}</td>
                <td className="px-4 py-3 text-xs">{user.orders}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-cream px-2 py-1 text-[10px] capitalize">{user.roles.join(", ").replace(/_/g, " ")}</span></td>
                <td className="px-4 py-3 text-xs text-stone">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[11px] text-stone">Passwords and payment details are never displayed in the admin area.</p>
    </div>
  );
}
