import type { Metadata } from "next";
import { CataloguePage } from "@/components/catalogue/catalogue-page";

export const metadata: Metadata = {
  title: "Men's Fashion",
  description: "Modern menswear at AURELIA — shirts, denim, knitwear, outerwear and footwear with a considered point of view.",
};

export default function MenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CataloguePage
      title="Men's Fashion"
      eyebrow="The collection"
      description="Refined staples and off-duty favourites, built around quality materials and an easy silhouette."
      filters={{ gender: "men" }}
      breadcrumbs={[{ label: "Men" }]}
      searchParams={searchParams}
    />
  );
}
