import { parseJSON } from "@/lib/utils";
import type {
  Address,
  Brand,
  Category,
  Colour,
  Coupon,
  Order,
  Product,
  ProductVariant,
  Review,
  StoreSettings,
} from "@/lib/types";

type Doc = Record<string, unknown> & {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
};

export function docToProduct(doc: Doc): Product {
  return {
    id: doc.$id,
    name: String(doc.name ?? ""),
    slug: String(doc.slug ?? ""),
    description: String(doc.description ?? ""),
    brandId: String(doc.brandId ?? ""),
    categoryId: String(doc.categoryId ?? ""),
    price: Number(doc.price ?? 0),
    comparePrice: doc.comparePrice ? Number(doc.comparePrice) : null,
    images: parseJSON<string[]>(doc.images, []),
    colours: parseJSON<Colour[]>(doc.colours, []),
    sizes: parseJSON<string[]>(doc.sizes, []),
    material: String(doc.material ?? ""),
    care: String(doc.care ?? ""),
    status: (doc.status as Product["status"]) ?? "draft",
    featured: Boolean(doc.featured),
    newArrival: Boolean(doc.newArrival),
    trending: Boolean(doc.trending),
    rating: Number(doc.rating ?? 0),
    reviewCount: Number(doc.reviewCount ?? 0),
    gender: (doc.gender as Product["gender"]) ?? "unisex",
    style: String(doc.style ?? ""),
    createdAt: doc.$createdAt || String(doc.createdAt ?? ""),
    updatedAt: doc.$updatedAt || String(doc.updatedAt ?? ""),
    variants: parseJSON<ProductVariant[]>(doc.variants, []),
  };
}

export function productToDoc(product: Partial<Product>) {
  const doc: Record<string, unknown> = {};
  const fields = [
    "name", "slug", "description", "brandId", "categoryId", "price", "comparePrice",
    "material", "care", "status", "featured", "newArrival", "trending", "rating",
    "reviewCount", "gender", "style",
  ] as const;
  for (const key of fields) {
    if (product[key] !== undefined) doc[key] = product[key];
  }
  for (const key of ["images", "colours", "sizes", "variants"] as const) {
    if (product[key] !== undefined) doc[key] = JSON.stringify(product[key]);
  }
  if (product.name !== undefined || product.description !== undefined) {
    doc.searchTerms = `${product.name ?? ""} ${product.description ?? ""} ${product.style ?? ""}`.toLowerCase();
  }
  return doc;
}

export function docToCategory(doc: Doc): Category {
  return {
    id: doc.$id,
    name: String(doc.name ?? ""),
    slug: String(doc.slug ?? ""),
    description: String(doc.description ?? ""),
    image: String(doc.image ?? ""),
    parentId: doc.parentId ? String(doc.parentId) : null,
    order: Number(doc.order ?? 0),
    active: Boolean(doc.active),
    gender: (doc.gender as Category["gender"]) ?? "unisex",
    createdAt: doc.$createdAt || String(doc.createdAt ?? ""),
  };
}

export function docToBrand(doc: Doc): Brand {
  return {
    id: doc.$id,
    name: String(doc.name ?? ""),
    slug: String(doc.slug ?? ""),
    description: String(doc.description ?? ""),
    logo: String(doc.logo ?? ""),
    active: Boolean(doc.active),
    createdAt: doc.$createdAt || String(doc.createdAt ?? ""),
  };
}

export function docToReview(doc: Doc): Review {
  return {
    id: doc.$id,
    productId: String(doc.productId ?? ""),
    userId: String(doc.userId ?? ""),
    userName: String(doc.userName ?? ""),
    orderId: String(doc.orderId ?? ""),
    rating: Number(doc.rating ?? 0),
    title: String(doc.title ?? ""),
    body: String(doc.body ?? ""),
    images: parseJSON<string[]>(doc.images, []),
    status: (doc.status as Review["status"]) ?? "pending",
    verifiedPurchase: Boolean(doc.verifiedPurchase),
    createdAt: doc.$createdAt || String(doc.createdAt ?? ""),
  };
}

export function docToOrder(doc: Doc): Order {
  return {
    id: doc.$id,
    orderNumber: String(doc.orderNumber ?? ""),
    userId: doc.userId ? String(doc.userId) : null,
    guestEmail: String(doc.guestEmail ?? ""),
    customerName: String(doc.customerName ?? ""),
    phone: String(doc.phone ?? ""),
    items: parseJSON<Order["items"]>(doc.items, []),
    subtotal: Number(doc.subtotal ?? 0),
    discount: Number(doc.discount ?? 0),
    shipping: Number(doc.shipping ?? 0),
    total: Number(doc.total ?? 0),
    couponCode: doc.couponCode ? String(doc.couponCode) : null,
    address: parseJSON<Address | null>(doc.address, null),
    deliveryMethod: (doc.deliveryMethod as Order["deliveryMethod"]) ?? "standard",
    status: (doc.status as Order["status"]) ?? "pending_payment",
    paymentStatus: (doc.paymentStatus as Order["paymentStatus"]) ?? "pending",
    paymentReference: doc.paymentReference ? String(doc.paymentReference) : null,
    paymentProvider: doc.paymentProvider ? String(doc.paymentProvider) : null,
    timeline: parseJSON<Order["timeline"]>(doc.timeline, []),
    createdAt: doc.$createdAt || String(doc.createdAt ?? ""),
    updatedAt: doc.$updatedAt || String(doc.updatedAt ?? ""),
  };
}

export function orderToDoc(order: Partial<Order>) {
  const doc: Record<string, unknown> = {};
  const scalar = [
    "orderNumber", "userId", "guestEmail", "customerName", "phone", "subtotal",
    "discount", "shipping", "total", "couponCode", "deliveryMethod", "status",
    "paymentStatus", "paymentReference", "paymentProvider",
  ] as const;
  for (const key of scalar) if (order[key] !== undefined) doc[key] = order[key];
  for (const key of ["items", "address", "timeline"] as const) {
    if (order[key] !== undefined) doc[key] = JSON.stringify(order[key]);
  }
  return doc;
}

export function docToCoupon(doc: Doc): Coupon {
  return {
    id: doc.$id,
    code: String(doc.code ?? "").toUpperCase(),
    type: (doc.type as Coupon["type"]) ?? "percentage",
    value: Number(doc.value ?? 0),
    minOrder: Number(doc.minOrder ?? 0),
    usageLimit: Number(doc.usageLimit ?? 0),
    usedCount: Number(doc.usedCount ?? 0),
    startAt: String(doc.startAt ?? ""),
    endAt: String(doc.endAt ?? ""),
    active: Boolean(doc.active),
    firstOrderOnly: Boolean(doc.firstOrderOnly),
    productIds: parseJSON<string[]>(doc.productIds, []),
    categoryIds: parseJSON<string[]>(doc.categoryIds, []),
  };
}

export function docToSettings(doc: Doc): Partial<StoreSettings> {
  return parseJSON<Partial<StoreSettings>>(doc.value, {});
}
