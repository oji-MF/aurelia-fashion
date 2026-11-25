import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "Beauty", description: "Beauty essentials and fragrance at AURELIA." };
export default function BeautyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage title="Beauty" eyebrow="The ritual" description="Considered beauty essentials and fragrance to complete your everyday ritual." filters={{ category: "beauty" }} breadcrumbs={[{ label: "Beauty" }]} searchParams={searchParams} />;
}
