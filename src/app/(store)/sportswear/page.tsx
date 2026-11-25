import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "Sportswear", description: "Performance-led activewear at AURELIA." };
export default function SportswearPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage title="Sportswear" eyebrow="Move" description="Performance-led pieces for movement and recovery, designed to look as good off-duty as on." filters={{ category: "sportswear" }} breadcrumbs={[{ label: "Sportswear" }]} searchParams={searchParams} />;
}
