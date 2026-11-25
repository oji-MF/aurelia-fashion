import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllOrders } from "@/lib/data/orders";
import { getAllProductsForAdmin } from "@/lib/data/catalogue";
import { getUsers, getCoupons, getDashboardStats } from "@/lib/data/admin";

function csv(rows: (string | number | boolean)[][]) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const type = new URL(request.url).searchParams.get("type") || "orders";
  let rows: (string | number | boolean)[][] = [];
  if (type === "orders") {
    const orders = await getAllOrders();
    rows = [["Order", "Customer", "Email", "Date", "Subtotal", "Discount", "Shipping", "Total", "Status", "Payment"],
      ...orders.map((o) => [o.orderNumber, o.customerName, o.guestEmail, o.createdAt, o.subtotal / 100, o.discount / 100, o.shipping / 100, o.total / 100, o.status, o.paymentStatus])];
  } else if (type === "products") {
    const products = await getAllProductsForAdmin();
    rows = [["Name", "SKU", "Brand", "Category", "Price", "Compare at", "Stock", "Status"],
      ...products.map((p) => [p.name, p.variants[0]?.sku || "", p.brand?.name || "", p.category?.name || "", p.price / 100, p.comparePrice ? p.comparePrice / 100 : "", p.variants.reduce((s, v) => s + v.stock, 0), p.status])];
  } else if (type === "customers") {
    const users = await getUsers();
    rows = [["Name", "Email", "Phone", "Roles", "Created"], ...users.map((u) => [u.name, u.email, u.phone, u.roles.join("|"), u.createdAt])];
  } else if (type === "promotions") {
    const coupons = await getCoupons();
    rows = [["Code", "Type", "Value", "Used", "Limit", "Ends", "Active"], ...coupons.map((c) => [c.code, c.type, c.value, c.usedCount, c.usageLimit, c.endAt, c.active])];
  } else if (type === "summary") {
    const stats = await getDashboardStats(30);
    rows = [["Metric", "Value"], ["Revenue (GHS)", stats.revenue / 100], ["Orders", stats.orders], ["Customers", stats.customers], ["Products", stats.products], ["Average order value (GHS)", stats.averageOrderValue / 100], ["Low stock variants", stats.lowStock]];
  }
  return new NextResponse(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aurelia-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
