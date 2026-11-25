"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search, UserRound, Heart, ShoppingBag, Menu, X, ChevronDown, ArrowRight, Loader2,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type Suggestion = { id: string; name: string; slug: string; image: string; price: number; brand: string };

const navItems = [
  { label: "Women", href: "/women", mega: "women" },
  { label: "Men", href: "/men", mega: "men" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Clothing", href: "/women/clothing", mega: "clothing" },
  { label: "Shoes", href: "/shoes" },
  { label: "Accessories", href: "/accessories" },
  { label: "Sportswear", href: "/sportswear" },
  { label: "Sale", href: "/sale", highlight: true },
];

export function Header({
  announcement,
  cartCount,
  categories,
}: {
  announcement: string;
  cartCount: number;
  categories: Category[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [promoOpen, setPromoOpen] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!cancelled) setSuggestions(data.items || []);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const megaLinks = (type: string) => {
    const gender = type === "women" ? "women" : type === "men" ? "men" : null;
    const list = categories.filter((c) => (gender ? c.gender === gender || c.gender === "unisex" : true));
    return list.slice(0, 8);
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-md">
      {promoOpen && announcement && (
        <div className="relative flex h-9 items-center justify-center bg-ink px-4 text-center text-[11px] font-medium tracking-wide text-white">
          <p className="truncate">{announcement}</p>
          <button
            onClick={() => setPromoOpen(false)}
            aria-label="Dismiss announcement"
            className="absolute right-4 text-white/60 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="border-b border-line/10">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-10">
          <button
            className="-ml-2 p-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="shrink-0" aria-label="AURELIA home">
            <span className="font-display text-[22px] font-semibold tracking-[0.18em]">AURELIA</span>
          </Link>

          <nav
            className="ml-4 hidden h-16 flex-1 items-center justify-center gap-5 xl:gap-7"
            onMouseLeave={() => setActiveMega(null)}
          >
            {navItems.map((item) => (
              <div key={item.label} className="relative h-full">
                <Link
                  href={item.href}
                  onMouseEnter={() => setActiveMega(item.mega || null)}
                  className={cn(
                    "flex h-full items-center gap-1 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.08em] transition-colors hover:text-accent",
                    item.highlight && "text-accent",
                    pathname.startsWith(item.href) && !item.highlight && "text-accent",
                  )}
                >
                  {item.label}
                  {item.mega && <ChevronDown className="h-3 w-3" />}
                </Link>
              </div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
                className="p-2 hover:text-accent"
              >
                <Search className="h-[19px] w-[19px]" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-11 w-[min(90vw,420px)] border border-line/10 bg-surface p-4 shadow-lift">
                  <div className="flex items-center gap-2 border-b border-line/15 pb-2">
                    <Search className="h-4 w-4 text-stone" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search products, brands, SKU..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-stone/70"
                    />
                    {searching && <Loader2 className="h-4 w-4 animate-spin text-stone" />}
                  </div>
                  <div className="mt-3 max-h-80 overflow-y-auto">
                    {suggestions.length > 0 ? (
                      suggestions.map((s) => (
                        <Link
                          key={s.id}
                          href={`/product/${s.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 py-2 hover:bg-cream/60"
                        >
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-cream">
                            <Image src={s.image} alt="" fill sizes="44px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{s.name}</p>
                            <p className="text-[11px] text-stone">{s.brand}</p>
                          </div>
                          <span className="text-xs">GH₵{(s.price / 100).toFixed(2)}</span>
                        </Link>
                      ))
                    ) : query.length >= 2 ? (
                      <p className="py-4 text-center text-xs text-stone">No matches. Try a different search.</p>
                    ) : (
                      <div className="py-2">
                        <p className="eyebrow mb-2 text-stone">Popular searches</p>
                        <div className="flex flex-wrap gap-2">
                          {["Linen shirt", "Midi dress", "Sneakers", "Leather bag"].map((term) => (
                            <button
                              key={term}
                              onClick={() => setQuery(term)}
                              className="rounded-full bg-cream px-3 py-1.5 text-xs hover:bg-cream/70"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {query.length >= 2 && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => setSearchOpen(false)}
                      className="mt-3 flex items-center justify-center gap-2 border-t border-line/10 pt-3 text-xs font-medium hover:text-accent"
                    >
                      View all results <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
            <ThemeToggle compact />
            <Link href="/account" aria-label="Account" className="p-2 hover:text-accent">
              <UserRound className="h-[19px] w-[19px]" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="p-2 hover:text-accent">
              <Heart className="h-[19px] w-[19px]" />
            </Link>
            <Link href="/cart" aria-label="Shopping bag" className="relative p-2 hover:text-accent">
              <ShoppingBag className="h-[19px] w-[19px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mega menu */}
      {activeMega && (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-line/10 bg-surface shadow-lift xl:block"
          onMouseEnter={() => setActiveMega(activeMega)}
          onMouseLeave={() => setActiveMega(null)}
        >
          <div className="mx-auto grid max-w-[1200px] grid-cols-4 gap-10 px-10 py-10">
            <div>
              <p className="eyebrow mb-4 text-stone">Shop by category</p>
              <ul className="space-y-2.5">
                {megaLinks(activeMega).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/${cat.gender === "women" ? "women" : cat.gender === "men" ? "men" : "c"}/${cat.slug}`}
                      className="text-sm text-fg hover:text-accent"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4 text-stone">Collections</p>
              <ul className="space-y-2.5">
                {["New Arrivals", "Best Sellers", "Everyday Essentials", "Workwear", "Partywear", "The Sale"].map((label) => (
                  <li key={label}>
                    <Link href="/new-arrivals" className="text-sm text-fg hover:text-accent">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {[
                { title: "The New Edit", href: "/new-arrivals", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80" },
                { title: "Weekend Uniform", href: "/women/clothing", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80" },
              ].map((card) => (
                <Link key={card.title} href={card.href} className="group relative aspect-[4/3] overflow-hidden bg-cream">
                  <Image src={card.image} alt="" fill sizes="300px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 text-sm font-medium text-white">{card.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-[86vw] max-w-sm overflow-y-auto bg-paper p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-xl tracking-[0.18em]">AURELIA</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center justify-between border-b border-line/10 py-3.5 font-display text-xl">
                  {item.label}<ArrowRight className="h-4 w-4 text-stone" />
                </Link>
              ))}
              <Link href="/account" className="flex items-center justify-between border-b border-line/10 py-3.5 font-display text-xl">
                My Account<ArrowRight className="h-4 w-4 text-stone" />
              </Link>
            </nav>
            <div className="mt-8">
              <p className="eyebrow mb-3 text-stone">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.gender === "women" ? "women" : cat.gender === "men" ? "men" : "c"}/${cat.slug}`}
                    className="rounded-full border border-line/15 px-3 py-1.5 text-xs"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
