import { CouponManager } from "@/components/admin/coupon-manager";
import { getCoupons } from "@/lib/data/admin";
export const dynamic = "force-dynamic";
export default async function AdminPromotionsPage() {
  return <CouponManager coupons={await getCoupons()} />;
}
