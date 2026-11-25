import { ID } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { getStore, mutateStore } from "@/lib/demo/store";

export async function subscribe(email: string) {
  const value = email.toLowerCase().trim();
  if (!isAppwriteConfigured) {
    let added = false;
    mutateStore((store) => {
      if (!store.newsletter.some((n) => n.email === value)) {
        store.newsletter.push({ email: value, createdAt: new Date().toISOString() });
        added = true;
      }
    });
    return { ok: true, added };
  }
  try {
    const { databases } = createAdminClient();
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.newsletter,
      ID.unique(),
      { email: value },
    );
    return { ok: true, added: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Subscription failed." };
  }
}

export async function getSubscribers() {
  if (!isAppwriteConfigured) return getStore().newsletter;
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.newsletter, []);
  return result.documents.map((d) => {
    const doc = d as unknown as Record<string, unknown>;
    return { email: String(doc.email ?? ""), createdAt: d.$createdAt };
  });
}
