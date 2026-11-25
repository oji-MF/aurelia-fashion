import { ReturnsView } from "@/components/account/returns-view";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data/orders";
import { getReturnRequests } from "@/lib/data/returns";

export const dynamic = "force-dynamic";

export default async function AccountReturnsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [orders, returns] = await Promise.all([
    getOrdersForUser(user.id),
    getReturnRequests(user.id),
  ]);
  return <ReturnsView orders={orders.filter((o) => o.paymentStatus === "paid")} returns={returns} />;
}
