"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, Share2, Truck, RotateCcw, ShieldCheck, ChevronDown, Star, Check, Loader2,
} from "lucide-react";
import { addToCartAction, toggleWishlistAction, reviewAction, type ActionState } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { formatMoney, cn } from "@/lib/utils";
import type { Product, Review } from "@/lib/types";

const initialReview: ActionState = { ok: false, message: "" };

export function ProductDetail({
  product,
  reviews,
  wishlisted,
  canReview,
  related,
}: {
  product: Product;
  reviews: Review[];
  wishlisted: boolean;
  canReview: boolean;
  related: Product[];
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [colour, setColour] = useState(product.colours[0]?.name || "");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(wishlisted);
  const [pending, startTransition] = useTransition();
  const [reviewState, reviewFormAction, reviewPending] = useActionState(reviewAction, initialReview);
  const { toast } = useToast();

  const variants = useMemo(
    () => product.variants.filter((v) => v.colour === colour),
    [product.variants, colour],
  );
  const availableSizes = useMemo(
    () => product.sizes.filter((s) => variants.some((v) => v.size === s && v.stock > 0)),
    [product.sizes, variants],
  );
  const selectedVariant = variants.find((v) => v.size === size);
  const maxStock = selectedVariant?.stock ?? 0;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  useEffect(() => {
    setSize("");
    setQuantity(1);
    if (product.colours.length) setColour(product.colours[0].name);
    try {
      const key = "aurelia_recently_viewed";
      const raw = localStorage.getItem(key);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [product.id, product.colours]);

  function addToBag() {
    if (!selectedVariant) {
      toast("Please select a size.", "error");
      return;
    }
    startTransition(async () => {
      const result = await addToCartAction(product.id, selectedVariant.id, quantity);
      toast(result.message, result.ok ? "success" : "error");
    });
  }

  function toggleSave() {
    const previous = saved;
    setSaved(!previous);
    startTransition(async () => {
      const result = await toggleWishlistAction(product.id);
      if (!result.ok) setSaved(previous);
      toast(result.message, result.ok ? "success" : "error");
    });
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Product link copied.");
    } catch {
      toast("Could not copy link.", "error");
    }
  }

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <nav className="mb-8 flex items-center gap-1.5 text-[11px] text-stone" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link href={product.gender === "women" ? "/women" : product.gender === "men" ? "/men" : "/new-arrivals"} className="hover:text-accent">
          {product.gender === "women" ? "Women" : product.gender === "men" ? "Men" : "Collections"}
        </Link>
        <span>/</span>
        {product.category && <><Link href={`/c/${product.category.slug}`} className="hover:text-accent">{product.category.name}</Link><span>/</span></>}
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="group relative aspect-[3/4] overflow-hidden bg-cream">
            <Image
              src={product.images[imageIndex]}
              alt={`${product.name} — view ${imageIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
            />
            {discount > 0 && <span className="absolute left-4 top-4 bg-accent px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">-{discount}%</span>}
            {product.newArrival && <span className="absolute left-4 top-14 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest">New</span>}
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
            {product.images.map((image, i) => (
              <button
                key={image + i}
                onClick={() => setImageIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={cn("relative h-24 w-20 shrink-0 overflow-hidden bg-cream border-2 transition-colors", imageIndex === i ? "border-ink" : "border-transparent")}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:pt-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-accent">{product.brand?.name || "AURELIA"}</p>
              <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
            </div>
            <div className="flex gap-1">
              <button onClick={toggleSave} aria-label="Save to wishlist" className="flex h-10 w-10 items-center justify-center border border-ink/15 hover:border-ink">
                <Heart className={cn("h-[18px] w-[18px]", saved && "fill-accent text-accent")} />
              </button>
              <button onClick={share} aria-label="Share product" className="flex h-10 w-10 items-center justify-center border border-ink/15 hover:border-ink">
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(avgRating) ? "fill-accent" : "text-ink/20")} />
              ))}
            </div>
            <span className="text-xs text-stone">{avgRating.toFixed(1)} · {product.reviewCount} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatMoney(product.price)}</span>
            {product.comparePrice && <><span className="text-base text-stone line-through">{formatMoney(product.comparePrice)}</span><span className="text-xs font-semibold text-accent">Save {formatMoney(product.comparePrice - product.price)}</span></>}
          </div>
          <p className="mt-1 text-[11px] text-stone">Price includes VAT at 0%. Shipping calculated at checkout.</p>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider">Colour: <span className="font-normal normal-case tracking-normal text-stone">{colour}</span></p>
              <span className="text-[11px] text-stone">{product.colours.length} available</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colours.map((c) => (
                <button
                  key={c.name}
                  onClick={() => { setColour(c.name); setSize(""); }}
                  title={c.name}
                  aria-label={c.name}
                  className={cn("h-9 w-9 rounded-full border-2 transition-all", colour === c.name ? "border-ink ring-2 ring-offset-2 ring-ink/20" : "border-white ring-1 ring-black/10")}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider">Size</p>
              <Link href="/faq#sizing" className="text-[11px] text-stone underline underline-offset-4 hover:text-accent">Size guide</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const variant = variants.find((v) => v.size === s);
                const disabled = !variant || variant.stock === 0;
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    disabled={disabled}
                    className={cn(
                      "relative min-w-12 border px-3 py-2.5 text-xs transition-colors",
                      disabled && "cursor-not-allowed border-ink/10 text-stone/40 line-through",
                      !disabled && size === s && "border-ink bg-ink text-white",
                      !disabled && size !== s && "border-ink/20 hover:border-ink",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {size && maxStock > 0 && (
              <p className={cn("mt-2 text-[11px]", maxStock <= 3 ? "text-accent" : "text-success")}>
                {maxStock <= 3 ? `Only ${maxStock} left in this size` : "In stock and ready to ship"}
              </p>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <div className="flex items-center border border-ink/20">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-3 text-sm hover:bg-cream" aria-label="Decrease quantity">−</button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(maxStock || 1, quantity + 1))} className="px-3.5 py-3 text-sm hover:bg-cream" aria-label="Increase quantity">+</button>
            </div>
            <button
              onClick={addToBag}
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 bg-ink py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-accent disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {pending ? "Adding…" : "Add to bag"}
            </button>
          </div>

          <div className="mt-6 space-y-3 border-t border-ink/10 pt-6">
            <div className="flex items-center gap-3 text-xs text-charcoal"><Truck className="h-4 w-4 text-accent" /> Standard delivery 2–5 business days · Free over GH₵500</div>
            <div className="flex items-center gap-3 text-xs text-charcoal"><RotateCcw className="h-4 w-4 text-accent" /> Free returns within 14 days</div>
            <div className="flex items-center gap-3 text-xs text-charcoal"><ShieldCheck className="h-4 w-4 text-accent" /> Secure payment via Paystack</div>
          </div>

          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            <Accordion title="Product details" defaultOpen>
              <p className="text-sm leading-relaxed text-stone">{product.description}</p>
              <p className="mt-3 text-xs text-stone">SKU: {variants[0]?.sku || "—"} · Style: {product.style || "Everyday"}</p>
            </Accordion>
            <Accordion title="Material & care">
              <p className="text-sm text-stone">{product.material || "See product details"}</p>
              <p className="mt-2 text-sm text-stone">{product.care}</p>
            </Accordion>
            <Accordion title="Delivery & returns">
              <p className="text-sm text-stone">Standard delivery 2–5 business days. Express available at checkout. Complimentary standard delivery on orders over GH₵500. Returns accepted within 14 days of delivery on unworn items with tags attached.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-ink/10 pt-14">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <h2 className="font-display text-3xl">Customer reviews</h2>
            <div className="mt-5 flex items-center gap-3">
              <span className="font-display text-5xl">{avgRating.toFixed(1)}</span>
              <div>
                <div className="flex text-accent">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-4 w-4", i < Math.round(avgRating) ? "fill-accent" : "text-ink/20")} />)}</div>
                <p className="mt-1 text-xs text-stone">Based on {reviews.length} reviews</p>
              </div>
            </div>
            {canReview && (
              <form action={reviewFormAction} className="mt-8 space-y-3 rounded-sm border border-ink/10 bg-white/60 p-5">
                <input type="hidden" name="productId" value={product.id} />
                <p className="eyebrow text-ink">Leave a review</p>
                <select name="rating" defaultValue="5" className="w-full border border-ink/15 bg-white px-3 py-2 text-sm">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                </select>
                <input name="title" required placeholder="Review title" className="w-full border border-ink/15 bg-white px-3 py-2 text-sm outline-none" />
                <textarea name="body" required minLength={10} placeholder="Tell us what you think" rows={3} className="w-full border border-ink/15 bg-white px-3 py-2 text-sm outline-none" />
                <button disabled={reviewPending} className="w-full bg-ink py-2.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50">
                  {reviewPending ? "Submitting…" : "Submit review"}
                </button>
                {reviewState.message && <p className={cn("text-xs", reviewState.ok ? "text-success" : "text-accent")}>{reviewState.message}</p>}
              </form>
            )}
          </div>
          <div className="divide-y divide-ink/10">
            {reviews.length ? reviews.map((review) => (
              <article key={review.id} className="py-6 first:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{review.userName} {review.verifiedPurchase && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-normal text-success"><Check className="h-3 w-3" /> Verified purchase</span>}</p>
                  <span className="text-[11px] text-stone">{new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="mt-1 flex text-accent">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-accent" : "text-ink/20")} />)}</div>
                <h3 className="mt-3 text-sm font-medium">{review.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone">{review.body}</p>
              </article>
            )) : <p className="py-8 text-sm text-stone">No reviews yet. Be the first to share your thoughts.</p>}
          </div>
        </div>
      </section>

      {/* Related — simple inline grid */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-ink/10 pt-14">
          <div className="mb-8 flex items-end justify-between">
            <div><p className="eyebrow mb-3 text-accent">You may also like</p><h2 className="font-display text-3xl">Complete the look</h2></div>
            <Link href={`/c/${product.category?.slug || "new-arrivals"}`} className="text-xs underline underline-offset-4">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <Link key={item.id} href={`/product/${item.slug}`} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                  <Image src={item.images[0]} alt={item.name} fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-3 truncate text-sm font-medium group-hover:text-accent">{item.name}</p>
                <p className="text-sm text-stone">{formatMoney(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left text-sm font-medium">
        {title}<ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

