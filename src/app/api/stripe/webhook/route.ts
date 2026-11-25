import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { markOrderPaid } from "@/lib/data/orders";

function verifySignature(payload: string, header: string | null, secret: string) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const timestamp = parts.t;
  const signatures: string[] = Object.entries(parts)
    .filter(([key]) => key.startsWith("v1"))
    .map(([, value]) => String(value));
  if (!timestamp || !signatures.length) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return signatures.some((sig) => {
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!verifySignature(raw, request.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let event: { type?: string; data?: { object?: { metadata?: Record<string, string>; payment_intent?: string; id?: string } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const reference = event.data?.object?.metadata?.orderNumber;
    if (reference) await markOrderPaid(reference, "stripe");
  }
  return NextResponse.json({ received: true });
}
