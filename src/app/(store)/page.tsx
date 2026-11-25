import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button, SectionHeading } from "@/components/ui/primitives";
import { ProductGrid } from "@/components/products/product-grid";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import {
  getBrands,
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getTrendingProducts,
} from "@/lib/data/catalogue";
import { getHomepageContent, getStoreSettings } from "@/lib/data/admin";
import { getWishlistIds } from "@/lib/data/wishlist";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [settings, content, categories, brands, featured, newArrivals, trending, wishlist] =
    await Promise.all([
      getStoreSettings(),
      getHomepageContent(),
      getCategories(),
      getBrands(),
      getFeaturedProducts(8),
      getNewArrivals(8),
      getTrendingProducts(4),
      getWishlistIds(user?.id ?? null),
    ]);

  const editorial = (content.editorial || {}) as Record<string, string>;
  const campaigns = (content.campaigns || []) as Record<string, string>[];
  const topCategories = categories.filter((c) => !c.parentId).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[520px] w-full overflow-hidden bg-charcoal md:min-h-[680px]">
        <Image
          src={settings.heroImage}
          alt="AURELIA seasonal campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1600px] flex-col justify-end px-4 pb-16 sm:px-6 md:min-h-[680px] md:pb-24 lg:px-10">
          <div className="max-w-xl text-white">
            <p className="eyebrow mb-5 text-white/70">New Season · 2026</p>
            <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">{settings.heroHeading}</h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 md:text-base">{settings.heroSubheading}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/women" variant="light" size="lg">{settings.heroCtaWomen || "Shop Women"}</Button>
              <Button href="/men" variant="dark" size="lg">{settings.heroCtaMen || "Shop Men"}</Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-10 hidden items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/60 md:flex">
          <span>Scroll to explore</span><span className="h-px w-12 bg-white/50" />
        </div>
      </section>

      {/* Category cards */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <SectionHeading eyebrow="Discover" title="Shop by category" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {topCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.gender === "women" ? "women" : category.gender === "men" ? "men" : "c"}/${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-cream"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, 17vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="font-display text-lg">{category.name}</p>
                <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                  Shop now <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <SectionHeading
          eyebrow="Just landed"
          title="New arrivals"
          action={<Link href="/new-arrivals" className="group flex items-center gap-2 text-xs font-medium uppercase tracking-wider hover:text-accent">View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>}
        />
        <ProductGrid products={newArrivals} wishlist={wishlist} />
      </section>

      {/* Campaign strip */}
      <section className="relative overflow-hidden bg-charcoal">
        <div className="relative h-[420px] md:h-[520px]">
          <Image src={settings.heroImageMobile} alt="AURELIA campaign" fill sizes="100vw" className="object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
          <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-center px-4 text-white sm:px-6 lg:px-10">
            <p className="eyebrow mb-4 text-white/60">The AURELIA Edit</p>
            <h2 className="max-w-xl font-display text-4xl leading-tight md:text-6xl">Dressing well is a daily practice.</h2>
            <p className="mt-5 max-w-md text-sm text-white/75">Explore the pieces our stylists are wearing right now — considered, versatile and made to last beyond the season.</p>
            <div className="mt-8"><Button href="/new-arrivals" variant="light">Discover the edit</Button></div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <SectionHeading
          eyebrow="Most loved"
          title="Trending now"
          action={<Link href="/search" className="group flex items-center gap-2 text-xs font-medium uppercase tracking-wider hover:text-accent">Explore all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>}
        />
        <ProductGrid products={trending} wishlist={wishlist} columns={4} />
      </section>

      {/* Seasonal campaigns */}
      <section className="bg-cream/50 py-16 lg:py-24">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <SectionHeading eyebrow="The collections" title="Something for every moment" />
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((campaign) => (
              <Link key={campaign.title} href={campaign.href || "/new-arrivals"} className="group relative aspect-[16/9] overflow-hidden bg-charcoal">
                <Image src={campaign.image} alt={campaign.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white md:p-8">
                  <div>
                    <p className="eyebrow mb-2 text-white/60">Collection</p>
                    <h3 className="font-display text-2xl md:text-3xl">{campaign.title}</h3>
                    <p className="mt-1 text-xs text-white/70">{campaign.subtitle}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors group-hover:bg-white group-hover:text-ink"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial */}
      {editorial.title && (
        <section className="mx-auto grid max-w-[1600px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div className="relative aspect-[4/5] overflow-hidden bg-cream">
            <Image src={editorial.image} alt={editorial.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="lg:pl-12">
            <p className="eyebrow mb-4 text-accent">{editorial.eyebrow}</p>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">{editorial.title}</h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-stone">{editorial.body}</p>
            <div className="mt-8"><Button href={editorial.href || "/new-arrivals"} variant="outline">{editorial.cta || "Read more"}</Button></div>
          </div>
        </section>
      )}

      {/* Featured -->
      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <SectionHeading eyebrow="Editors' picks" title="Worth the investment" />
        <ProductGrid products={featured.filter((p) => !newArrivals.some((n) => n.id === p.id)).slice(0, 4)} wishlist={wishlist} />
      </section>

      {/* Brands */}
      <section className="border-y border-ink/10 bg-white/50 py-14">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <p className="eyebrow mb-8 text-center text-stone">Labels we love</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="font-display text-xl tracking-[0.14em] text-charcoal/70 transition-colors hover:text-accent md:text-2xl">
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-[1600px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow mb-4 text-accent">The AURELIA letter</p>
          <h2 className="font-display text-3xl md:text-4xl">Good things, straight to your inbox.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-stone">New collections, styling notes and members-only offers. No noise, just the good stuff.</p>
          <div className="mx-auto mt-8 max-w-md"><NewsletterForm /></div>
        </div>
      </section>
    </>
  );
}
