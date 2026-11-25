import { ID } from "node-appwrite";
import { isAppwriteConfigured } from "@/lib/config";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { getStore, mutateStore } from "@/lib/demo/store";
import { hashPassword, verifyPassword } from "./password";
import { clearSession, getSession, setSession } from "./session";
import type { Role, User } from "@/lib/types";
import { randomUUID } from "node:crypto";

export { getSession, clearSession };

type AuthResult = { ok: true; user: User } | { ok: false; error: string };

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();

  if (isAppwriteConfigured) {
    try {
      const { users, account } = createAdminClient();
      const userId = ID.unique();
      await users.create(userId, email, undefined, input.name, input.password);
      const session = await account.createEmailPasswordSession(email, input.password);
      const user: User = {
        id: userId,
        email,
        name: input.name,
        phone: "",
        roles: ["customer"],
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };
      await setSession({ ...user, phone: session.secret } as User);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Registration failed." };
    }
  }

  if (getStore().users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user: User = {
    id: randomUUID(),
    email,
    name: input.name,
    phone: "",
    roles: ["customer"],
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };
  mutateStore((store) => {
    store.users.push({ ...user, passwordHash: hashPassword(input.password) });
  });
  await setSession(user);
  return { ok: true, user };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();

  if (isAppwriteConfigured) {
    try {
      const { account } = createSessionClient();
      const session = await account.createEmailPasswordSession(email, input.password);
      const accountUser = await account.get();
      const prefs = (accountUser.prefs ?? {}) as Record<string, unknown>;
      const user: User = {
        id: accountUser.$id,
        email: accountUser.email,
        name: accountUser.name,
        phone: (prefs.phone as string) || "",
        roles: (prefs.roles as Role[]) || ["customer"],
        emailVerified: accountUser.emailVerification,
        createdAt: accountUser.$createdAt,
      };
      await setSession({ ...user, phone: session.secret } as User);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: "Invalid email or password." };
    }
  }

  const stored = getStore().users.find((u) => u.email === email);
  if (!stored || !verifyPassword(input.password, stored.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }
  const { passwordHash: _ignored, ...user } = stored;
  await setSession(user);
  return { ok: true, user };
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  if (isAppwriteConfigured) {
    try {
      const { account } = createSessionClient(session.user.phone);
      const accountUser = await account.get();
      const prefs = (accountUser.prefs ?? {}) as Record<string, unknown>;
      return {
        id: accountUser.$id,
        email: accountUser.email,
        name: accountUser.name,
        phone: (prefs.phone as string) || "",
        roles: (prefs.roles as Role[]) || ["customer"],
        emailVerified: accountUser.emailVerification,
        createdAt: accountUser.$createdAt,
      };
    } catch {
      return null;
    }
  }

  const stored = getStore().users.find((u) => u.id === session.user.id);
  if (!stored) return null;
  const { passwordHash: _ignored, ...user } = stored;
  return user;
}

const ADMIN_ROLES: Role[] = [
  "super_admin",
  "admin",
  "product_manager",
  "order_manager",
  "inventory_manager",
  "customer_support",
  "marketing_manager",
];

export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return user.roles.some((r) => ADMIN_ROLES.includes(r)) ? user : null;
}

export async function requireSuperAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return user.roles.includes("super_admin") || user.roles.includes("admin") ? user : null;
}

export async function logout() {
  if (isAppwriteConfigured) {
    try {
      const session = await getSession();
      if (session?.user.phone) {
        const { account } = createSessionClient(session.user.phone);
        await account.deleteSession("current");
      }
    } catch {
      // ignore
    }
  }
  await clearSession();
}
