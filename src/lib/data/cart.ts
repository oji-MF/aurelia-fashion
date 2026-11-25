import { cookies } from "next/headers";
import { getProductById } from "./catalogue";
import { getStore, mutateStore } from "@/lib/demo/store";
import { isAppwriteConfigured } from "@/lib/config";
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

export async function mergeGuestCart(userId: string) {
  if (isAppwriteConfigured) return; // Guest cookie already persists; account carts can be added here.
  mutateStore((store) => {
    if (!store.wishlists) store.wishlists = {};
  });
  void userId;
}
