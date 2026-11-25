import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getStoreSettings } from "@/lib/data/admin";
import { getCategories } from "@/lib/data/catalogue";
import { getCart } from "@/lib/data/cart";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, cart] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getCart(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        announcement={settings.announcement}
        cartCount={cart.items.reduce((sum, i) => sum + i.quantity, 0)}
        categories={categories}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
