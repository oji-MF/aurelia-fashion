export type Role =
  | "super_admin"
  | "admin"
  | "product_manager"
  | "order_manager"
  | "inventory_manager"
  | "customer_support"
  | "marketing_manager"
  | "customer";

export type ProductStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
  order: number;
  active: boolean;
  gender: "women" | "men" | "unisex";
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  active: boolean;
  createdAt: string;
}

export interface Colour {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  colour: string;
  hex: string;
  size: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  colours: Colour[];
  sizes: string[];
  material: string;
  care: string;
  status: ProductStatus;
  featured: boolean;
  newArrival: boolean;
  trending: boolean;
  rating: number;
  reviewCount: number;
  gender: "women" | "men" | "unisex";
  style: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  brand?: Brand;
  category?: Category;
}

export interface ProductWithDetails extends Product {
  brand?: Brand;
  category?: Category;
  reviews: Review[];
  related: Product[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  colour: string;
  size: string;
  price: number;
  quantity: number;
  maxStock: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  productIds: string[];
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  verifiedPurchase: boolean;
  createdAt: string;
}

export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "processing"
  | "packed"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  colour: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  address: Address | null;
  deliveryMethod: "standard" | "express";
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  paymentProvider: string | null;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  startAt: string;
  endAt: string;
  active: boolean;
  firstOrderOnly: boolean;
  productIds: string[];
  categoryIds: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  roles: Role[];
  emailVerified: boolean;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  size?: string[];
  colour?: string[];
  gender?: string;
  availability?: boolean;
  material?: string[];
  style?: string[];
  discount?: boolean;
  rating?: number;
  q?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption =
  | "recommended"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "popular"
  | "rating"
  | "discount";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ShippingRule {
  id: string;
  country: string;
  region: string;
  standardPrice: number;
  expressPrice: number;
  freeShippingThreshold: number;
  estimatedDays: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShipping: number;
  expressShipping: number;
  taxRate: number;
  announcement: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  heroImageMobile: string;
  heroCtaWomen: string;
  heroCtaMen: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  social: { instagram: string; facebook: string; tiktok: string; x: string };
  paymentMethods: string[];
  returnPolicy: string;
  privacyPolicy: string;
  terms: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  productId: string;
  productName: string;
  reason: string;
  details: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  change: number;
  reason: string;
  actorId: string;
  createdAt: string;
}
