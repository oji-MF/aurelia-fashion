"use client";

import { useState, useTransition } from "react";
import { orderStatusAction, refundAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = [
  "pending_payment", "payment_confirmed", "processing", "packed", "dispatched",
  "in_transit", "delivered", "cancelled", "refunded",
];

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        setValue(next);
        startTransition(async () => {
          const result = await orderStatusAction(orderId, next);
          toast(result.message, result.ok ? "success" : "error");
        });
      }}
      className="border border-ink/15 bg-white px-2 py-1.5 text-[11px] capitalize outline-none disabled:opacity-50"
    >
      {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
    </select>
  );
}

export function RefundButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  return <button disabled={pending} onClick={() => { if (!confirm("Issue a refund for this order?")) return; startTransition(async () => { const r = await refundAction(orderId); toast(r.message, r.ok ? "success" : "error"); }); }} className="border border-ink/15 px-3 py-1.5 text-[11px] hover:border-accent hover:text-accent disabled:opacity-50">Refund</button>;
}
