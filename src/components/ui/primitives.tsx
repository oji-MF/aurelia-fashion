import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "light" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
    size === "sm" && "px-4 py-2 text-xs",
    size === "md" && "px-6 py-3 text-sm",
    size === "lg" && "px-8 py-4 text-sm",
    variant === "primary" && "bg-ink text-white hover:bg-accent",
    variant === "outline" && "border border-line/20 text-fg hover:border-line hover:bg-ink hover:text-white",
    variant === "ghost" && "text-fg hover:text-accent",
    variant === "light" && "bg-surface text-fg hover:bg-cream",
    variant === "dark" && "bg-surface/10 text-white backdrop-blur border border-white/30 hover:bg-surface hover:text-fg",
    fullWidth && "w-full",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "sale" | "success" | "warning";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        tone === "neutral" && "bg-cream text-fg",
        tone === "sale" && "bg-accent text-white",
        tone === "success" && "bg-success/10 text-success",
        tone === "warning" && "bg-amber-100 text-amber-800",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  align = "left",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", align === "center" && "flex-col items-center text-center")}>
      <div>
        {eyebrow && <p className={cn("eyebrow mb-3", light ? "text-white/60" : "text-accent")}>{eyebrow}</p>}
        <h2 className={cn("font-display text-3xl md:text-4xl", light ? "text-white" : "text-fg")}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-line/15 bg-surface/60 px-6 py-20 text-center">
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mt-3 max-w-md text-sm text-stone">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[3/4] w-full" />
          <div className="skeleton mt-3 h-4 w-3/4" />
          <div className="skeleton mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line/10", className)} />;
}
