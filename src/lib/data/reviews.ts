import { ID } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getStore, mutateStore } from "@/lib/demo/store";
import { docToReview } from "./serialize";
import type { Review } from "@/lib/types";

export async function getReviewsForUser(userId: string): Promise<Review[]> {
  if (!isAppwriteConfigured) return getStore().reviews.filter((r) => r.userId === userId);
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.reviews, []);
  return result.documents.map((d) => docToReview(d as never)).filter((r) => r.userId === userId);
}

export async function hasPurchasedProduct(userId: string, productId: string) {
  if (!isAppwriteConfigured) {
    return getStore().orders.some(
      (o) =>
        o.userId === userId &&
        o.paymentStatus === "paid" &&
        o.items.some((i) => i.productId === productId),
    );
  }
  const { getAllOrders } = await import("./orders");
  const orders = await getAllOrders();
  return orders.some(
    (o) => o.userId === userId && o.paymentStatus === "paid" && o.items.some((i) => i.productId === productId),
  );
}

export async function submitReview(input: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await hasPurchasedProduct(input.userId, input.productId))) {
    return { ok: false, error: "Only customers who purchased this product can leave a review." };
  }
  const existing = await getReviewsForUser(input.userId);
  if (existing.some((r) => r.productId === input.productId)) {
    return { ok: false, error: "You have already reviewed this product." };
  }
  const review: Review = {
    id: `r_${Date.now()}`,
    productId: input.productId,
    userId: input.userId,
    userName: input.userName,
    orderId: "",
    rating: input.rating,
    title: input.title,
    body: input.body,
    images: [],
    status: "pending",
    verifiedPurchase: true,
    createdAt: new Date().toISOString(),
  };
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      store.reviews.unshift(review);
      const product = store.products.find((p) => p.id === input.productId);
      if (product) {
        const approved = store.reviews.filter((r) => r.productId === input.productId && r.status === "approved");
        product.reviewCount = approved.length;
        product.rating = approved.length
          ? Number((approved.reduce((sum, r) => sum + r.rating, 0) / approved.length).toFixed(1))
          : 0;
      }
    });
    return { ok: true };
  }
  try {
    const { databases } = createAdminClient();
    await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.collections.reviews, ID.unique(), {
      ...review,
      images: JSON.stringify(review.images),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not submit review." };
  }
}

export async function getAllReviews(): Promise<Review[]> {
  if (!isAppwriteConfigured) return [...getStore().reviews];
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.reviews, []);
  return result.documents.map((d) => docToReview(d as never));
}

export async function moderateReview(id: string, status: Review["status"]) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      const review = store.reviews.find((r) => r.id === id);
      if (review) review.status = status;
    });
    return;
  }
  const { databases } = createAdminClient();
  await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collections.reviews, id, { status });
}
