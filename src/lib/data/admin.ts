import { ID } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getStore, mutateStore } from "@/lib/demo/store";
import { productToDoc } from "./serialize";
import { getAllOrders } from "./orders";
import { slugify } from "@/lib/utils";
import type {
  AuditLog,
  Brand,
  Category,
  Coupon,
  InventoryMovement,
  Order,
  Product,
  Role,
  StoreSettings,
  User,
} from "@/lib/types";

export async function audit(input: {
  actorId: string;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}) {
  const entry: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    details: "",
    ...input,
  };
  if (!isAppwriteConfigured) {
    mutateStore((store) => store.audit.unshift(entry));
    return;
  }
  try {
    const { databases } = createAdminClient();
    await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.audit, ID.unique(), entry);
  } catch {
    // Audit failure must not block the operation.
  }
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  if (!isAppwriteConfigured) return getStore().audit.slice(0, limit);
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.audit, []);
  return result.documents.map((d) => {
    const doc = d as unknown as Record<string, unknown>;
    return {
      id: d.$id,
      actorId: String(doc.actorId ?? ""),
      actorEmail: String(doc.actorEmail ?? ""),
      action: String(doc.action ?? ""),
      entity: String(doc.entity ?? ""),
      entityId: String(doc.entityId ?? ""),
      details: String(doc.details ?? ""),
      createdAt: d.$createdAt,
    };
  });
}

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isAppwriteConfigured) return getStore().settings;
  const { databases } = createAdminClient();
  try {
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.settings, []);
    const doc = result.documents[0] as unknown as Record<string, unknown> | undefined;
    if (doc?.value && typeof doc.value === "string") return JSON.parse(doc.value);
  } catch {
    // fall through
  }
  return getStore().settings;
}

export async function updateStoreSettings(settings: StoreSettings, actor: { id: string; email: string }) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      store.settings = settings;
    });
  } else {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.settings, []);
    const value = JSON.stringify(settings);
    if (result.documents.length) {
      await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collections.settings, result.documents[0].$id, { value });
    } else {
      await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.settings, ID.unique(), { key: "main", value });
    }
  }
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"update", entity: "settings", entityId: "main" });
  return settings;
}

export async function getHomepageContent(): Promise<Record<string, unknown>> {
  if (!isAppwriteConfigured) return getStore().content;
  const { databases } = createAdminClient();
  try {
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.content, []);
    const doc = result.documents[0] as unknown as Record<string, unknown> | undefined;
    if (doc?.value && typeof doc.value === "string") return JSON.parse(doc.value);
  } catch {
    // fall through
  }
  return getStore().content;
}

export async function updateHomepageContent(content: Record<string, unknown>, actor: { id: string; email: string }) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      store.content = content;
    });
  } else {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.content, []);
    const value = JSON.stringify(content);
    if (result.documents.length) {
      await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collections.content, result.documents[0].$id, { value });
    } else {
      await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.content, ID.unique(), { key: "home", value });
    }
  }
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"update", entity: "homepage", entityId: "home" });
}

export async function saveProduct(product: Product, actor: { id: string; email: string }) {
  const value = {
    ...product,
    slug: product.slug || slugify(product.name),
    updatedAt: new Date().toISOString(),
  };
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      const index = store.products.findIndex((p) => p.id === product.id);
      if (index >= 0) store.products[index] = value;
      else store.products.unshift(value);
    });
  } else {
    const { databases } = createAdminClient();
    const doc = productToDoc(value);
    const isNew = !product.id || product.id.startsWith("p_") === false;
    if (isNew) {
      await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.products, ID.unique(), doc);
    } else {
      try {
        await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collections.products, product.id, doc);
      } catch {
        await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.products, product.id.replace(/[^a-zA-Z0-9]/g, "_"), doc);
      }
    }
  }
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"save", entity: "product", entityId: product.id, details: product.name });
  return value;
}

export async function deleteProduct(id: string, actor: { id: string; email: string }) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      store.products = store.products.filter((p) => p.id !== id);
    });
  } else {
    const { databases } = createAdminClient();
    await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.collections.products, id);
  }
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"delete", entity: "product", entityId: id });
}

