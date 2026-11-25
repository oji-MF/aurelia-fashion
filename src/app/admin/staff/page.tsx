import { getUsers } from "@/lib/data/admin";
import { RoleManager } from "@/components/admin/role-manager";

export const dynamic = "force-dynamic";

const allRoles = ["super_admin", "admin", "product_manager", "order_manager", "inventory_manager", "customer_support", "marketing_manager", "customer"];

export default async function AdminStaffPage() {
  const users = await getUsers();
  return <RoleManager users={users} roles={allRoles} />;
}
