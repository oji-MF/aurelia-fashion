import { AddressManager } from "@/components/account/address-form";
import { getCurrentUser } from "@/lib/auth";
import { getAddresses } from "@/lib/data/account";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const addresses = await getAddresses(user.id);
  return <AddressManager addresses={addresses} />;
}
