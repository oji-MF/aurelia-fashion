import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRound, Package, MapPin, Heart, Star, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const links = [
  { href: "/account", label: "Overview", icon: UserRound },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/profile", label: "Profile", icon: Settings },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
      <p className="eyebrow mb-3 text-accent">My account</p>
      <h1 className="font-display text-4xl">Hello, {user.name.split(" ")[0]}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside>
          <nav className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-3 py-3 text-sm text-fg transition-colors hover:bg-cream hover:text-accent">
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="mt-6 border-t border-line/10 pt-6">
            <button className="flex items-center gap-3 px-3 py-3 text-sm text-stone hover:text-accent"><LogOut className="h-4 w-4" /> Sign out</button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
