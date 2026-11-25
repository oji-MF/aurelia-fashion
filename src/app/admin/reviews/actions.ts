"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { moderateReview } from "@/lib/data/reviews";
import { audit } from "@/lib/data/admin";
import type { Review } from "@/lib/types";

export async function moderateReviewAction(id: string, status: Review["status"]) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");
  await moderateReview(id, status);
  await audit({ actorId: admin.id, actorEmail: admin.email, action: "moderate", entity: "review", entityId: id, details: status });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
