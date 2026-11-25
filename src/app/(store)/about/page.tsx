import { InfoPage } from "@/components/store/info-page";
export const metadata = { title: "About Us" };
export default function AboutPage() {
  return <InfoPage eyebrow="Our story" title="Style, considered" intro="AURELIA is a modern fashion house built on a simple idea: great style should feel effortless. We create collections for real lives — elevated essentials, statement pieces and everything in between." sections={[
    { heading: "What we believe", body: "Fashion should be bought with intention. We focus on considered silhouettes, honest materials and details that reward a closer look. Our pieces are designed to be worn, loved and kept — not just for one season." },
    { heading: "Our approach", body: "We work with a small network of makers and brands who share our standards. Every collection is edited down to the pieces that earn their place, from everyday staples to the occasional statement." },
    { heading: "Made for Ghana, made for everywhere", body: "AURELIA is rooted in Accra and shaped by the energy of the city. Our collections travel well — designed for warm days, layered evenings and the pace of modern life." },
    { heading: "Responsibility", body: "We are committed to better practices across our supply chain, from material selection to packaging. We are always improving, and we are transparent about where we are on that journey." },
  ]} />;
}
