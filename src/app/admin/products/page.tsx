import { ProductManager } from "@/components/admin/product-manager";
import { getAllProductsForAdmin, getBrands, getCategories } from "@/lib/data/catalogue";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([
    getAllProductsForAdmin(),
    getCategories(true),
    getBrands(true),
  ]);
  return <ProductManager products={products} categories={categories} brands={brands} />;
}
