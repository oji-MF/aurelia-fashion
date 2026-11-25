import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { verifyPaystack } from "@/lib/data/payments";

export const dynamic = "force-dynamic";

export default async function PaymentCallback({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; provider?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  const reference = sp.reference || sp.trxref || "";
  if (!reference) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-accent" />
        <h1 className="mt-5 font-display text-3xl">Missing payment reference</h1>
        <p className="mt-3 text-sm text-stone">We couldn't verify this payment. Please check your account or contact support.</p>
        <Link href="/account/orders" className="mt-6 inline-block text-sm text-accent underline underline-offset-4">View my orders</Link>
      </div>
    );
  }

  const result = await verifyPaystack(reference);
  const orderNumber = result.verified ? result.order?.orderNumber : undefined;

  if (result.verified) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h1 className="mt-5 font-display text-3xl">Payment confirmed</h1>
        <p className="mt-3 text-sm text-stone">Thank you. Your order <strong>{orderNumber}</strong> is being prepared. A confirmation has been sent to your email.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={`/checkout/confirmation/${orderNumber}`} className="bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">View order</Link>
          <Link href="/" className="border border-line/20 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent" />
      <h1 className="mt-5 font-display text-3xl">Verifying your payment</h1>
      <p className="mt-3 text-sm text-stone">This can take a few moments. {result.error ? `(${result.error})` : ""} Do not refresh this page repeatedly.</p>
      <p className="mt-4 text-xs text-stone">If payment was successful, your order status will update automatically once the provider confirms it.</p>
      <Link href="/account/orders" className="mt-6 inline-block text-sm text-accent underline underline-offset-4">Check order status</Link>
    </div>
  );
}
