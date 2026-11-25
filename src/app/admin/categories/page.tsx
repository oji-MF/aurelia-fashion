import { CategoryManager } from "@/components/admin/category-manager";
import { getCategories } from "@/lib/data/catalogue";
export const dynamic = "force-dynamic";
export default async function AdminCategoriesPage() {
  return <CategoryManager categories={await getCategories(true)} />;
}
