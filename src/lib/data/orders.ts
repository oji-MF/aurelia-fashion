import { ID, Query } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getStore, mutateStore } from "@/lib/demo/store";
import { generateOrderNumber } from "@/lib/utils";
import { docToOrder, docToCoupon, orderToDoc } from "./serialize";
import { getProductById } from "./catalogue";
import type {
  Address,
  Coupon,
  Order,
  OrderItem,
  OrderStatus,
  StoreSettings,
} from "@/lib/types";

export interface PricingLine extends OrderItem {}

export interface PricingResult {
  lines: PricingLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: Coupon | null;
  couponError?: string;
}

function getSettings(): StoreSettings {
  if (!isAppwriteConfigured) return getStore().settings;
  // Settings are seeded into Appwrite by scripts/seed-appwrite.mjs and cached by the caller.
  return getStore().settings;
}

export async function resolveCoupon(
  code: string | undefined,
  subtotal: number,
  userId?: string | null,
): Promise<{ coupon: Coupon | null; error?: string }> {
  if (!code) return { coupon: null };
  const coupons = isAppwriteConfigured
    ? await (async () => {
        const { databases } = createAdminClient();
        const result = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.collections.coupons,
          [Query.equal("code", code.toUpperCase())],
        );
        return result.documents.map((d) => docToCoupon(d as never));
      })()
    : getStore().coupons;

  const coupon = coupons.find((c) => c.code === code.toUpperCase().trim());
  if (!coupon) return { coupon: null, error: "That discount code is not recognised." };
  if (!coupon.active) return { coupon: null, error: "This discount code is no longer active." };
  const now = Date.now();
  if (coupon.startAt && +new Date(coupon.startAt) > now) return { coupon: null, error: "This code is not active yet." };
  if (coupon.endAt && +new Date(coupon.endAt) < now) return { coupon: null, error: "This code has expired." };
  if (coupon.usedCount >= coupon.usageLimit) return { coupon: null, error: "This code has reached its usage limit." };
  if (subtotal < coupon.minOrder) {
    return { coupon: null, error: `This code requires a minimum spend of GH₵${(coupon.minOrder / 100).toFixed(2)}.` };
  }
  if (coupon.firstOrderOnly && userId) {
    const orders = await getOrdersForUser(userId);
    if (orders.length > 0) return { coupon: null, error: "This code is for first orders only." };
  }
  return { coupon };
}

export function calculateShipping(
  subtotal: number,
  deliveryMethod: "standard" | "express",
  country: string,
): number {
  const settings = getSettings();
  const rule = getStore().shippingRules.find((r) => r.country.toLowerCase() === country.toLowerCase());
  const threshold = rule?.freeShippingThreshold ?? settings.freeShippingThreshold;
  const standard = rule?.standardPrice ?? settings.standardShipping;
  const express = rule?.expressPrice ?? settings.expressShipping;
  if (deliveryMethod === "express") return express;
  return subtotal >= threshold ? 0 : standard;
}

