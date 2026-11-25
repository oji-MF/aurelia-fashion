import { cookies } from "next/headers";
import { getProductById } from "./catalogue";
import { mutateStore } from "@/lib/demo/store";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getStore } from "@/lib/demo/store";
import { ID } from "node-appwrite";
import type { Cart, CartItem } from "@/lib/types";

export const CART_COOKIE = "aurelia_cart";

type StoredItem = { productId: string; variantId: string; quantity: number };

async function readStored(): Promise<StoredItem[]> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStored(items: StoredItem[]) {
  const jar = await cookies();
  jar.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCart(): Promise<Cart> {
  const stored = await readStored();
  const items: CartItem[] = [];
  for (const entry of stored) {
    const product = await getProductById(entry.productId);
    const variant = product?.variants.find((v) => v.id === entry.variantId);
    if (!product || !variant) continue;
    items.push({
      id: variant.id,
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      colour: variant.colour,
      size: variant.size,
      price: variant.price,
      quantity: Math.min(entry.quantity, Math.max(1, variant.stock)),
      maxStock: variant.stock,
    });
  }
  return { id: "cart", items, updatedAt: new Date().toISOString() };
}

export async function addToCart(
  productId: string,
  variantId: string,
  quantity = 1,
): Promise<{ ok: boolean; error?: string; items?: CartItem[] }> {
  const product = await getProductById(productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || product.status !== "published") return { ok: false, error: "Product unavailable." };
  if (!variant) return { ok: false, error: "Please select a colour and size." };
  if (variant.stock < 1) return { ok: false, error: "This variant is out of stock." };

  const stored = await readStored();
  const existing = stored.find((i) => i.variantId === variantId);
  const desired = (existing?.quantity ?? 0) + quantity;
  if (desired > variant.stock) {
    return { ok: false, error: `Only ${variant.stock} available in this option.` };
  }
  if (existing) existing.quantity = desired;
  else stored.push({ productId, variantId, quantity });
  await writeStored(stored);
  const cart = await getCart();
  return { ok: true, items: cart.items };
}

export async function updateCartItem(variantId: string, quantity: number) {
  const stored = await readStored();
  const item = stored.find((i) => i.variantId === variantId);
  if (!item) return;
  const product = await getProductById(item.productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  const max = variant?.stock ?? 0;
  if (quantity <= 0) {
    await writeStored(stored.filter((i) => i.variantId !== variantId));
    return;
  }
  item.quantity = Math.min(quantity, Math.max(1, max));
  await writeStored(stored);
}

export async function removeFromCart(variantId: string) {
  const stored = await readStored();
  await writeStored(stored.filter((i) => i.variantId !== variantId));
}

export async function clearCart() {
  await writeStored([]);
}

/** Persisted cart for a signed-in account. */
export async function getAccountCart(userId: string): Promise<StoredItem[]> {
  if (!isAppwriteConfigured) return getStore().carts?.[userId] ?? [];
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.carts, []);
    const doc = result.documents.find((d) => String((d as Record<string, unknown>).userId) === userId);
    if (!doc) return [];
    const value = (doc as Record<string, unknown>).items;
    return typeof value === "string" ? JSON.parse(value) : Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function saveAccountCart(userId: string, items: StoredItem[]) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      if (!store.carts) store.carts = {};
      store.carts[userId] = items;
    });
    return;
  }
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.carts, []);
    const doc = result.documents.find((d) => String((d as Record<string, unknown>).userId) === userId);
    const payload = { userId, items: JSON.stringify(items) };
    if (doc) {
      await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collections.carts, doc.$id, payload);
    } else {
      await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.carts, ID.unique(), payload);
    }
  } catch {
    // Non-critical: the cookie copy still holds the cart.
  }
}

/**
 * Called on sign-in/registration. Combines the guest cookie cart with the
 * account cart by variant, capped at available stock, and merges wishlists so
 * nothing is duplicated or lost.
 */
export async function mergeGuestCart(userId: string) {
  const guest = await readStored();
  const account = await getAccountCart(userId);
  const combined = new Map<string, StoredItem>();
  for (const item of [...account, ...guest]) {
    const existing = combined.get(item.variantId);
    combined.set(item.variantId, {
      ...item,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
  }

  const merged: StoredItem[] = [];
  for (const item of combined.values()) {
    const product = await getProductById(item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (!product || !variant || variant.stock < 1) continue;
    merged.push({ ...item, quantity: Math.min(item.quantity, variant.stock) });
  }

  await writeStored(merged);
  await saveAccountCart(userId, merged);

  // Wishlist merge
  const guestIds = await (await import("./wishlist")).getWishlistIds(null);
  const accountIds = await (await import("./wishlist")).getWishlistIds(userId);
  const allIds = Array.from(new Set([...accountIds, ...guestIds]));
  if (allIds.length !== accountIds.length) {
    await (await import("./wishlist")).setWishlistForUser(userId, allIds);
  }
  return merged;
}
