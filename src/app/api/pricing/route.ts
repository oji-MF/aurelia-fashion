import { rateLimit } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculatePricing } from "@/lib/data/orders";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), variantId: z.string(), quantity: z.number().int().min(1) })),
  couponCode: z.string().optional(),
  deliveryMethod: z.enum(["standard", "express"]).default("standard"),
  country: z.string().default("Ghana"),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "pricing", 30);
  if (limited) return limited;
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const user = await getCurrentUser();
  const pricing = await calculatePricing({ ...parsed.data, userId: user?.id ?? null });
  return NextResponse.json(pricing);
}
