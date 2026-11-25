import { ID } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getStore, mutateStore } from "@/lib/demo/store";
import { getOrderById } from "./orders";
import type { ReturnRequest } from "@/lib/types";

export async function createReturnRequest(input: {
  orderId: string;
  productId: string;
  reason: string;
  details: string;
  userId: string;
}): Promise<{ ok: boolean; error?: string; request?: ReturnRequest }> {
  const order = await getOrderById(input.orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.userId !== input.userId) return { ok: false, error: "You can only return your own orders." };
  if (order.paymentStatus !== "paid") return { ok: false, error: "Only paid orders can be returned." };
  const item = order.items.find((i) => i.productId === input.productId);
  if (!item) return { ok: false, error: "That product is not part of this order." };

  const now = new Date().toISOString();
  const request: ReturnRequest = {
    id: `ret_${Date.now()}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: input.userId,
    productId: input.productId,
    productName: item.name,
    reason: input.reason,
    details: input.details,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  if (!isAppwriteConfigured) {
    const duplicate = getStore().returns.some(
      (r) => r.orderId === input.orderId && r.productId === input.productId && r.status !== "rejected",
    );
    if (duplicate) return { ok: false, error: "A return for this item is already in progress." };
    mutateStore((store) => {
      if (!store.returns) store.returns = [];
      store.returns.unshift(request);
    });
    return { ok: true, request };
  }

  try {
    const { databases } = createAdminClient();
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.returns,
      ID.unique(),
      { ...request },
    );
    return { ok: true, request };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not submit return." };
  }
}

export async function getReturnRequests(userId?: string): Promise<ReturnRequest[]> {
  if (!isAppwriteConfigured) {
    const list = getStore().returns ?? [];
    return userId ? list.filter((r) => r.userId === userId) : list;
  }
  try {
    const { databases } = createAdminClient();
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.returns, []);
    const list = result.documents.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        id: d.$id,
        orderId: String(doc.orderId ?? ""),
        orderNumber: String(doc.orderNumber ?? ""),
        userId: String(doc.userId ?? ""),
        productId: String(doc.productId ?? ""),
        productName: String(doc.productName ?? ""),
        reason: String(doc.reason ?? ""),
        details: String(doc.details ?? ""),
        status: (doc.status as ReturnRequest["status"]) || "pending",
        createdAt: d.$createdAt,
        updatedAt: d.$updatedAt,
      };
    });
    return userId ? list.filter((r) => r.userId === userId) : list;
  } catch {
    return [];
  }
}

export async function updateReturnStatus(id: string, status: ReturnRequest["status"]) {
  const now = new Date().toISOString();
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      const item = store.returns.find((r) => r.id === id);
      if (item) {
        item.status = status;
        item.updatedAt = now;
      }
    });
    return;
  }
  const { databases } = createAdminClient();
  await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.collections.returns, id, { status });
}
