"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  registerSchema,
  loginSchema,
  checkoutSchema,
  reviewSchema,
  addressSchema,
  newsletterSchema,
  productSchema,
  categorySchema,
  couponSchema,
} from "@/lib/validations";
import {
  registerUser,
  loginUser,
  logout as logoutUser,
  getCurrentUser,
  requireAdmin,
} from "@/lib/auth";
import { addToCart, updateCartItem, removeFromCart, clearCart } from "@/lib/data/cart";
import { toggleWishlist } from "@/lib/data/wishlist";
import { createOrder, updateOrderStatus, refundOrder } from "@/lib/data/orders";
import { initializePaystack, initializeStripe } from "@/lib/data/payments";
import { submitReview } from "@/lib/data/reviews";
import { saveAddress, deleteAddress, updateProfile } from "@/lib/data/account";
import { subscribe } from "@/lib/data/newsletter";
import {
  audit,
  saveProduct,
  deleteProduct,
  saveCategory,
  deleteCategory,
  saveBrand,
  saveCoupon,
  deleteCoupon,
  adjustInventory,
  updateStoreSettings,
  updateHomepageContent,
  updateUserRoles,
} from "@/lib/data/admin";
import { sendOrderConfirmation, sendPaymentConfirmation, sendWelcomeEmail } from "@/lib/email";
import type { Address, OrderStatus, Role } from "@/lib/types";

export type ActionState = { ok: boolean; message: string; data?: unknown };
const fail = (message: string): ActionState => ({ ok: false, message });
const success = (message: string, data?: unknown): ActionState => ({ ok: true, message, data });

// ---------------------------------------------------------------- auth
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const result = await registerUser(parsed.data);
  if (!result.ok) return fail(result.error);
  await sendWelcomeEmail(result.user.email, result.user.name).catch(() => undefined);
  revalidatePath("/");
  return success("Account created. Welcome to AURELIA.");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const result = await loginUser(parsed.data);
  if (!result.ok) return fail(result.error);
  revalidatePath("/");
  return success("Signed in successfully.");
}

export async function logoutAction() {
  await logoutUser();
  revalidatePath("/");
  redirect("/");
}

// ---------------------------------------------------------------- cart
export async function addToCartAction(
  productId: string,
  variantId: string,
  quantity = 1,
): Promise<ActionState> {
  const result = await addToCart(productId, variantId, quantity);
  revalidatePath("/cart");
  return result.ok ? success("Added to your bag.", result.items) : fail(result.error || "Could not add item.");
}

export async function updateCartAction(variantId: string, quantity: number): Promise<ActionState> {
  await updateCartItem(variantId, quantity);
  revalidatePath("/cart");
  return success("Bag updated.");
}

export async function removeCartAction(variantId: string): Promise<ActionState> {
  await removeFromCart(variantId);
  revalidatePath("/cart");
  return success("Item removed.");
}

// ---------------------------------------------------------------- wishlist
export async function toggleWishlistAction(
  productId: string,
): Promise<ActionState> {
  const user = await getCurrentUser();
  const ids = await toggleWishlist(productId, user?.id ?? null);
  revalidatePath("/wishlist");
  return success(ids.includes(productId) ? "Saved to wishlist." : "Removed from wishlist.", ids);
}

// ---------------------------------------------------------------- checkout
export async function checkoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = checkoutSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    region: formData.get("region"),
    city: formData.get("city"),
    street: formData.get("street"),
    postalCode: formData.get("postalCode") || undefined,
    deliveryMethod: formData.get("deliveryMethod") || "standard",
    couponCode: formData.get("couponCode") || undefined,
    items: JSON.parse(String(formData.get("items") || "[]")),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const user = await getCurrentUser();
  const address: Address = {
    id: `addr_${Date.now()}`,
    userId: user?.id ?? "guest",
    label: "Shipping address",
    fullName: parsed.data.name,
    phone: parsed.data.phone,
    country: parsed.data.country,
    region: parsed.data.region,
    city: parsed.data.city,
    street: parsed.data.street,
    postalCode: parsed.data.postalCode || "",
    isDefault: false,
  };

  const result = await createOrder({
    items: parsed.data.items,
    email: parsed.data.email,
    name: parsed.data.name,
    phone: parsed.data.phone,
    address,
    deliveryMethod: parsed.data.deliveryMethod,
    couponCode: parsed.data.couponCode,
    userId: user?.id ?? null,
    paymentProvider: "paystack",
  });
  if (!result.ok) return fail(result.error);

  await sendOrderConfirmation(result.order).catch(() => undefined);
  await clearCart();

  const provider = String(formData.get("provider") || "paystack");
  const payment = provider === "stripe"
    ? await initializeStripe(result.order)
    : await initializePaystack(result.order);

  revalidatePath("/cart");
  if (!payment.ok) {
    return success("Order placed. Payment setup will be available shortly.", { orderNumber: result.order.orderNumber });
  }
  return success("Redirecting to secure payment.", {
    url: payment.authorizationUrl,
    orderNumber: result.order.orderNumber,
  });
}