export async function saveCategory(input: Partial<Category>, actor: { id: string; email: string }) {
  const category: Category = {
    id: input.id || `c_${Date.now()}`,
    name: input.name || "Untitled",
    slug: input.slug || slugify(input.name || "category"),
    description: input.description || "",
    image: input.image || "",
    parentId: input.parentId ?? null,
    order: input.order ?? 0,
    active: input.active ?? true,
    gender: input.gender ?? "unisex",
    createdAt: input.createdAt || new Date().toISOString(),
  };
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      const index = store.categories.findIndex((c) => c.id === category.id);
      if (index >= 0) store.categories[index] = category;
      else store.categories.push(category);
    });
  } else {
    const { databases } = createAdminClient();
    const payload = { ...category, id: undefined };
    try {
      await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collections.categories, category.id, payload as never);
    } catch {
      await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.categories, ID.unique(), payload as never);
    }
  }
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"save", entity: "category", entityId: category.id, details: category.name });
  return category;
}

export async function deleteCategory(id: string, actor: { id: string; email: string }) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      store.categories = store.categories.filter((c) => c.id !== id && c.parentId !== id);
    });
  } else {
    const { databases } = createAdminClient();
    await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.collections.categories, id);
  }
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"delete", entity: "category", entityId: id });
}

export async function getBrandsForAdmin(): Promise<Brand[]> {
  if (!isAppwriteConfigured) return getStore().brands;
  const { getBrands } = await import("./catalogue");
  return getBrands(true);
}

export async function saveBrand(brand: Partial<Brand>, actor: { id: string; email: string }) {
  const value: Brand = {
    id: brand.id || `b_${Date.now()}`,
    name: brand.name || "Untitled",
    slug: brand.slug || slugify(brand.name || "brand"),
    description: brand.description || "",
    logo: brand.logo || "",
    active: brand.active ?? true,
    createdAt: brand.createdAt || new Date().toISOString(),
  };
  mutateStore((store) => {
    const index = store.brands.findIndex((b) => b.id === value.id);
    if (index >= 0) store.brands[index] = value;
    else store.brands.push(value);
  });
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"save", entity: "brand", entityId: value.id, details: value.name });
  return value;
}

export async function getCoupons(): Promise<Coupon[]> {
  if (!isAppwriteConfigured) return getStore().coupons;
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.coupons, []);
  return result.documents.map((d) => {
    const doc = d as unknown as Record<string, unknown>;
    return {
      id: d.$id,
      code: String(doc.code ?? ""),
      type: (doc.type as Coupon["type"]) ?? "percentage",
      value: Number(doc.value ?? 0),
      minOrder: Number(doc.minOrder ?? 0),
      usageLimit: Number(doc.usageLimit ?? 0),
      usedCount: Number(doc.usedCount ?? 0),
      startAt: String(doc.startAt ?? ""),
      endAt: String(doc.endAt ?? ""),
      active: Boolean(doc.active),
      firstOrderOnly: Boolean(doc.firstOrderOnly),
      productIds: typeof doc.productIds === "string" ? JSON.parse(doc.productIds) : [],
      categoryIds: typeof doc.categoryIds === "string" ? JSON.parse(doc.categoryIds) : [],
    };
  });
}

export async function saveCoupon(coupon: Partial<Coupon>, actor: { id: string; email: string }) {
  const value: Coupon = {
    id: coupon.id || `coupon_${Date.now()}`,
    code: (coupon.code || "NEW").toUpperCase(),
    type: coupon.type || "percentage",
    value: coupon.value ?? 0,
    minOrder: coupon.minOrder ?? 0,
    usageLimit: coupon.usageLimit ?? 100,
    usedCount: coupon.usedCount ?? 0,
    startAt: coupon.startAt || new Date().toISOString(),
    endAt: coupon.endAt || new Date(Date.now() + 30 * 86400000).toISOString(),
    active: coupon.active ?? true,
    firstOrderOnly: coupon.firstOrderOnly ?? false,
    productIds: coupon.productIds ?? [],
    categoryIds: coupon.categoryIds ?? [],
  };
  mutateStore((store) => {
    const index = store.coupons.findIndex((c) => c.id === value.id);
    if (index >= 0) store.coupons[index] = value;
    else store.coupons.push(value);
  });
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"save", entity: "coupon", entityId: value.id, details: value.code });
  return value;
}

