import { InfoPage } from "@/components/store/info-page";
export const metadata = { title: "Terms & Conditions" };
export default function TermsPage() {
  return <InfoPage eyebrow="Legal" title="Terms & conditions" intro="These terms govern your use of the AURELIA store. By placing an order you agree to them." sections={[
    { heading: "Orders and pricing", body: "All prices are shown in Ghana Cedis (GHS) and include applicable taxes. Orders are subject to stock availability. We reserve the right to cancel or refuse any order where pricing or stock information was incorrect." },
    { heading: "Payments", body: "Payments are processed securely through our payment providers. We never store raw card details. An order is only confirmed once payment has been verified by the provider." },
    { heading: "Intellectual property", body: "All content, imagery and brand elements on this site belong to AURELIA or our partners and may not be reproduced without permission." },
    { heading: "Limitation of liability", body: "To the fullest extent permitted by law, AURELIA is not liable for indirect or consequential losses arising from use of this site. Nothing in these terms limits your statutory rights." },
  ]} />;
}