export async function confirmDemoPaymentAction(orderNumber: string): Promise<ActionState> {
  const { getOrderByNumber, markOrderPaid } = await import("@/lib/data/orders");
  const order = await getOrderByNumber(orderNumber);
  if (!order) return fail("Order not found.");
  const paid = await markOrderPaid(order.paymentReference || "", "demo");
  if (paid) await sendPaymentConfirmation(paid).catch(() => undefined);
  revalidatePath("/account/orders");
  revalidatePath(`/checkout/confirmation/${orderNumber}`);
  return success("Payment confirmed.");
}

// ---------------------------------------------------------------- reviews
export async function reviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in to leave a review.");
  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: Number(formData.get("rating")),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const result = await submitReview({ ...parsed.data, userId: user.id, userName: user.name });
  revalidatePath("/account/reviews");
  return result.ok ? success("Thank you. Your review is awaiting moderation.") : fail(result.error || "Could not submit review.");
}

// ---------------------------------------------------------------- account
export async function saveAddressAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.");
  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    region: formData.get("region"),
    city: formData.get("city"),
    street: formData.get("street"),
    postalCode: formData.get("postalCode") || undefined,
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  await saveAddress(user.id, {
    ...parsed.data,
    postalCode: parsed.data.postalCode || "",
    isDefault: parsed.data.isDefault ?? false,
  });
  revalidatePath("/account/addresses");
  return success("Address saved.");
}

export async function deleteAddressAction(id: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.");
  await deleteAddress(user.id, id);
  revalidatePath("/account/addresses");
  return success("Address removed.");
}

export async function profileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return fail("Please sign in.");
  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  if (name.length < 2) return fail("Please enter your name.");
  await updateProfile(user, { name, phone });
  revalidatePath("/account/profile");
  return success("Profile updated.");
}

export async function subscribeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const result = await subscribe(parsed.data.email);
  if (!result.ok) return fail(result.error || "Could not subscribe.");
  return success("You're on the list. Welcome to AURELIA.");
}

// ---------------------------------------------------------------- admin
async function requireAdminOrFail() {
  const admin = await requireAdmin();
  if (!admin) return null;
  return { id: admin.id, email: admin.email };
}

export async function saveProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminOrFail();
  if (!actor) return fail("Unauthorized.");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    price: Number(formData.get("price")),
    comparePrice: formData.get("comparePrice") ? Number(formData.get("comparePrice")) : null,
    images: JSON.parse(String(formData.get("images") || "[]")),
    colours: JSON.parse(String(formData.get("colours") || "[]")),
    sizes: JSON.parse(String(formData.get("sizes") || "[]")),
    material: formData.get("material") || "",
    care: formData.get("care") || "",
    status: formData.get("status") || "draft",
    featured: formData.get("featured") === "on",
    newArrival: formData.get("newArrival") === "on",
    trending: formData.get("trending") === "on",
    gender: formData.get("gender") || "unisex",
    style: formData.get("style") || "",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const id = String(formData.get("id") || "");
  const { getProductById } = await import("@/lib/data/catalogue");
  const existing = id ? await getProductById(id) : null;
  const colours = parsed.data.colours as { name: string; hex: string }[];
  const sizes = parsed.data.sizes as string[];
  const variants = (existing?.variants ?? []).length
    ? existing!.variants
    : colours.flatMap((c) =>
        sizes.map((s, i) => ({
          id: `v_${Date.now()}_${c.name.replace(/\s/g, "")}_${s.replace(/\s/g, "")}_${i}`,
          productId: id || `p_${Date.now()}`,
          colour: c.name,
          hex: c.hex,
          size: s,
          sku: `AUR-${Date.now().toString().slice(-5)}-${c.name.slice(0, 3).toUpperCase()}-${s.toUpperCase()}`,
          price: parsed.data.price,
          stock: 10,
          lowStockThreshold: 3,
        })),
      );
  await saveProduct(
    {
      id: id || `p_${Date.now()}`,
      ...parsed.data,
      slug:
        parsed.data.slug ||
        `${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id || Date.now()}`,
      comparePrice: parsed.data.comparePrice ?? null,
      colours,
      sizes,
      variants,
      images: parsed.data.images as string[],
      rating: existing?.rating ?? 0,
      reviewCount: existing?.reviewCount ?? 0,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    actor,
  );
  revalidatePath("/admin/products");
  revalidatePath("/");
  return success("Product saved.");
}

