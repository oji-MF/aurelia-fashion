"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmDemoPaymentAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";

export function ConfirmDemoPayment({ orderNumber }: { orderNumber: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (done) return <p className="mt-4 text-sm text-success">Payment confirmed. Your order is being prepared.</p>;

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await confirmDemoPaymentAction(orderNumber);
          toast(result.message, result.ok ? "success" : "error");
          if (result.ok) {
            setDone(true);
            router.refresh();
          }
        })
      }
      className="mt-5 border border-line/20 px-6 py-3 text-xs font-medium uppercase tracking-wider hover:border-line disabled:opacity-50"
    >
      {pending ? "Confirming…" : "Simulate payment confirmation (demo)"}
    </button>
  );
}
