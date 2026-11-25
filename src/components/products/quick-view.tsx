"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, Loader2, Star } from "lucide-react";
import { addToCartAction, toggleWishlistAction } from "@/app/actions";
import { useToast } from "@/components/ui/toast";
import { cn, formatMoney } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function QuickView({
  product,
  wishlisted,
  onClose,
}: {
  product: Product;
  wishlisted: boolean;
  onClose: () => void;
}) {
  const [colour, setColour] = useState(product.colours[0]?.name || "");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [saved, setSaved] = useState(wishlisted);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const variants = useMemo(() => product.variants.filter((v) => v.colour === colour), [product.variants, colour]);
  const selected = variants.find((v) => v.size === size);
  const inStock = product.variants.filter((v) => v.stock > 0).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function add() {
    if (!selected) {
      toast("Please select a size.", "error");
      return;
    }
    startTransition(async () => {
      const result = await addToCartAction(product.id, selected.id, quantity);
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="Close quick view" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        className="relative grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-y-auto bg-surface shadow-2xl sm:grid-cols-2"
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-surface/90 hover:text-accent">
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[4/5] bg-cream sm:aspect-auto sm:min-h-[520px]">
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          {product.comparePrice && (
            <span className="absolute left-4 top-4 bg-accent px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
              Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
            </span>
          )}
        </div>

        <div className="flex flex-col p-6 sm:p-9">
          <p className="eyebrow text-accent">{product.brand?.name || "AURELIA"}</p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl">{product.name}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-stone">
            <span className="flex text-accent">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn("h-3 w-3", i < Math.round(product.rating) ? "fill-accent" : "text-line/20")} />)}</span>
            {product.rating.toFixed(1)} · {product.reviewCount} reviews
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-2xl">{formatMoney(product.price)}</span>
            {product.comparePrice && <span className="text-sm text-stone line-through">{formatMoney(product.comparePrice)}</span>}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium">Colour: <span className="font-normal text-stone">{colour}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.colours.map((c) => (
                <button key={c.name} onClick={() => { setColour(c.name); setSize(""); }} title={c.name} aria-label={c.name}
                  className={cn("h-8 w-8 rounded-full border-2 transition-all", colour === c.name ? "border-fg ring-2 ring-line/20" : "border-surface ring-1 ring-line/20")}
                  style={{ background: c.hex }} />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium">Size</p>
              <Link href={`/product/${product.slug}`} onClick={onClose} className="text-[11px] text-stone underline underline-offset-4">Size guide</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const variant = variants.find((v) => v.size === s);
                const disabled = !variant || variant.stock === 0;
                return (
                  <button key={s} disabled={disabled} onClick={() => setSize(s)}
                    className={cn("min-w-11 border px-3 py-2 text-xs transition-colors",
                      disabled ? "cursor-not-allowed border-line/10 text-stone/40 line-through" : size === s ? "border-fg bg-fg text-surface" : "border-line/20 hover:border-fg")}>
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-stone">{inStock} options in stock · Free returns within 14 days</p>
          </div>

          <div className="mt-auto flex gap-3 pt-6">
            <div className="flex items-center border border-line/20">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-3 text-sm hover:bg-cream" aria-label="Decrease quantity">−</button>
              <span className="w-7 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(selected?.stock || 1, quantity + 1))} className="px-3 py-3 text-sm hover:bg-cream" aria-label="Increase quantity">+</button>
            </div>
            <button onClick={add} disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 bg-ink py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accent disabled:opacity-50">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Adding…" : "Add to bag"}
            </button>
            <button onClick={() => { setSaved(!saved); startTransition(async () => { const r = await toggleWishlistAction(product.id); if (!r.ok) setSaved(saved); toast(r.message, r.ok ? "success" : "error"); }); }}
              aria-label="Save to wishlist" className="flex h-[52px] w-12 items-center justify-center border border-line/20 hover:border-accent">
              <Heart className={cn("h-4 w-4", saved && "fill-accent text-accent")} />
            </button>
          </div>

          <Link href={`/product/${product.slug}`} onClick={onClose} className="mt-4 text-center text-xs text-accent underline underline-offset-4">
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}
