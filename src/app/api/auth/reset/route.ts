import { NextResponse } from "next/server";
import { z } from "zod";
import { isAppwriteConfigured, siteConfig } from "@/lib/config";
import { createSessionClient } from "@/lib/appwrite/server";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  if (!isAppwriteConfigured) {
    return NextResponse.json({ ok: true, demo: true, message: "In demo mode, password reset is simulated. Configure Appwrite to send a real reset email." });
  }
  try {
    const { account } = createSessionClient();
    await account.createRecovery(parsed.data.email, `${siteConfig.url}/reset-password`);
    return NextResponse.json({ ok: true });
  } catch {
    // Do not reveal whether the email exists.
    return NextResponse.json({ ok: true });
  }
}
