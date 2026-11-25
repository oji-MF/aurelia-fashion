import { NextResponse } from "next/server";
import { verifyPaystackWebhook, processWebhookEvent } from "@/lib/data/payments";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackWebhook(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const result = await processWebhookEvent(event);
  return NextResponse.json({ received: true, ...result });
}
