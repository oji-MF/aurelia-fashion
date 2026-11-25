import { rateLimit } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionClient } from "@/lib/appwrite/server";
import { isAppwriteConfigured } from "@/lib/config";

const schema = z.object({
  userId: z.string(),
  secret: z.string(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "confirm-reset", 30);
  if (limited) return limited;
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  if (!isAppwriteConfigured) return NextResponse.json({ ok: true, demo: true });
  try {
    const { account } = createSessionClient();
    await account.updateRecovery(parsed.data.userId, parsed.data.secret, parsed.data.password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not reset password." }, { status: 400 });
  }
}
