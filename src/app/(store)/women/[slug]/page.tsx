import { notFound } from "next/navigation";
import { CataloguePage } from "@/components/catalogue/catalogue-page";
import { getCategoryBySlug } from "@/lib/data/catalogue";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name || "Collection", description: category?.description };
}

export default async function WomenCategoryPage({
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
      eyebrow="Women"
      description={category.description}
      filters={{ category: slug, gender: "women" }}
      breadcrumbs={[{ label: "Women", href: "/women" }, { label: category.name }]}
      searchParams={searchParams}
    />
  );
}
