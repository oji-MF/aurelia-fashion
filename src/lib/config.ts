const env = process.env;

export const appwriteConfig = {
  endpoint: env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "aurelia",
  apiKey: env.APPWRITE_API_KEY || "",
  collections: {
    products: env.APPWRITE_COLLECTION_PRODUCTS || "products",
    variants: env.APPWRITE_COLLECTION_VARIANTS || "product_variants",
    categories: env.APPWRITE_COLLECTION_CATEGORIES || "categories",
    brands: env.APPWRITE_COLLECTION_BRANDS || "brands",
    reviews: env.APPWRITE_COLLECTION_REVIEWS || "reviews",
    orders: env.APPWRITE_COLLECTION_ORDERS || "orders",
    addresses: env.APPWRITE_COLLECTION_ADDRESSES || "addresses",
    wishlists: env.APPWRITE_COLLECTION_WISHLISTS || "wishlists",
    coupons: env.APPWRITE_COLLECTION_COUPONS || "coupons",
    redemptions: env.APPWRITE_COLLECTION_REDEMPTIONS || "coupon_redemptions",
    newsletter: env.APPWRITE_COLLECTION_NEWSLETTER || "newsletter_subscribers",
    settings: env.APPWRITE_COLLECTION_SETTINGS || "store_settings",
    content: env.APPWRITE_COLLECTION_CONTENT || "homepage_content",
    audit: env.APPWRITE_COLLECTION_AUDIT || "audit_logs",
    inventory: env.APPWRITE_COLLECTION_INVENTORY || "inventory_movements",
    webhooks: env.APPWRITE_COLLECTION_WEBHOOKS || "payment_webhook_events",
  },
};

/** True only when a real Appwrite project + server key are configured. */
export const isAppwriteConfigured = Boolean(
  appwriteConfig.projectId && appwriteConfig.apiKey,
);

export const siteConfig = {
  name: env.NEXT_PUBLIC_STORE_NAME || "AURELIA",
  url: env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  currency: env.NEXT_PUBLIC_CURRENCY || "GHS",
  currencySymbol: env.NEXT_PUBLIC_CURRENCY_SYMBOL || "GH₵",
  description:
    "AURELIA — modern fashion for women and men. Discover elevated everyday pieces, considered collections and effortless style.",
};

export const paystackConfig = {
  secretKey: env.PAYSTACK_SECRET_KEY || "",
  publicKey: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  isConfigured: Boolean(env.PAYSTACK_SECRET_KEY),
};

export const isEmailConfigured = Boolean(env.RESEND_API_KEY);

export const DEMO_ACCOUNTS = {
  admin: { email: "admin@aurelia.demo", password: "Aurelia!2026" },
  customer: { email: "customer@aurelia.demo", password: "Aurelia!2026" },
};