/** Server-authoritative pricing: never trust prices submitted by the browser. */
export async function calculatePricing(input: {
  items: { productId: string; variantId: string; quantity: number }[];
  couponCode?: string;
  deliveryMethod: "standard" | "express";
  country: string;
  userId?: string | null;
}): Promise<PricingResult> {
  const lines: OrderItem[] = [];
  let subtotal = 0;
  const problems: string[] = [];

  for (const entry of input.items) {
    const product = await getProductById(entry.productId);
    const variant = product?.variants.find((v) => v.id === entry.variantId);
    if (!product || product.status !== "published" || !variant) {
      problems.push("One or more items are no longer available.");
      continue;
    }
    if (variant.stock < entry.quantity) {
      problems.push(`Only ${variant.stock} of ${product.name} (${variant.size}) remaining.`);
      continue;
    }
    const unitPrice = variant.price;
    const lineTotal = unitPrice * entry.quantity;
    subtotal += lineTotal;
    lines.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      colour: variant.colour,
      size: variant.size,
      quantity: entry.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const { coupon, error } = await resolveCoupon(input.couponCode, subtotal, input.userId);
  let couponError = error;
  if (coupon && !couponError) {
    const restrictedByProduct = coupon.productIds.length > 0;
    const restrictedByCategory = coupon.categoryIds.length > 0;
    if (restrictedByProduct || restrictedByCategory) {
      const allowedCategories = new Set(
        coupon.categoryIds.flatMap((id) => {
          const category = getStore().categories.find(
            (c) => c.id === id || c.slug === id,
          );
          return category ? [category.id] : [];
        }),
      );
      let eligibleCount = 0;
      for (const line of lines) {
        const product = await getProductById(line.productId);
        const byProduct = coupon.productIds.includes(line.productId);
        const byCategory = product ? allowedCategories.has(product.categoryId) : false;
        if ((!restrictedByProduct || byProduct) && (!restrictedByCategory || byCategory)) {
          eligibleCount += 1;
        }
      }
      if (eligibleCount === 0) {
        couponError = "This discount code does not apply to any item in your bag.";
      } else if (eligibleCount !== lines.length) {
        couponError = "This code only applies to selected items. Remove other items to use it.";
      }
    }
  }
  let discount = 0;
  if (coupon && !couponError) {
    if (coupon.type === "percentage") discount = Math.round((subtotal * coupon.value) / 100);
    else if (coupon.type === "fixed") discount = Math.min(coupon.value, subtotal);
  }
  const shippingInput = calculateShipping(subtotal, input.deliveryMethod, input.country);
  const shipping = coupon?.type === "free_shipping" ? 0 : shippingInput;

  return {
    lines,
    subtotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount + shipping),
    coupon,
    couponError: problems[0] || couponError,
  };
}

export async function createOrder(input: {
  items: { productId: string; variantId: string; quantity: number }[];
  email: string;
  name: string;
  phone: string;
  address: Address;
  deliveryMethod: "standard" | "express";
  couponCode?: string;
  userId?: string | null;
  paymentProvider?: string;
}): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  const pricing = await calculatePricing({
    items: input.items,
    couponCode: input.couponCode,
    deliveryMethod: input.deliveryMethod,
    country: input.address.country,
    userId: input.userId,
  });
  if (pricing.couponError) return { ok: false, error: pricing.couponError };
  if (pricing.lines.length === 0) return { ok: false, error: "Your bag is empty or items are unavailable." };

  const now = new Date().toISOString();
  const order: Order = {
    id: `order_${Date.now()}`,
    orderNumber: generateOrderNumber(),
    userId: input.userId ?? null,
    guestEmail: input.email,
    customerName: input.name,
    phone: input.phone,
    items: pricing.lines,
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    shipping: pricing.shipping,
    total: pricing.total,
    couponCode: pricing.coupon?.code ?? null,
    address: input.address,
    deliveryMethod: input.deliveryMethod,
    status: "pending_payment",
    paymentStatus: "pending",
    paymentReference: null,
    paymentProvider: input.paymentProvider ?? null,
    timeline: [{ status: "pending_payment", at: now, note: "Order placed, awaiting payment." }],
    createdAt: now,
    updatedAt: now,
  };

  if (!isAppwriteConfigured) {
    let created: Order | null = null;
    mutateStore((store) => {
      // Re-check and decrement stock inside the same mutation.
      for (const line of pricing.lines) {
        const product = store.products.find((p) => p.id === line.productId);
        const variant = product?.variants.find((v) => v.id === line.variantId);
        if (!variant || variant.stock < line.quantity) {
          throw new Error(`Stock changed for ${line.name}. Please review your bag.`);
        }
      }
      for (const line of pricing.lines) {
        const product = store.products.find((p) => p.id === line.productId)!;
        const variant = product.variants.find((v) => v.id === line.variantId)!;
        variant.stock -= line.quantity;
        store.inventory.push({
          id: `inv_${Date.now()}_${line.variantId}`,
          variantId: variant.id,
          productId: product.id,
          productName: product.name,
          change: -line.quantity,
          reason: "Order placement",
          actorId: input.userId ?? "guest",
          createdAt: now,
        });
      }
      if (pricing.coupon) {
        const coupon = store.coupons.find((c) => c.id === pricing.coupon!.id);
        if (coupon) coupon.usedCount += 1;
      }
      store.orders.unshift(order);
      created = order;
    });
    return { ok: true, order: created! };
  }

  try {
    const { databases } = createAdminClient();
    for (const line of pricing.lines) {
      const product = await getProductById(line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      if (!variant || variant.stock < line.quantity) {
        return { ok: false, error: `Stock changed for ${line.name}. Please review your bag.` };
      }
      const remaining = variant.stock - line.quantity;
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.products,
        product!.id,
        {
          variants: JSON.stringify(
            product!.variants.map((v) => (v.id === line.variantId ? { ...v, stock: remaining } : v)),
          ),
        },
      );
    }
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.orders,
      ID.unique(),
      orderToDoc(order),
    );
    return { ok: true, order: { ...order, id: doc.$id } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create order." };
  }
}

