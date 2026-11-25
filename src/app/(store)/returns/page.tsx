import { InfoPage } from "@/components/store/info-page";
export const metadata = { title: "Returns & Refunds" };
export default function ReturnsPage() {
  return <InfoPage eyebrow="Returns" title="Returns & refunds" intro="We want you to love your purchase. If something isn't right, our returns process is straightforward and fair." sections={[
    { heading: "Return window", body: "Items may be returned within 14 days of delivery, provided they are unworn, unwashed and have their original tags attached. Sale items are returnable unless clearly marked as final sale." },
    { heading: "How to return", body: "Contact our team with your order number and the item you'd like to return. We'll arrange collection or provide a drop-off point. Once received and inspected, we'll process your refund." },
    { heading: "Refunds", body: "Refunds are issued to the original payment method within 7 business days of the return being approved. Delivery charges are refunded when the entire order is returned or when the item was faulty." },
  ]} />;
}
