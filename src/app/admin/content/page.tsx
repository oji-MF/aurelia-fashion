import { ContentEditor } from "@/components/admin/content-editor";
import { getHomepageContent } from "@/lib/data/admin";
export const dynamic = "force-dynamic";
export default async function AdminContentPage() {
  const content = await getHomepageContent();
  return <ContentEditor content={JSON.stringify(content, null, 2)} />;
}
