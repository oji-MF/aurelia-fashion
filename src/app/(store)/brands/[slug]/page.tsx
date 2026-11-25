import { notFound } from "next/navigation";
import { CataloguePage } from "@/components/catalogue/catalogue-page";
import { getBrandBySlug } from "@/lib/data/catalogue";

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  return (
    <CataloguePage
      title={brand.name}
      eyebrow="Label"
      description={brand.description}
      filters={{ brand: [brand.id] }}
      breadcrumbs={[{ label: "Brands" }, { label: brand.name }]}
      searchParams={searchParams}
    />
  );
}
