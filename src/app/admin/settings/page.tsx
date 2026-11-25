import { getStoreSettings } from "@/lib/data/admin";
import { SettingsForm } from "@/components/admin/settings-form";
export const dynamic = "force-dynamic";
export default async function AdminSettingsPage() {
  return <SettingsForm settings={await getStoreSettings()} />;
}
