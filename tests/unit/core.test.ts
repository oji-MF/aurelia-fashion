import { describe, expect, it, beforeEach } from "vitest";
import { slugify, formatMoney, generateOrderNumber } from "@/lib/utils";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSeedData } from "@/lib/demo/seed-data";
import { sortProducts } from "@/lib/data/catalogue";
import { calculatePricing } from "@/lib/data/orders";
import { resetStore } from "@/lib/demo/store";

describe("utilities", () => {
  it("slugifies names", () => {
    expect(slugify("Sculpted Midi Dress!")).toBe("sculpted-midi-dress");
    expect(slugify("Élan Blouse")).toBe("elan-blouse");
  });
  it("formats money in pesewas", () => {
    expect(formatMoney(18900)).toBe("GH₵189.00");
  });
  it("generates unique order numbers", () => {
    expect(generateOrderNumber()).toMatch(/^AUR-\d{8}-[A-F0-9]{8}$/);
  });
});

describe("passwords", () => {
  it("hashes and verifies", () => {
    const hash = hashPassword("Aurelia!2026");
    expect(hash).not.toContain("Aurelia");
    expect(verifyPassword("Aurelia!2026", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });
  it("accepts seeded demo password", () => {
    expect(verifyPassword("Aurelia!2026", "demo$admin")).toBe(true);
  });
});

describe("catalogue", () => {
  it("seeds at least 40 products with variants", () => {
    const data = createSeedData();
    expect(data.products.length).toBeGreaterThanOrEqual(40);
    expect(data.products.every((p) => p.variants.length > 0)).toBe(true);
    expect(data.categories.length).toBeGreaterThan(10);
    expect(data.brands.length).toBeGreaterThan(5);
  });

  it("sorts by price and rating", () => {
    const products = createSeedData().products;
    const ascending = sortProducts(products, "price_asc");
    expect(ascending[0].price).toBeLessThanOrEqual(ascending[1].price);
    const rated = sortProducts(products, "rating");
    expect(rated[0].rating).toBeGreaterThanOrEqual(rated[1].rating);
  });
});

describe("pricing", () => {
  beforeEach(() => resetStore());

  it("recalculates totals from the database and applies coupons", async () => {
    const pricing = await calculatePricing({
      items: [{ productId: "p_001", variantId: "v_001_black_xs", quantity: 1 }],
      couponCode: "WELCOME10",
      deliveryMethod: "standard",
      country: "Ghana",
    });
    expect(pricing.subtotal).toBe(18900);
    expect(pricing.discount).toBe(1890);
    expect(pricing.shipping).toBe(1500);
    expect(pricing.total).toBe(18510);
  });

  it("rejects invalid coupons and unavailable stock", async () => {
    const invalid = await calculatePricing({
      items: [{ productId: "p_001", variantId: "v_001_black_xs", quantity: 1 }],
      couponCode: "NOTREAL",
      deliveryMethod: "standard",
      country: "Ghana",
    });
    expect(invalid.couponError).toContain("not recognised");

    const tooMany = await calculatePricing({
      items: [{ productId: "p_001", variantId: "v_001_black_xs", quantity: 999 }],
      deliveryMethod: "standard",
      country: "Ghana",
    });
    expect(tooMany.couponError).toContain("remaining");
  });
});
