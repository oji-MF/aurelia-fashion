import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "Accessories", description: "Watches, belts, scarves and sunglasses at AURELIA." };
export default function AccessoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage title="Accessories" eyebrow="The finishing touches" description="The small things that make an outfit yours — watches, belts, scarves, sunglasses and more." filters={{ category: "accessories" }} breadcrumbs={[{ label: "Accessories" }]} searchParams={searchParams} />;
}
