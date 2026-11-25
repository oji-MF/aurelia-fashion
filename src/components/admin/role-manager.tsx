"use client";

import { useState, useTransition } from "react";
import { rolesAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import type { Role, User } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleManager({ users, roles }: { users: User[]; roles: string[] }) {
  const [selected, setSelected] = useState<Record<string, Role[]>>({});
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function toggle(userId: string, role: Role, current: Role[]) {
    const next = current.includes(role) ? current.filter((r) => r !== role) : [...current, role];
    setSelected((prev) => ({ ...prev, [userId]: next }));
    startTransition(async () => {
      const result = await rolesAction(userId, next);
      toast(result.message, result.ok ? "success" : "error");
    });
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Staff & permissions</h1>
      <p className="mt-1 text-sm text-stone">Role-based access control. Changes take effect on the next request.</p>
      <div className="mt-6 space-y-4">
        {users.map((user) => {
          const current = selected[user.id] || user.roles;
          return (
            <div key={user.id} className="border border-ink/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">{user.name}</p><p className="text-xs text-stone">{user.email}</p></div><span className="text-[10px] uppercase tracking-wider text-stone">{current.join(", ").replace(/_/g, " ")}</span></div>
              <div className={cn("mt-4 flex flex-wrap gap-2", pending && "opacity-60")}>
                {roles.map((role) => (
                  <button key={role} onClick={() => toggle(user.id, role as Role, current)} className={cn("rounded-full border px-3 py-1.5 text-[11px] capitalize transition-colors", current.includes(role as Role) ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-ink")}>
                    {role.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
