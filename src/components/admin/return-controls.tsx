"use client";

import { useState, useTransition } from "react";
import { updateReturnAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { ReturnRequest } from "@/lib/types";

export function ReturnControls({ id, status }: { id: string; status: ReturnRequest["status"] }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as ReturnRequest["status"];
        setValue(next);
        startTransition(async () => {
          const result = await updateReturnAction(id, next);
          toast(result.message, result.ok ? "success" : "error");
        });
      }}
      className={cn("border border-line/15 bg-surface px-3 py-2 text-xs capitalize outline-none", pending && "opacity-50")}
    >
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
      <option value="completed">Completed</option>
    </select>
  );
}
