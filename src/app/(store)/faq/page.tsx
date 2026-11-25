import { InfoPage } from "@/components/store/info-page";
export const metadata = { title: "FAQs" };
export default function FaqPage() {
  return <InfoPage eyebrow="Help centre" title="Frequently asked questions" intro="Find quick answers about sizing, delivery, returns and payments. If you can't find what you need, our team is happy to help." sections={[
    { heading: "How do I choose my size?", body: "Each product page lists the available sizes and shows which options are in stock. Our garments follow standard international sizing — consult the size guide on any product page for measurements. If you're between sizes, we generally recommend sizing up for a relaxed fit." },
    { heading: "When will my order arrive?", body: "Standard delivery takes 2–5 business days within Ghana; express delivery takes 1–3 business days. International orders typically take 7–14 business days. You'll receive tracking information once your order is dispatched." },
    { heading: "How do returns work?", body: "You can return unworn items with tags attached within 14 days of delivery. Initiate a return from your account or contact our customer service team. Refunds are processed to the original payment method within 7 business days." },
    { heading: "Which payment methods do you accept?", body: "We accept Visa, Mastercard and Mobile Money through Paystack, plus international cards through Stripe where available. All payments are processed securely — we never store card details." },
    { heading: "Can I change or cancel my order?", body: "Orders can be amended before dispatch. Contact us as soon as possible with your order number and we'll do our best to help. Once dispatched, items can be returned under our returns policy." },
  ]} />;
}
