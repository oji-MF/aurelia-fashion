import type { Metadata } from "next";
import { CataloguePage } from "@/components/catalogue/catalogue-page";

export const metadata: Metadata = {
  title: "Women's Fashion",
  description: "Discover women's fashion at AURELIA — considered clothing, dresses, shoes and accessories for the modern wardrobe.",
};

export default function WomenPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <CataloguePage
      title="Women's Fashion"
      eyebrow="The collection"
      description="Elevated essentials and statement pieces, designed to move with you through every season."
      filters={{ gender: "women" }}
      breadcrumbs={[{ label: "Women" }]}
      searchParams={searchParams}
    />
  );
}
