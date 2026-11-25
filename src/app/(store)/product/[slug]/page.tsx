import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { getProductBySlug, getRelatedProducts, getReviewsForProduct } from "@/lib/data/catalogue";
import { hasPurchasedProduct } from "@/lib/data/reviews";
import { getWishlistIds } from "@/lib/data/wishlist";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/lib/config";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description.slice(0, 160),
      images: product.images.slice(0, 1),
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const user = await getCurrentUser();
  const [reviews, related, wishlist, purchased] = await Promise.all([
    getReviewsForProduct(product.id),
    getRelatedProducts(product),
    getWishlistIds(user?.id ?? null),
    user ? hasPurchasedProduct(user.id, product.id) : Promise.resolve(false),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: product.brand?.name || siteConfig.name },
    aggregateRating: product.reviewCount
      ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: siteConfig.currency,
      price: (product.price / 100).toFixed(2),
      availability: product.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/product/${product.slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      ...(product.category
        ? [{ "@type": "ListItem", position: 2, name: product.category.name, item: `${siteConfig.url}/c/${product.category.slug}` }]
        : []),
      { "@type": "ListItem", position: product.category ? 3 : 2, name: product.name, item: `${siteConfig.url}/product/${product.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ProductDetail
        product={product}
        reviews={reviews}
        wishlisted={wishlist.includes(product.id)}
        canReview={Boolean(user && purchased && !reviews.some((r) => r.userId === user.id))}
        related={related}
      />
    </>
  );
}
