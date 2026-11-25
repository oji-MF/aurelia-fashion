import { rateLimit } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribe } from "@/lib/data/newsletter";
import { sendNewsletterConfirmation } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const limited = rateLimit(request, "newsletter", 30);
  if (limited) return limited;
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  const result = await subscribe(parsed.data.email);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  if (result.added) await sendNewsletterConfirmation(parsed.data.email).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
