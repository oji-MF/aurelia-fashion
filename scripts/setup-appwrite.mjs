/**
 * Creates the AURELIA Appwrite database, collections, attributes and indexes.
 * Requires NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY in .env.local.
 * Safe to re-run: existing collections/attributes are skipped.
 */
import { Client, Databases, Users, ID, Permission, Role } from "node-appwrite";
import { loadEnv } from "./env.mjs";

loadEnv();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "aurelia";

if (!projectId || !apiKey) {
  console.error("Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_KEY. Copy .env.example to .env.local first.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const users = new Users(client);

const C = {
  products: process.env.APPWRITE_COLLECTION_PRODUCTS || "products",
  variants: process.env.APPWRITE_COLLECTION_VARIANTS || "product_variants",
  categories: process.env.APPWRITE_COLLECTION_CATEGORIES || "categories",
  brands: process.env.APPWRITE_COLLECTION_BRANDS || "brands",
  reviews: process.env.APPWRITE_COLLECTION_REVIEWS || "reviews",
  orders: process.env.APPWRITE_COLLECTION_ORDERS || "orders",
  addresses: process.env.APPWRITE_COLLECTION_ADDRESSES || "addresses",
  wishlists: process.env.APPWRITE_COLLECTION_WISHLISTS || "wishlists",
  coupons: process.env.APPWRITE_COLLECTION_COUPONS || "coupons",
  redemptions: process.env.APPWRITE_COLLECTION_REDEMPTIONS || "coupon_redemptions",
  newsletter: process.env.APPWRITE_COLLECTION_NEWSLETTER || "newsletter_subscribers",
  settings: process.env.APPWRITE_COLLECTION_SETTINGS || "store_settings",
  content: process.env.APPWRITE_COLLECTION_CONTENT || "homepage_content",
  audit: process.env.APPWRITE_COLLECTION_AUDIT || "audit_logs",
  inventory: process.env.APPWRITE_COLLECTION_INVENTORY || "inventory_movements",
  webhooks: process.env.APPWRITE_COLLECTION_WEBHOOKS || "payment_webhook_events",
};

const S = (size = 256) => ({ type: "string", size, required: false, array: false });
const STR = (size = 256) => ({ type: "string", size, required: false });
const INT = { type: "integer", required: false };
const NUM = { type: "double", required: false };
const BOOL = { type: "boolean", required: false };
const DT = { type: "datetime", required: false };
const ENUM = (elements) => ({ type: "enum", elements, required: false });

const definitions = [
  { id: C.products, name: "Products", public: true, attributes: {
    name: STR(200), slug: STR(200), description: STR(65535), brandId: STR(64), categoryId: STR(64),
    price: INT, comparePrice: INT, images: S(65535), colours: S(65535), sizes: S(65535), variants: S(65535),
    material: STR(200), care: STR(65535), status: ENUM(["draft", "published", "archived"]),
    featured: BOOL, newArrival: BOOL, trending: BOOL, rating: NUM, reviewCount: INT,
    gender: ENUM(["women", "men", "unisex"]), style: STR(100), searchTerms: S(65535),
  }, indexes: [
    ["idx_slug", "key", ["slug"]], ["idx_status", "key", ["status"]],
    ["idx_category", "key", ["categoryId"]], ["idx_brand", "key", ["brandId"]],
    ["idx_price", "key", ["price"]], ["idx_created", "key", ["createdAt"]],
    ["idx_search", "fulltext", ["searchTerms"]],
  } },
  { id: C.variants, name: "Product Variants", public: true, attributes: {
    productId: STR(64), colour: STR(100), hex: STR(20), size: STR(30), sku: STR(100),
    price: INT, stock: INT, lowStockThreshold: INT,
  }, indexes: [["idx_product", "key", ["productId"]], ["idx_sku", "unique", ["sku"]]] },
  { id: C.categories, name: "Categories", public: true, attributes: {
    name: STR(100), slug: STR(100), description: STR(65535), image: STR(65535), parentId: STR(64),
    order: INT, active: BOOL, gender: ENUM(["women", "men", "unisex"]),
  }, indexes: [["idx_cat_slug", "unique", ["slug"]], ["idx_parent", "key", ["parentId"]]] },
  { id: C.brands, name: "Brands", public: true, attributes: {
    name: STR(100), slug: STR(100), description: STR(65535), logo: STR(65535), active: BOOL,
  }, indexes: [["idx_brand_slug", "unique", ["slug"]]] },
  { id: C.reviews, name: "Reviews", public: true, attributes: {
    productId: STR(64), userId: STR(64), userName: STR(100), orderId: STR(64), rating: INT,
    title: STR(200), body: STR(65535), images: S(65535), status: ENUM(["pending", "approved", "rejected"]),
    verifiedPurchase: BOOL,
  }, indexes: [["idx_rev_product", "key", ["productId"]], ["idx_rev_status", "key", ["status"]]] },
  { id: C.orders, name: "Orders", public: false, attributes: {
    orderNumber: STR(100), userId: STR(64), guestEmail: STR(200), customerName: STR(200), phone: STR(50),
    items: S(65535), subtotal: INT, discount: INT, shipping: INT, total: INT, couponCode: STR(50),
    address: S(65535), deliveryMethod: ENUM(["standard", "express"]),
    status: ENUM(["pending_payment", "payment_confirmed", "processing", "packed", "dispatched", "in_transit", "delivered", "cancelled", "refunded"]),
    paymentStatus: ENUM(["pending", "paid", "failed", "refunded"]), paymentReference: STR(150),
    paymentProvider: STR(50), timeline: S(65535),
  }, indexes: [["idx_order_number", "unique", ["orderNumber"]], ["idx_order_user", "key", ["userId"]], ["idx_order_ref", "key", ["paymentReference"]], ["idx_order_date", "key", ["createdAt"]]] },
  { id: C.addresses, name: "Addresses", public: false, attributes: {
    userId: STR(64), label: STR(100), fullName: STR(200), phone: STR(50), country: STR(100),
    region: STR(100), city: STR(100), street: STR(300), postalCode: STR(30), isDefault: BOOL,
  }, indexes: [["idx_addr_user", "key", ["userId"]]] },
  { id: C.wishlists, name: "Wishlists", public: false, attributes: {
    userId: STR(64), productIds: S(65535),
  }, indexes: [["idx_wish_user", "key", ["userId"]]] },
  { id: C.coupons, name: "Coupons", public: false, attributes: {
    code: STR(50), type: ENUM(["percentage", "fixed", "free_shipping"]), value: INT, minOrder: INT,
    usageLimit: INT, usedCount: INT, startAt: DT, endAt: DT, active: BOOL, firstOrderOnly: BOOL,
    productIds: S(65535), categoryIds: S(65535),
  }, indexes: [["idx_coupon_code", "unique", ["code"]]] },
  { id: C.redemptions, name: "Coupon Redemptions", public: false, attributes: {
    code: STR(50), userId: STR(64), orderId: STR(64),
  }, indexes: [["idx_red_code", "key", ["code"]]] },
  { id: C.newsletter, name: "Newsletter Subscribers", public: false, attributes: {
    email: { type: "email", required: true },
  }, indexes: [["idx_news_email", "unique", ["email"]]] },
  { id: C.settings, name: "Store Settings", public: true, attributes: { key: STR(50), value: S(65535) } },
  { id: C.content, name: "Homepage Content", public: true, attributes: { key: STR(50), value: S(65535) } },
  { id: C.audit, name: "Audit Logs", public: false, attributes: {
    actorId: STR(64), actorEmail: STR(200), action: STR(100), entity: STR(100), entityId: STR(100), details: S(65535),
  }, indexes: [["idx_audit_date", "key", ["createdAt"]]] },
  { id: C.inventory, name: "Inventory Movements", public: false, attributes: {
    variantId: STR(64), productId: STR(64), productName: STR(200), change: INT, reason: STR(200), actorId: STR(64),
  }, indexes: [["idx_inv_variant", "key", ["variantId"]]] },
  { id: C.webhooks, name: "Payment Webhook Events", public: false, attributes: {
    reference: STR(150), event: STR(100), at: DT, raw: S(65535),
  }, indexes: [["idx_webhook_ref", "unique", ["reference"]]] },
];

async function ensureDatabase() {
  try {
    await databases.get(databaseId);
    console.log(`✓ Database ${databaseId} exists`);
  } catch {
    await databases.create(databaseId, "AURELIA Store");
    console.log(`✓ Created database ${databaseId}`);
  }
}

async function ensureCollection(def) {
  let exists = true;
  try {
    await databases.getCollection(databaseId, def.id);
    console.log(`  • Collection ${def.id} exists`);
  } catch {
    exists = false;
    const permissions = def.public
      ? [Permission.read(Role.any())]
      : [Permission.read(Role.users()), Permission.create(Role.users())];
    await databases.createCollection(databaseId, def.id, def.name, permissions, true);
    console.log(`  ✓ Created collection ${def.id}`);
  }
  if (!exists) return;

  const existing = new Set((await databases.listAttributes(databaseId, def.id)).attributes.map((a) => a.key));
  for (const [key, attr] of Object.entries(def.attributes)) {
    if (existing.has(key)) continue;
    try {
      if (attr.type === "string") await databases.createStringAttribute(databaseId, def.id, key, attr.size, attr.required, undefined, attr.array || false);
      else if (attr.type === "integer") await databases.createIntegerAttribute(databaseId, def.id, key, attr.required);
      else if (attr.type === "double") await databases.createFloatAttribute(databaseId, def.id, key, attr.required);
      else if (attr.type === "boolean") await databases.createBooleanAttribute(databaseId, def.id, key, attr.required);
      else if (attr.type === "datetime") await databases.createDatetimeAttribute(databaseId, def.id, key, attr.required);
      else if (attr.type === "enum") await databases.createEnumAttribute(databaseId, def.id, key, attr.elements, attr.required);
      else if (attr.type === "email") await databases.createEmailAttribute(databaseId, def.id, key, attr.required);
      console.log(`    + attribute ${key}`);
    } catch (error) {
      console.log(`    ! ${key}: ${error.message}`);
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 1200)); // let attributes become available
  const existingIndexes = new Set((await databases.listIndexes(databaseId, def.id)).indexes.map((i) => i.key));
  for (const [key, type, fields] of def.indexes || []) {
    if (existingIndexes.has(key)) continue;
    try {
      await databases.createIndex(databaseId, def.id, key, type, fields);
      console.log(`    + index ${key}`);
    } catch (error) {
      console.log(`    ! index ${key}: ${error.message}`);
    }
  }
}

async function createAdminUser() {
  const email = "admin@aurelia.demo";
  const password = "Aurelia!2026";
  try {
    await users.create(ID.unique(), email, undefined, undefined, "Store Administrator", password);
    console.log("✓ Created demo administrator");
  } catch (error) {
    if (error.code === 409) console.log("  • Demo administrator already exists");
    else console.log(`  ! Admin user: ${error.message}`);
  }
}

(async () => {
  console.log(`Appwrite setup — ${endpoint} / project ${projectId}`);
  await ensureDatabase();
  for (const def of definitions) await ensureCollection(def);
  await createAdminUser();
  console.log("\nSetup complete. Next: npm run appwrite:seed");
})().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
