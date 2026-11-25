import { Resend } from "resend";
import { isEmailConfigured, siteConfig } from "@/lib/config";
import { formatMoney } from "@/lib/utils";
import type { Order } from "@/lib/types";

function getResend() {
  if (!isEmailConfigured) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const shell = (title: string, body: string) => `
<!doctype html><html><body style="margin:0;background:#faf8f5;font-family:Helvetica,Arial,sans-serif;color:#14110f">
  <div style="max-width:600px;margin:0 auto;padding:48px 24px">
    <div style="font-size:13px;letter-spacing:0.25em;font-weight:700;margin-bottom:36px">${siteConfig.name}</div>
    <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:400;margin:0 0 20px">${title}</h1>
    <div style="font-size:15px;line-height:1.7;color:#333">${body}</div>
    <div style="margin-top:36px;padding-top:20px;border-top:1px solid #e5ded4;font-size:12px;color:#8c857c">
      ${siteConfig.name} · ${siteConfig.url}<br/>This is an automated message. Please do not reply.
    </div>
  </div>
</body></html>`;

async function send(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) return { sent: false, reason: "Email not configured" };
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || `AURELIA <hello@aurelia.example>`,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch {
    return { sent: false, reason: "Delivery failed" };
  }
}

export async function sendOrderConfirmation(order: Order) {
  const items = order.items
    .map((i) => `${i.quantity} × ${i.name} (${i.colour} / ${i.size}) — ${formatMoney(i.lineTotal)}`)
    .join("<br/>");
  return send(
    order.guestEmail,
    `Order ${order.orderNumber} received`,
    shell(
      "Thank you for your order",
      `<p>Hi ${order.customerName},</p><p>We've received your order <strong>${order.orderNumber}</strong>. Your payment is being verified and we'll notify you once confirmed.</p>
       <p style="margin:24px 0"><strong>Order summary</strong><br/>${items}<br/><br/>Subtotal: ${formatMoney(order.subtotal)}<br/>Delivery: ${formatMoney(order.shipping)}<br/><strong>Total: ${formatMoney(order.total)}</strong></p>
       <p>Estimated delivery: ${order.deliveryMethod === "express" ? "1–3 business days" : "2–5 business days"}.</p>`,
    ),
  );
}

export async function sendPaymentConfirmation(order: Order) {
  return send(
    order.guestEmail,
    `Payment confirmed — ${order.orderNumber}`,
    shell(
      "Payment confirmed",
      `<p>Hi ${order.customerName},</p><p>Your payment of <strong>${formatMoney(order.total)}</strong> for order ${order.orderNumber} has been confirmed. We're preparing your items now.</p>`,
    ),
  );
}

export async function sendWelcomeEmail(email: string, name: string) {
  return send(
    email,
    `Welcome to ${siteConfig.name}`,
    shell("Welcome", `<p>Hi ${name},</p><p>Thank you for joining ${siteConfig.name}. Explore the season's edit and enjoy complimentary delivery on orders over GH₵500.</p>`),
  );
}

export async function sendNewsletterConfirmation(email: string) {
  return send(email, `You're on the list`, shell("You're on the list", `<p>Thank you for subscribing to ${siteConfig.name}. You'll be first to know about new collections and offers.</p>`));
}
