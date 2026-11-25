import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "Search", description: "Search the AURELIA collection." };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q || "";
  return (
    <CataloguePage
      title={q ? `Results for “${q}”` : "Search the collection"}
      eyebrow="Find your piece"
      description="Search by product name, brand, category, style or SKU."
      filters={{ q }}
      breadcrumbs={[{ label: "Search" }]}
      searchParams={searchParams}
    />
  );
}
