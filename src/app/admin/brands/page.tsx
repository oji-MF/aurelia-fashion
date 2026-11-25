import { BrandManager } from "@/components/admin/brand-manager";
import { getBrandsForAdmin } from "@/lib/data/admin";
export const dynamic = "force-dynamic";
export default async function AdminBrandsPage() {
  return <BrandManager brands={await getBrandsForAdmin()} />;
}
