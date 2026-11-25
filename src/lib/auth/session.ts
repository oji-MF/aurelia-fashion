import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Session, User } from "@/lib/types";

export const SESSION_COOKIE = "aurelia_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.SESSION_SECRET || "aurelia-dev-session-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: User) {
  return new SignJWT({ sub: user.id, email: user.email, roles: user.roles })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function readSessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || !payload.email) return null;
    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        name: (payload.name as string) || "",
        phone: (payload.phone as string) || "",
        roles: (payload.roles as User["roles"]) || ["customer"],
        emailVerified: Boolean(payload.emailVerified),
        createdAt: (payload.createdAt as string) || new Date().toISOString(),
      },
      token,
      expiresAt: (payload.exp || 0) * 1000,
    };
  } catch {
    return null;
  }
}

export async function setSession(user: User) {
  const token = await createSessionToken(user);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return token;
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}
