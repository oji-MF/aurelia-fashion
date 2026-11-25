import { ID } from "node-appwrite";
import { appwriteConfig, isAppwriteConfigured } from "@/lib/config";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { getStore, mutateStore } from "@/lib/demo/store";
import type { Address, User } from "@/lib/types";

export async function getAddresses(userId: string): Promise<Address[]> {
  if (!isAppwriteConfigured) return getStore().addresses.filter((a) => a.userId === userId);
  const { databases } = createAdminClient();
  const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.collections.addresses, []);
  return result.documents
    .map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        id: d.$id,
        userId: String(doc.userId ?? ""),
        label: String(doc.label ?? ""),
        fullName: String(doc.fullName ?? ""),
        phone: String(doc.phone ?? ""),
        country: String(doc.country ?? ""),
        region: String(doc.region ?? ""),
        city: String(doc.city ?? ""),
        street: String(doc.street ?? ""),
        postalCode: String(doc.postalCode ?? ""),
        isDefault: Boolean(doc.isDefault),
      } satisfies Address;
    })
    .filter((a) => a.userId === userId);
}

export async function saveAddress(userId: string, input: Omit<Address, "id" | "userId">) {
  const address: Address = { ...input, id: `addr_${Date.now()}`, userId };
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      if (address.isDefault) {
        store.addresses.forEach((a) => {
          if (a.userId === userId) a.isDefault = false;
        });
      }
      store.addresses.push(address);
    });
    return address;
  }
  const { databases } = createAdminClient();
  const doc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.collections.addresses,
    ID.unique(),
    { ...address, userId },
  );
  return { ...address, id: doc.$id };
}

export async function deleteAddress(userId: string, addressId: string) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      store.addresses = store.addresses.filter((a) => !(a.id === addressId && a.userId === userId));
    });
    return;
  }
  const { databases } = createAdminClient();
  await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.collections.addresses, addressId);
}

export async function updateProfile(user: User, input: { name: string; phone: string }) {
  if (!isAppwriteConfigured) {
    mutateStore((store) => {
      const stored = store.users.find((u) => u.id === user.id);
      if (stored) {
        stored.name = input.name;
        stored.phone = input.phone;
      }
    });
    return;
  }
  const session = (await import("@/lib/auth/session")).getSession;
  const current = await session();
  const { account } = createSessionClient(current?.user.phone);
  await account.updateName(input.name);
  await account.updatePrefs({ phone: input.phone, roles: user.roles });
}
