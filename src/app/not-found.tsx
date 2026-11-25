import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl">We couldn't find that page</h1>
      <p className="mt-3 text-sm text-stone">The page may have moved, or the link might be out of date. Let's get you back to something good.</p>
      <Link href="/" className="mt-8 bg-ink px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-accentSolid">Back to home</Link>
    </div>
  );
}
