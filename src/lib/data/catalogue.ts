import { Query } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getStore } from "@/lib/demo/store";
import { docToBrand, docToCategory, docToProduct, docToReview } from "./serialize";
import type {
  Brand,
  Category,
  Paginated,
  Product,
  ProductFilters,
  Review,
  SortOption,
} from "@/lib/types";

async function fetchAllProducts(includeDrafts = false): Promise<Product[]> {
  if (!isAppwriteConfigured) {
    const products = getStore().products;
    return includeDrafts ? products : products.filter((p) => p.status === "published");
  }
  const { databases } = createAdminClient();
  const queries = [Query.limit(500)];
  if (!includeDrafts) queries.push(Query.equal("status", "published"));
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.products,
    queries,
  );
  return result.documents.map((d) => docToProduct(d as never));
}

export async function getAllProductsForAdmin(): Promise<Product[]> {
  return fetchAllProducts(true);
}

export async function getCategories(includeInactive = false): Promise<Category[]> {
  if (!isAppwriteConfigured) {
    const items = getStore().categories;
    return includeInactive ? items : items.filter((c) => c.active);
  }
  const { databases } = createAdminClient();
  const queries = [Query.limit(200), Query.orderAsc("order")];
  if (!includeInactive) queries.push(Query.equal("active", true));
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.categories,
    queries,
  );
  return result.documents.map((d) => docToCategory(d as never));
}

export async function getBrands(includeInactive = false): Promise<Brand[]> {
  if (!isAppwriteConfigured) {
    const items = getStore().brands;
    return includeInactive ? items : items.filter((b) => b.active);
  }
  const { databases } = createAdminClient();
  const queries = [Query.limit(200)];
  if (!includeInactive) queries.push(Query.equal("active", true));
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.brands,
    queries,
  );
  return result.documents.map((d) => docToBrand(d as never));
}

function withLookups(
  products: Product[],
  categories: Category[],
  brands: Brand[],
): Product[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  return products.map((p) => ({
    ...p,
    category: categoryMap.get(p.categoryId),
    brand: brandMap.get(p.brandId),
  }));
}

export function sortProducts(items: Product[], sort: SortOption = "recommended") {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "popular":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "discount":
      return sorted.sort(
        (a, b) =>
          (b.comparePrice ? (b.comparePrice - b.price) / b.comparePrice : 0) -
          (a.comparePrice ? (a.comparePrice - a.price) / a.comparePrice : 0),
      );
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.featured) * 3 +
          Number(b.trending) * 2 +
          Number(b.newArrival) -
          (Number(a.featured) * 3 + Number(a.trending) * 2 + Number(a.newArrival)),
      );
  }
}

export async function listProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  const [products, categories, brands] = await Promise.all([
    fetchAllProducts(false),
    getCategories(),
    getBrands(),
  ]);
  let items = withLookups(products, categories, brands);

  const categorySlug = filters.category;
  if (categorySlug && categorySlug !== "all") {
    const category = categories.find((c) => c.slug === categorySlug);
    if (category) {
      const childIds = new Set(
        categories.filter((c) => c.parentId === category.id).map((c) => c.id),
      );
      items = items.filter(
        (p) => p.categoryId === category.id || childIds.has(p.categoryId),
      );
    }
  }
  if (filters.brand?.length) items = items.filter((p) => filters.brand!.includes(p.brandId));
  if (filters.priceMin !== undefined) items = items.filter((p) => p.price >= filters.priceMin!);
  if (filters.priceMax !== undefined) items = items.filter((p) => p.price <= filters.priceMax!);
  if (filters.size?.length) items = items.filter((p) => p.sizes.some((s) => filters.size!.includes(s)));
  if (filters.colour?.length) {
    items = items.filter((p) =>
      p.colours.some((c) => filters.colour!.some((f) => c.name.toLowerCase() === f.toLowerCase())),
    );
  }
  if (filters.gender) items = items.filter((p) => p.gender === filters.gender || p.gender === "unisex");
  if (filters.availability) items = items.filter((p) => p.variants.some((v) => v.stock > 0));
  if (filters.material?.length) items = items.filter((p) => filters.material!.includes(p.material));
  if (filters.style?.length) items = items.filter((p) => filters.style!.includes(p.style));
  if (filters.discount) items = items.filter((p) => p.comparePrice !== null);
  if (filters.rating) items = items.filter((p) => p.rating >= filters.rating!);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter((p) =>
      [p.name, p.description, p.variants.map((v) => v.sku).join(" "), p.brand?.name ?? "", p.category?.name ?? "", p.style]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }

  items = sortProducts(items, filters.sort);
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 12);
  const total = items.length;
  return {
    items: items.slice((page - 1) * limit, page * limit),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [products, categories, brands] = await Promise.all([
    fetchAllProducts(false),
    getCategories(),
    getBrands(),
  ]);
  const product = products.find((p) => p.slug === slug);
  return product ? withLookups([product], categories, brands)[0] : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const [products, categories, brands] = await Promise.all([
    fetchAllProducts(true),
    getCategories(true),
    getBrands(true),
  ]);
  const product = products.find((p) => p.id === id);
  return product ? withLookups([product], categories, brands)[0] : null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return (await getBrands()).find((b) => b.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return (await listProducts({ sort: "recommended", limit })).items.filter((p) => p.featured).slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const result = await listProducts({ sort: "newest", limit: 60 });
  return result.items.filter((p) => p.newArrival).slice(0, limit);
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  const result = await listProducts({ sort: "popular", limit: 60 });
  return result.items.filter((p) => p.trending).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const result = await listProducts({ category: product.category?.slug, limit: 40 });
  return result.items.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  if (!isAppwriteConfigured) {
    return getStore()
      .reviews.filter((r) => r.productId === productId && r.status === "approved")
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.reviews,
    [Query.equal("productId", productId), Query.equal("status", "approved"), Query.limit(50)],
  );
  return result.documents.map((d) => docToReview(d as never));
}

export async function searchSuggestions(q: string, limit = 6): Promise<Product[]> {
  if (q.trim().length < 2) return [];
  return (await listProducts({ q, limit })).items.slice(0, limit);
}

export async function getProductSlugs(): Promise<string[]> {
  return (await fetchAllProducts(false)).map((p) => p.slug);
}

export async function getBrandSlugs(): Promise<string[]> {
  return (await getBrands(true)).map((b) => b.slug);
}

export async function getPopularSearches(): Promise<string[]> {
  return ["Linen shirt", "Midi dress", "Sneakers", "Leather bag", "Wide leg trousers", "Knitwear"];
}
