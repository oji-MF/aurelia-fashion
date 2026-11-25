import { InfoPage } from "@/components/store/info-page";
export const metadata = { title: "Delivery Information" };
export default function DeliveryPage() {
  return <InfoPage eyebrow="Delivery" title="Getting it to you" intro="We deliver across Ghana and internationally. All delivery charges are calculated at checkout based on your destination and chosen method." sections={[
    { heading: "Delivery options", body: "Standard delivery (2–5 business days) is GH₵15 within Ghana, complimentary on orders over GH₵500. Express delivery (1–3 business days) is GH₵35. International rates are calculated at checkout." },
    { heading: "Order tracking", body: "Once your order is dispatched, you can follow its progress from your account under Orders. Status updates include processing, packed, dispatched, in transit and delivered." },
    { heading: "Delivery issues", body: "If your parcel is delayed or arrives damaged, contact us with your order number. We'll work with the courier to resolve it and arrange a replacement or refund where appropriate." },
  ]} />;
}
