import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "Sale", description: "Shop the AURELIA sale — reduced pieces from every collection." };
export default function SalePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage title="The Sale" eyebrow="Reduced" description="Selected pieces, considered prices. Our sale edit changes regularly — find your next favourite for less." filters={{ discount: true }} breadcrumbs={[{ label: "Sale" }]} searchParams={searchParams} />;
}
