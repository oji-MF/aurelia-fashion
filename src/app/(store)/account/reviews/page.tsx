import Link from "next/link";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getReviewsForUser } from "@/lib/data/reviews";
import { getProductById } from "@/lib/data/catalogue";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const reviews = await getReviewsForUser(user.id);
  const products = await Promise.all(reviews.map((r) => getProductById(r.productId)));

  return (
    <div>
      <h2 className="font-display text-2xl">Your reviews</h2>
      {reviews.length ? (
        <div className="mt-6 divide-y divide-ink/10 border border-ink/10 bg-white/60">
          {reviews.map((review, i) => (
            <div key={review.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{products[i]?.name || "Product"}</p>
                  <div className="mt-1 flex gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, n) => <Star key={n} className={`h-3 w-3 ${n < review.rating ? "fill-accent" : "text-ink/20"}`} />)}
                  </div>
                </div>
                <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] uppercase tracking-wider text-stone">{review.status}</span>
              </div>
              <p className="mt-3 text-sm font-medium">{review.title}</p>
              <p className="mt-1 text-sm text-stone">{review.body}</p>
            </div>
          ))}
        </div>
      ) : <p className="mt-6 border border-dashed border-ink/15 p-10 text-center text-sm text-stone">You haven't written any reviews yet. <Link href="/account/orders" className="text-accent underline">Review a purchase</Link>.</p>}
    </div>
  );
}
