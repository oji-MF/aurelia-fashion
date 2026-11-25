import { getReturnRequests } from "@/lib/data/returns";
import { ReturnControls } from "@/components/admin/return-controls";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const requests = await getReturnRequests();
  return (
    <div>
      <h1 className="font-display text-3xl">Returns</h1>
      <p className="mt-1 text-sm text-stone">{requests.filter((r) => r.status === "pending").length} awaiting review</p>
      <div className="mt-6 space-y-3">
        {requests.map((item) => (
          <div key={item.id} className="border border-line/10 bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="mt-1 text-xs text-stone">{item.orderNumber} · {item.reason} · {formatDate(item.createdAt)}</p>
                <p className="mt-2 text-sm text-stone">{item.details}</p>
              </div>
              <ReturnControls id={item.id} status={item.status} />
            </div>
          </div>
        ))}
        {!requests.length && <p className="border border-dashed border-line/15 p-12 text-center text-sm text-stone">No return requests yet.</p>}
      </div>
    </div>
  );
}
