import { CataloguePage } from "@/components/catalogue/catalogue-page";
export const metadata = { title: "New Arrivals", description: "The latest pieces from AURELIA." };
export default function NewArrivalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CataloguePage title="New Arrivals" eyebrow="Just landed" description="The newest additions to the AURELIA collection — fresh silhouettes, new colours and the pieces our stylists are wearing first." filters={{ sort: "newest" }} breadcrumbs={[{ label: "New Arrivals" }]} searchParams={searchParams} />;
}