export async function deleteProductAction(id: string): Promise<ActionState> {
  const actor = await requireAdminOrFail();
  if (!actor) return fail("Unauthorized.");
  await deleteProduct(id, actor);
  revalidatePath("/admin/products");
  return success("Product deleted.");
}

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminOrFail();
  if (!actor) return fail("Unauthorized.");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || "",
    image: formData.get("image") || "",
    parentId: formData.get("parentId") || null,
    order: Number(formData.get("order") || 0),
    active: formData.get("active") === "on",
    gender: formData.get("gender") || "unisex",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  await saveCategory({ ...parsed.data, id: String(formData.get("id") || undefined) }, actor);
  revalidatePath("/admin/categories");
  return success("Category saved.");
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  const actor = await requireAdminOrFail();
  if (!actor) return fail("Unauthorized.");
  await deleteCategory(id, actor);
  revalidatePath("/admin/categories");
  return success("Category deleted.");
}

export async function saveBrandAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminOrFail();
  if (!actor) return fail("Unauthorized.");
  await saveBrand(
    {
      id: String(formData.get("id") || "") || undefined,
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      logo: String(formData.get("logo") || ""),
      active: formData.get("active") === "on",
    },
    actor,
  );
  revalidatePath("/admin/brands");
  return success("Brand saved.");
}

export async function saveCouponAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminOrFail();
  if (!actor) return fail("Unauthorized.");
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: Number(formData.get("value") || 0),
    minOrder: Number(formData.get("minOrder") || 0),
    usageLimit: Number(formData.get("usageLimit") || 100),
    startAt: String(formData.get("startAt") || new Date().toISOString()),
    endAt: String(formData.get("endAt") || new Date(Date.now() + 30 * 86400000).toISOString()),
    active: formData.get("active") === "on",
    firstOrderOnly: formData.get("firstOrderOnly") === "on",
    productIds: [],
    categoryIds: [],
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  await saveCoupon({ ...parsed.data, id: String(formData.get("id") || "") || undefined }, actor);
  revalidatePath("/admin/promotions");
  return success("Promotion saved.");
}

export async function deleteCouponAction(id: string): Promise<ActionState> {
  const actor = await requireAdminOrFail();
  if (!actor) return fail("Unauthorized.");
  await deleteCoupon(id, actor);
  revalidatePath("/admin/promotions");
  return success("Promotion deleted.");
}

export async function orderStatusAction(orderId: string, status: OrderStatus): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.");
  await updateOrderStatus(orderId, status, admin.id, `Status changed by ${admin.name}`);
  await audit({ actorId: admin.id, actorEmail: admin.email, action: "status", entity: "order", entityId: orderId, details: status });
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  return success("Order status updated.");
}

export async function refundAction(orderId: string): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.");
  await refundOrder(orderId, admin.id);
  revalidatePath("/admin/orders");
  return success("Order refunded.");
}

export async function inventoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized.");
  await adjustInventory({
    variantId: String(formData.get("variantId") || ""),
    change: Number(formData.get("change") || 0),
    reason: String(formData.get("reason") || "Manual adjustment"),
    actorId: admin.id,
  });
  await audit({ actorId: admin.id, actorEmail: admin.email, action: "adjust", entity: "inventory", entityId: String(formData.get("variantId") || "") });
  revalidatePath("/admin/inventory");
  return success("Inventory adjusted.");
}

export async function settingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdminOrFail();
  if (!admin) return fail("Unauthorized.");
  const { getStoreSettings } = await import("@/lib/data/admin");
  const current = await getStoreSettings();
  const next = {
    ...current,
    storeName: String(formData.get("storeName") || current.storeName),
    announcement: String(formData.get("announcement") || ""),
    heroHeading: String(formData.get("heroHeading") || ""),
    heroSubheading: String(formData.get("heroSubheading") || ""),
    heroImage: String(formData.get("heroImage") || ""),
    contactEmail: String(formData.get("contactEmail") || ""),
    contactPhone: String(formData.get("contactPhone") || ""),
    standardShipping: Number(formData.get("standardShipping") || 0),
    expressShipping: Number(formData.get("expressShipping") || 0),
    freeShippingThreshold: Number(formData.get("freeShippingThreshold") || 0),
  };
  await updateStoreSettings(next, admin);
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return success("Settings saved.");
}

export async function contentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdminOrFail();
  if (!admin) return fail("Unauthorized.");
  const parsed = JSON.parse(String(formData.get("content") || "{}"));
  await updateHomepageContent(parsed, admin);
  revalidatePath("/");
  return success("Homepage content updated.");
}

export async function rolesAction(userId: string, roles: Role[]): Promise<ActionState> {
  const admin = await requireAdminOrFail();
  if (!admin) return fail("Unauthorized.");
  await updateUserRoles(userId, roles, admin);
  revalidatePath("/admin/staff");
  return success("Roles updated.");
}
