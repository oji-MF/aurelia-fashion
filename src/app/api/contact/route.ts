import { NextResponse } from "next/server";
import { z } from "zod";
import { contactSchema } from "@/lib/validations";

const extended = contactSchema.extend({});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = extended.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  // In production, forward this to the support inbox via Resend or a ticketing system.
  console.log("[contact]", parsed.data.email, parsed.data.subject);
  return NextResponse.json({ ok: true });
}
