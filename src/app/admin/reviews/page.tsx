import { getAllReviews } from "@/lib/data/reviews";
import { getProductById } from "@/lib/data/catalogue";
import { moderateReviewAction } from "@/app/admin/reviews/actions";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  const products = await Promise.all(reviews.map((r) => getProductById(r.productId)));
  const pending = reviews.filter((r) => r.status === "pending");

  return (
    <div>
      <h1 className="font-display text-3xl">Reviews</h1>
      <p className="mt-1 text-sm text-stone">{pending.length} awaiting moderation · {reviews.length} total</p>
      <div className="mt-6 space-y-3">
        {reviews.slice(0, 50).map((review, i) => (
          <div key={review.id} className="flex flex-wrap items-start justify-between gap-4 border border-ink/10 bg-white p-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3"><p className="font-medium">{products[i]?.name || "Product"}</p><span className={`rounded-full px-2 py-1 text-[10px] uppercase ${review.status === "approved" ? "bg-success/10 text-success" : review.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-cream text-stone"}`}>{review.status}</span></div>
              <p className="mt-2 text-sm">{review.title}</p>
              <p className="mt-1 text-xs text-stone">{review.body}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-stone"><span className="flex text-accent">{Array.from({ length: 5 }).map((_, n) => <Star key={n} className={`h-3 w-3 ${n < review.rating ? "fill-accent" : ""}`} />)}</span> · {review.userName}</p>
            </div>
            {review.status !== "approved" && <form action={moderateReviewAction.bind(null, review.id, "approved")}><button className="border border-ink/20 px-4 py-2 text-xs hover:border-success hover:text-success">Approve</button></form>}
            {review.status !== "rejected" && <form action={moderateReviewAction.bind(null, review.id, "rejected")}><button className="border border-ink/20 px-4 py-2 text-xs hover:border-accent hover:text-accent">Reject</button></form>}
          </div>
        ))}
        {!reviews.length && <p className="border border-dashed border-ink/15 p-12 text-center text-sm text-stone">No reviews yet.</p>}
      </div>
    </div>
  );
}
