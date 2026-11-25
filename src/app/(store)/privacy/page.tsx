import { InfoPage } from "@/components/store/info-page";
export const metadata = { title: "Privacy Policy" };
export default function PrivacyPage() {
  return <InfoPage eyebrow="Legal" title="Privacy policy" intro="We respect your privacy. This policy explains what information we collect, why we collect it, and the controls you have." sections={[
    { heading: "Information we collect", body: "We collect details you provide when you create an account, place an order, subscribe to our newsletter or contact us. This may include your name, email, phone number, delivery address and order history." },
    { heading: "How we use it", body: "We use your information to fulfil orders, provide customer support, send service notifications and — with your consent — share updates about new collections. We never sell your personal data." },
    { heading: "Storage and security", body: "Customer data is stored securely with Appwrite. Access is restricted to authorised staff, and sensitive actions are protected by role-based permissions and audit logging." },
    { heading: "Your rights", body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can also unsubscribe from marketing emails using the link in any message." },
  ]} />;
}
