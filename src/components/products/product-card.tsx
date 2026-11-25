"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, Eye } from "lucide-react";
import { addToCartAction, toggleWishlistAction } from "@/app/actions";
import { QuickView } from "./quick-view";
import { useToast } from "@/components/ui/toast";
import { formatMoney, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  wishlisted = false,
  priority = false,
}: {
  product: Product;
  wishlisted?: boolean;
  priority?: boolean;
}) {
  const [saved, setSaved] = useState(wishlisted);
  const [hover, setHover] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant =
      product.variants.find((v) => v.stock > 0) || product.variants[0];
    if (!variant) return;
    startTransition(async () => {
      const result = await addToCartAction(product.id, variant.id, 1);
      toast(result.message, result.ok ? "success" : "error");
    });
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const previous = saved;
    setSaved(!previous);
    startTransition(async () => {
      const result = await toggleWishlistAction(product.id);
      if (!result.ok) setSaved(previous);
      toast(result.message, result.ok ? "success" : "error");
    });
  };

  return (
    <article className="group relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <Image
            src={product.images[hover && product.images[1] ? 1 : 0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.newArrival && <span className="bg-surface px-2 py-1 text-[9px] font-bold uppercase tracking-widest">New</span>}
          {discount > 0 && <span className="bg-accentSolid px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white">-{discount}%</span>}
        </div>

        <button
          onClick={toggleSave}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 backdrop-blur transition-transform hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-accent text-accent")} />
        </button>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 bg-gradient-to-t from-black/20 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={quickAdd}
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 bg-surface py-2.5 text-[11px] font-semibold uppercase tracking-wider text-fg transition-colors hover:bg-ink hover:text-white disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" /> {pending ? "Adding…" : "Quick add"}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(true); }}
            aria-label="Quick view"
            className="flex h-10 w-10 items-center justify-center bg-surface text-fg transition-colors hover:bg-ink hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">{product.brand?.name || "AURELIA"}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 block truncate text-sm font-medium hover:text-accent">{product.name}</Link>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn("text-sm font-medium", product.comparePrice && "text-accent")}>
            {formatMoney(product.price)}
          </span>
          {product.comparePrice && <span className="text-xs text-stone line-through">{formatMoney(product.comparePrice)}</span>}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {product.colours.slice(0, 5).map((colour) => (
            <span
              key={colour.name}
              title={colour.name}
              className="h-3.5 w-3.5 rounded-full border border-black/10"
              style={{ background: colour.hex }}
            />
          ))}
          {product.colours.length > 5 && <span className="text-[10px] text-stone">+{product.colours.length - 5}</span>}
        </div>
      </div>
      {quickView && (
        <QuickView product={product} wishlisted={saved} onClose={() => setQuickView(false)} />
      )}
    </article>
  );
}