export async function markOrderPaid(reference: string, provider = "paystack") {
  if (!isAppwriteConfigured) {
    let updated: Order | null = null;
    mutateStore((store) => {
      const order = store.orders.find((o) => o.paymentReference === reference);
      if (!order) return;
      if (order.paymentStatus === "paid") {
        updated = order;
        return;
      }
      order.paymentStatus = "paid";
      order.status = "payment_confirmed";
      order.paymentProvider = provider;
      order.timeline.push({ status: "payment_confirmed", at: new Date().toISOString(), note: "Payment verified." });
      order.updatedAt = new Date().toISOString();
      updated = order;
    });
    return updated;
  }
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.orders,
    [],
  );
  const doc = result.documents.find(
    (d) => String((d as Record<string, unknown>).paymentReference) === reference,
  );
  if (!doc) return null;
  const order = docToOrder(doc as never);
  if (order.paymentStatus === "paid") return order;
  const now = new Date().toISOString();
  const updatedDoc = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.collections.orders,
    doc.$id,
    orderToDoc({
      paymentStatus: "paid",
      status: "payment_confirmed",
      paymentProvider: provider,
      timeline: [...order.timeline, { status: "payment_confirmed", at: now, note: "Payment verified." }],
      updatedAt: now,
    }),
  );
  return docToOrder(updatedDoc as never);
}

export async function setPaymentReference(orderId: string, reference: string) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      const order = store.orders.find((o) => o.id === orderId);
      if (order) order.paymentReference = reference;
    });
    return;
  }
  const { databases } = createAdminClient();
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.collections.orders,
    orderId,
    { paymentReference: reference },
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  actorId: string,
  note?: string,
) {
  const now = new Date().toISOString();
  if (!isAppwriteConfigured) {
    let updated: Order | null = null;
    mutateStore((store) => {
      const order = store.orders.find((o) => o.id === orderId);
      if (!order) return;
      order.status = status;
      order.timeline.push({ status, at: now, note });
      order.updatedAt = now;
      updated = order;
    });
    return updated;
  }
  const { databases } = createAdminClient();
  const doc = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.collections.orders,
    orderId,
  );
  const order = docToOrder(doc as never);
  const updated = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.collections.orders,
    orderId,
    orderToDoc({
      status,
      timeline: [...order.timeline, { status, at: now, note: note || `Updated by ${actorId}` }],
      updatedAt: now,
    }),
  );
  return docToOrder(updated as never);
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (!isAppwriteConfigured) return getStore().orders.find((o) => o.id === id) ?? null;
  const { databases } = createAdminClient();
  try {
    const doc = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.collections.orders, id);
    return docToOrder(doc as never);
  } catch {
    return null;
  }
}

export async function getOrderByNumber(number: string): Promise<Order | null> {
  if (!isAppwriteConfigured) return getStore().orders.find((o) => o.orderNumber === number) ?? null;
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.orders, []);
  const doc = result.documents.find(
    (d) => String((d as Record<string, unknown>).orderNumber) === number,
  );
  return doc ? docToOrder(doc as never) : null;
}

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  if (!isAppwriteConfigured) return getStore().orders.filter((o) => o.userId === userId);
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.orders, []);
  return result.documents
    .map((d) => docToOrder(d as never))
    .filter((o) => o.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getAllOrders(): Promise<Order[]> {
  if (!isAppwriteConfigured) return [...getStore().orders];
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.collections.orders,
    [Query.orderDesc("createdAt"), Query.limit(200)],
  );
  return result.documents.map((d) => docToOrder(d as never));
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  return (await getAllOrders()).slice(0, limit);
}

export async function refundOrder(orderId: string, actorId: string) {
  return updateOrderStatus(orderId, "refunded", actorId, "Refund issued.");
}

