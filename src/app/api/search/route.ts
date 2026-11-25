import { NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/data/catalogue";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = z.string().min(1).max(100).safeParse(searchParams.get("q") || "");
  if (!parsed.success) return NextResponse.json({ items: [] });
  const limit = Math.min(10, Math.max(1, Number(searchParams.get("limit") || 6)));
  const products = await searchSuggestions(parsed.data, limit);
  return NextResponse.json({
    items: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0],
      price: p.price,
      brand: p.brand?.name || "AURELIA",
    })),
  });
}
