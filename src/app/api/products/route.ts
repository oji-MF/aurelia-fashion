import { NextResponse } from "next/server";
import { listProducts } from "@/lib/data/catalogue";
import type { ProductFilters } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: ProductFilters = {
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    sort: (searchParams.get("sort") as ProductFilters["sort"]) || undefined,
    page: Number(searchParams.get("page") || 1),
    limit: Math.min(50, Number(searchParams.get("limit") || 12)),
  };
  const result = await listProducts(filters);
  return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
