import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard, Package, FolderTree, Tag, ShoppingCart, Boxes, Ticket,
  Users, ShieldCheck, Home, BarChart3, Settings, Star, LogOut, RotateCcw,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const dynamic = "force-dynamic";

const nav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Brands", href: "/admin/brands", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Promotions", href: "/admin/promotions", icon: Ticket },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Returns", href: "/admin/returns", icon: RotateCcw },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Homepage", href: "/admin/content", icon: Home },
  { label: "Staff & roles", href: "/admin/staff", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="min-h-screen bg-cream/40">
      <div className="lg:flex">
        <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto border-r border-line/10 bg-surface">
          <div className="flex h-16 items-center justify-between border-b border-line/10 px-5">
            <Link href="/" className="font-display text-lg tracking-[0.16em]">AURELIA</Link>
            <span className="rounded-sm bg-accentSolid px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">Admin</span>
          </div>
          <nav className="space-y-0.5 p-3">
            {nav.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] text-fg transition-colors hover:bg-cream hover:text-accent">
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-line/10 p-4">
            <p className="truncate text-xs font-medium">{admin.name}</p>
            <p className="truncate text-[11px] text-stone">{admin.email}</p>
            <form action={logoutAction} className="mt-3">
              <button className="flex items-center gap-2 text-[11px] text-stone hover:text-accent"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="eyebrow text-accent">Administration</p>
              <p className="mt-1 text-xs text-stone">Signed in as {admin.name} · {admin.roles.join(", ").replace(/_/g, " ")}</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle compact />
              <Link href="/" target="_blank" className="border border-line/15 px-4 py-2 text-xs hover:border-accent">View store ↗</Link>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
