"use client";

import { useActionState, useEffect, useState } from "react";
import { returnRequestAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate } from "@/lib/utils";
import type { Order, ReturnRequest } from "@/lib/types";

const initial: ActionState = { ok: false, message: "" };

export function ReturnsView({ orders, returns }: { orders: Order[]; returns: ReturnRequest[] }) {
  const [state, action, pending] = useActionState(returnRequestAction, initial);
  const [orderId, setOrderId] = useState(orders[0]?.id || "");
  const [productId, setProductId] = useState("");
  const { toast } = useToast();
  const selectedOrder = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
  }, [state, toast]);

  return (
    <div>
      <h2 className="font-display text-2xl">Returns & refunds</h2>
      <p className="mb-8 mt-2 text-sm text-stone">Request a return for an item from a delivered or paid order.</p>

      {orders.length ? (
        <form action={action} className="max-w-xl space-y-4 border border-line/10 bg-surface/60 p-6">
          <label className="block">
            <span className="label">Order</span>
            <select value={orderId} onChange={(e) => { setOrderId(e.target.value); setProductId(""); }} className="input" required>
              {orders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber} · {formatDate(order.createdAt)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label">Item to return</span>
            <select name="productId" value={productId} onChange={(e) => setProductId(e.target.value)} className="input" required>
              <option value="">Select an item</option>
              {selectedOrder?.items.map((item, i) => (
                <option key={`${item.productId}-${i}`} value={item.productId}>{item.name} ({item.colour} / {item.size})</option>
              ))}
            </select>
          </label>
          <input type="hidden" name="orderId" value={orderId} />
          <label className="block">
            <span className="label">Reason</span>
            <select name="reason" className="input" required>
              <option>Wrong size</option>
              <option>Item damaged</option>
              <option>Not as described</option>
              <option>Changed my mind</option>
              <option>Other</option>
            </select>
          </label>
          <label className="block"><span className="label">Details</span><textarea name="details" rows={4} minLength={10} required className="input resize-y" placeholder="Tell us a little more…" /></label>
          <button disabled={pending || !productId} className="bg-ink px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">{pending ? "Submitting…" : "Submit return request"}</button>
        </form>
      ) : (
        <p className="border border-dashed border-line/15 p-8 text-sm text-stone">You have no paid orders eligible for return yet.</p>
      )}

      <div className="mt-10">
        <h3 className="font-display text-xl">Your requests</h3>
        {returns.length ? (
          <div className="mt-4 divide-y divide-line/10 border border-line/10 bg-surface/60">
            {returns.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div><p className="text-sm font-medium">{item.productName}</p><p className="mt-1 text-xs text-stone">{item.orderNumber} · {item.reason} · {formatDate(item.createdAt)}</p></div>
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", item.status === "approved" || item.status === "completed" ? "bg-success/10 text-success" : item.status === "rejected" ? "bg-cream text-stone" : "bg-amber-100 text-amber-800")}>{item.status}</span>
              </div>
            ))}
          </div>
        ) : <p className="mt-4 text-sm text-stone">No return requests yet.</p>}
      </div>
    </div>
  );
}
