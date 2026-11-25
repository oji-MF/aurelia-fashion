import { createHmac, timingSafeEqual } from "node:crypto";
import { paystackConfig, siteConfig } from "@/lib/config";
import { formatMoney, randomString } from "@/lib/utils";
import { getOrderById, markOrderPaid, setPaymentReference } from "./orders";
import type { Order } from "@/lib/types";

const PAYSTACK_API = "https://api.paystack.co";

export function generatePaymentReference(order: Order) {
  return `${order.orderNumber.replace(/[^a-zA-Z0-9]/g, "")}-${randomString(5).toUpperCase()}`;
}

export async function initializePaystack(order: Order) {
  if (!paystackConfig.secretKey) {
    return { ok: false as const, error: "Payments are not configured. Add PAYSTACK_SECRET_KEY to .env.local." };
  }
  const reference = order.paymentReference || generatePaymentReference(order);
  await setPaymentReference(order.id, reference);

  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackConfig.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: order.guestEmail,
      amount: order.total,
      reference,
      currency: siteConfig.currency,
      callback_url: `${siteConfig.url}/checkout/callback?reference=${reference}`,
      metadata: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        items: order.items.map((i) => `${i.quantity} × ${i.name}`),
        custom_fields: [
          { display_name: "Order", variable_name: "order_number", value: order.orderNumber },
        ],
      },
      channels: ["card", "bank", "mobile_money", "ussd"],
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.status) {
    return { ok: false as const, error: data?.message || "Could not initialise payment." };
  }
  return { ok: true as const, authorizationUrl: data.data.authorization_url as string, reference };
}

/** Server-side verification using Paystack's response — never from redirect state. */
export async function verifyPaystack(reference: string) {
  if (!paystackConfig.secretKey) return { verified: false as const, error: "Payments not configured." };
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackConfig.secretKey}` },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data.status) return { verified: false as const, error: "Could not verify payment." };
  const transaction = data.data;
  if (transaction.status !== "success") {
    return { verified: false as const, error: "Payment was not successful.", gatewayStatus: transaction.status };
  }
  const order = await findOrderByReference(reference);
  if (!order) return { verified: false as const, error: "Order not found." };
  if (transaction.amount !== order.total) {
    return { verified: false as const, error: "Payment amount mismatch." };
  }
  const paid = await markOrderPaid(reference, "paystack");
  return { verified: true as const, order: paid, reference };
}

async function findOrderByReference(reference: string) {
  const { getAllOrders } = await import("./orders");
  const orders = await getAllOrders();
  return orders.find((o) => o.paymentReference === reference) ?? null;
}

export function verifyPaystackWebhook(rawBody: string, signature: string | null) {
  if (!paystackConfig.secretKey) return false;
  if (!signature) return false;
  const expected = createHmac("sha512", paystackConfig.secretKey).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function processWebhookEvent(event: Record<string, unknown>) {
  const eventType = String(event.event ?? "");
  if (eventType !== "charge.success") return { processed: false, event: eventType };
  const data = (event.data ?? {}) as Record<string, unknown>;
  const reference = String(data.reference ?? "");
  if (!reference) return { processed: false, event: eventType };
  const { getStore, mutateStore } = await import("@/lib/demo/store");
  const already = getStore().webhooks.some((w) => (w as Record<string, unknown>).reference === reference);
  if (already) return { processed: false, event: eventType, reason: "duplicate" };
  const result = await verifyPaystack(reference);
  mutateStore((store) => {
    store.webhooks.push({ reference, event: eventType, at: new Date().toISOString() });
  });
  return { processed: result.verified, event: eventType, reference };
}

export async function initializeStripe(order: Order) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false as const, error: "Stripe is not configured." };
  }
  const params = new URLSearchParams({
    "line_items[0][price_data][currency]": siteConfig.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": String(order.total),
    "line_items[0][price_data][product_data][name]": `Order ${order.orderNumber}`,
    "line_items[0][quantity]": "1",
    mode: "payment",
    success_url: `${siteConfig.url}/checkout/callback?reference=${order.orderNumber}&provider=stripe`,
    cancel_url: `${siteConfig.url}/checkout?cancelled=1`,
    "metadata[orderNumber]": order.orderNumber,
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const data = await response.json();
  if (!response.ok) return { ok: false as const, error: data?.error?.message || "Stripe checkout failed." };
  await setPaymentReference(order.id, order.orderNumber);
  return { ok: true as const, authorizationUrl: data.url as string, reference: order.orderNumber };
}

export function formatOrderTotal(order: Order) {
  return formatMoney(order.total, siteConfig.currency, siteConfig.currencySymbol);
}
