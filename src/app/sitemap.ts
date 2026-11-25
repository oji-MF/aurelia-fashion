import type { MetadataRoute } from "next";
import { getCategories, getProductSlugs, getBrandSlugs } from "@/lib/data/catalogue";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const [categories, products, brands] = await Promise.all([
    getCategories(true),
    getProductSlugs(),
    getBrandSlugs(),
  ]);
  const staticPaths = [
    "", "/women", "/men", "/new-arrivals", "/sale", "/shoes", "/bags",
    "/accessories", "/sportswear", "/beauty", "/about", "/contact", "/faq",
    "/delivery", "/returns", "/privacy", "/terms", "/search",
  ];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.6 })),
    ...products.map((slug) => ({ url: `${base}/product/${slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...categories.map((category) => ({ url: `${base}/c/${category.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...brands.map((slug) => ({ url: `${base}/brands/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
