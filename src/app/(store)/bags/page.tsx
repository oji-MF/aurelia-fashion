import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "Bags", description: "Totes, shoulder bags and crossbodies at AURELIA." };
export default function BagsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage title="Bags" eyebrow="Carry" description="Considered bags designed to be lived in — structured totes, soft shoulder bags and everyday crossbodies." filters={{ category: "bags" }} breadcrumbs={[{ label: "Bags" }]} searchParams={searchParams} />;
}