export async function deleteCoupon(id: string, actor: { id: string; email: string }) {
  mutateStore((store) => {
    store.coupons = store.coupons.filter((c) => c.id !== id);
  });
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"delete", entity: "coupon", entityId: id });
}

export async function adjustInventory(input: {
  variantId: string;
  change: number;
  reason: string;
  actorId: string;
}) {
  let movement: InventoryMovement | null = null;
  mutateStore((store) => {
    for (const product of store.products) {
      const variant = product.variants.find((v) => v.id === input.variantId);
      if (!variant) continue;
      variant.stock = Math.max(0, variant.stock + input.change);
      movement = {
        id: `inv_${Date.now()}`,
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        change: input.change,
        reason: input.reason,
        actorId: input.actorId,
        createdAt: new Date().toISOString(),
      };
      store.inventory.unshift(movement);
      return;
    }
  });
  return movement;
}

export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  return getStore().inventory;
}

export async function getUsers(): Promise<User[]> {
  if (!isAppwriteConfigured) {
    return getStore().users.map(({ passwordHash: _ignored, ...user }) => user);
  }
  const { users } = createAdminClient();
  const result = await users.list();
  return result.users.map((u) => ({
    id: u.$id,
    email: u.email,
    name: u.name,
    phone: String((u.prefs as Record<string, unknown>)?.phone ?? ""),
    roles: ((u.prefs as Record<string, unknown>)?.roles as Role[]) || ["customer"],
    emailVerified: u.emailVerification,
    createdAt: u.$createdAt,
  }));
}

export async function updateUserRoles(userId: string, roles: Role[], actor: { id: string; email: string }) {
  mutateStore((store) => {
    const user = store.users.find((u) => u.id === userId);
    if (user) user.roles = roles;
  });
  if (isAppwriteConfigured) {
    const { users } = createAdminClient();
    const user = await users.get(userId);
    await users.updatePrefs(userId, { ...(user.prefs || {}), roles });
  }
  await audit({ actorId: actor.id, actorEmail: actor.email, action:"roles", entity: "user", entityId: userId, details: roles.join(", ") });
}

export interface DashboardStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStock: number;
  averageOrderValue: number;
  revenueSeries: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
}

export async function getDashboardStats(rangeDays = 30): Promise<DashboardStats> {
  const store = getStore();
  const orders: Order[] = isAppwriteConfigured ? await getAllOrders() : store.orders;
  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const cutoff = Date.now() - rangeDays * 86400000;
  const recentPaid = paid.filter((o) => +new Date(o.createdAt) >= cutoff);

  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    byDay.set(date, { revenue: 0, orders: 0 });
  }
  for (const order of recentPaid) {
    const key = order.createdAt.slice(0, 10);
    const entry = byDay.get(key);
    if (entry) {
      entry.revenue += order.total;
      entry.orders += 1;
    }
  }
  const revenueSeries = Array.from(byDay, ([date, value]) => ({
    date: new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    revenue: value.revenue / 100,
    orders: value.orders,
  }));

  const productMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const order of paid) {
    for (const item of order.items) {
      const entry = productMap.get(item.productId) ?? { name: item.name, units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.lineTotal / 100;
      productMap.set(item.productId, entry);
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 6);

  const allProducts = await (await import("./catalogue")).getAllProductsForAdmin();

  const statusBreakdown = ["pending_payment", "payment_confirmed", "processing", "packed", "dispatched", "in_transit", "delivered", "cancelled", "refunded"].map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));

  return {
    revenue,
    orders: orders.length,
    customers: isAppwriteConfigured ? (await getUsers()).length : store.users.length,
    products: allProducts.length,
    pendingOrders: orders.filter((o) => o.status === "pending_payment").length,
    completedOrders: orders.filter((o) => o.status === "delivered").length,
    cancelledOrders: orders.filter((o) => o.status === "cancelled" || o.status === "refunded").length,
    lowStock: allProducts.reduce(
      (count, p) => count + p.variants.filter((v) => v.stock > 0 && v.stock <= v.lowStockThreshold).length,
      0,
    ),
    averageOrderValue: paid.length ? Math.round(revenue / paid.length) : 0,
    revenueSeries,
    topProducts,
    statusBreakdown,
  };
}
