import Link from "next/link";
import { Instagram, Facebook, Youtube, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import type { StoreSettings } from "@/lib/types";

const columns = [
  {
    title: "Shop",
    links: [
      ["New Arrivals", "/new-arrivals"], ["Women", "/women"], ["Men", "/men"],
      ["Shoes", "/shoes"], ["Accessories", "/accessories"], ["Sale", "/sale"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Contact Us", "/contact"], ["FAQs", "/faq"], ["Delivery Information", "/delivery"],
      ["Returns & Refunds", "/returns"], ["Order Tracking", "/account/orders"], ["Size Guide", "/faq#sizing"],
    ],
  },
  {
    title: "About",
    links: [
      ["About Us", "/about"], ["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"],
      ["Our Story", "/about"], ["Careers", "/about"],
    ],
  },
];

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 border-b border-white/10 py-16 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr]">
          <div>
            <Link href="/" className="font-display text-2xl tracking-[0.18em]">AURELIA</Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">{settings.aboutText}</p>
            <div className="mt-6 flex gap-4">
              {[
                { icon: Instagram, href: settings.social.instagram, label: "Instagram" },
                { icon: Facebook, href: settings.social.facebook, label: "Facebook" },
                { icon: Youtube, href: settings.social.tiktok, label: "TikTok" },
                { icon: Twitter, href: settings.social.x, label: "X" },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="text-white/60 transition-colors hover:text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-5 text-white/80">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label + href}>
                    <Link href={href} className="text-sm text-white/55 transition-colors hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="eyebrow mb-5 text-white/80">Stay in the know</h3>
            <p className="mb-5 text-sm text-white/55">Be first to hear about new collections, offers and events.</p>
            <NewsletterForm dark />
            <div className="mt-6 space-y-2 text-xs text-white/50">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{settings.contactEmail}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{settings.contactPhone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Accra, Ghana</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-7 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="tracking-wide">We accept</span>
            {settings.paymentMethods.map((method) => (
              <span key={method} className="rounded-sm border border-white/20 px-2 py-1 text-[10px] tracking-wide text-white/70">{method}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
