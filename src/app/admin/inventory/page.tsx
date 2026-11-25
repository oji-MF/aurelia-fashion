import { InventoryManager } from "@/components/admin/inventory-manager";
import { getAllProductsForAdmin } from "@/lib/data/catalogue";
import { getInventoryMovements } from "@/lib/data/admin";
export const dynamic = "force-dynamic";
export default async function AdminInventoryPage() {
  const [products, movements] = await Promise.all([getAllProductsForAdmin(), getInventoryMovements()]);
  return <InventoryManager products={products} movements={movements} />;
}
