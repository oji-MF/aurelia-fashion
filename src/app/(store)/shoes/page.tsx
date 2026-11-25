import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "Shoes", description: "Sneakers, boots, heels and loafers at AURELIA." };
export default function ShoesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage title="Shoes" eyebrow="Footwear" description="Footwear that carries you through the season — from everyday sneakers to considered occasion pieces." filters={{ category: "shoes" }} breadcrumbs={[{ label: "Shoes" }]} searchParams={searchParams} />;
}
