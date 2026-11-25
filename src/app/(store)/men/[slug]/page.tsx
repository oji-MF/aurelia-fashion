import { notFound } from "next/navigation";
import { CataloguePage } from "@/components/catalogue/catalogue-page";
import { getCategoryBySlug } from "@/lib/data/catalogue";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name || "Collection", description: category?.description };
}

export default async function MenCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  return (
    <CataloguePage
      title={category.name}
      eyebrow="Men"
      description={category.description}
      filters={{ category: slug, gender: "men" }}
      breadcrumbs={[{ label: "Men", href: "/men" }, { label: category.name }]}
      searchParams={searchParams}
    />
  );
}
