import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatMoney(amount: number, _currency = "GHS", symbol = "GH₵") {
  const formatted = new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
  return `${symbol}${formatted}`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function truncate(value: string, length = 140) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function randomString(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateOrderNumber() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `AUR-${date}-${randomString(4).toUpperCase()}`;
}

export function parseJSON<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value as T;
  try {
    return JSON.parse(value as string) as T;
  } catch {
    return fallback;
  }
}
