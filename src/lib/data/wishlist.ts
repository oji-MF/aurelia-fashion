import { cookies } from "next/headers";
import { getStore, mutateStore } from "@/lib/demo/store";
import { isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/lib/config";
import type { Product, Wishlist } from "@/lib/types";

const WISHLIST_COOKIE = "aurelia_wishlist";

async function guestIds(): Promise<string[]> {
  const jar = await cookies();
  const raw = jar.get(WISHLIST_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setGuestIds(ids: string[]) {
  const jar = await cookies();
  jar.set(WISHLIST_COOKIE, JSON.stringify(ids), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getWishlistIds(userId?: string | null): Promise<string[]> {
  if (userId) {
    if (!isAppwriteConfigured) return getStore().wishlists[userId] ?? [];
    try {
      const { databases } = createAdminClient();
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.wishlists,
        [],
      );
      const doc = result.documents.find((d) => String((d as Record<string, unknown>).userId) === userId);
      if (!doc) return [];
      const value = (doc as Record<string, unknown>).productIds;
      return typeof value === "string" ? JSON.parse(value) : Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }
  return guestIds();
}

export async function getWishlist(userId?: string | null): Promise<Wishlist> {
  return {
    id: "wishlist",
    productIds: await getWishlistIds(userId),
    updatedAt: new Date().toISOString(),
  };
}

export async function setWishlistForUser(userId: string, ids: string[]) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      store.wishlists[userId] = ids;
    });
    return;
  }
  try {
    const { databases } = createAdminClient();
    await databases.upsertDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.wishlists,
      userId.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 36),
      { userId, productIds: JSON.stringify(ids) },
    );
  } catch {
    // ignore
  }
}

export async function toggleWishlist(productId: string, userId?: string | null) {
  const ids = await getWishlistIds(userId);
  const next = ids.includes(productId)
    ? ids.filter((id) => id !== productId)
    : [...ids, productId];

  if (!userId) {
    await setGuestIds(next);
  } else {
    await setWishlistForUser(userId, next);
  }
  return next;
}

export async function isWishlisted(productId: string, userId?: string | null) {
  return (await getWishlistIds(userId)).includes(productId);
}

export async function getWishlistProducts(userId?: string | null): Promise<Product[]> {
  const { getProductById } = await import("./catalogue");
  const ids = await getWishlistIds(userId);
  const products = await Promise.all(ids.map((id) => getProductById(id)));
  return products.filter((p): p is Product => p !== null);
}
