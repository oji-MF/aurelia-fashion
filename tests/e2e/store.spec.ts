import { test, expect } from "@playwright/test";

test.describe("AURELIA storefront", () => {
  test("homepage renders editorial content and theme toggle works", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /A new language of style/ })).toBeVisible();
    await expect(page.getByText("Shop by category")).toBeVisible();
    const html = page.locator("html");
    const before = await html.evaluate((el) => el.classList.contains("dark"));
    const toggle = page.getByRole("button", { name: /Switch to (dark|light) mode/ }).first();
    await toggle.click();
    await expect.poll(() => html.evaluate((el) => el.classList.contains("dark"))).toBe(!before);
  });

  test("search suggests real products", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search" }).click();
    const input = page.getByPlaceholder("Search products, brands, SKU...");
    await input.fill("dress");
    await expect(page.getByRole("link", { name: /Dress/ }).first()).toBeVisible({ timeout: 15_000 });
  });

  test("product page: select size, quick view and add to bag", async ({ page }) => {
    await page.goto("/product/sculpted-midi-dress-1");
    await expect(page.getByRole("heading", { name: "Sculpted Midi Dress" })).toBeVisible();
    await page.getByRole("button", { name: "Size guide" }).click();
    await expect(page.getByRole("dialog", { name: "Size guide" })).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).last().click();
    await page.getByRole("button", { name: "M", exact: true }).first().click();
    await page.getByRole("button", { name: /Add to bag/i }).first().click();
    await expect(page.getByText("Added to your bag.")).toBeVisible({ timeout: 15_000 });
  });

  test("logo returns to the homepage from any page", async ({ page, isMobile }) => {
    await page.goto("/women");
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("link", { name: "AURELIA home" }).last().click();
    } else {
      await page.getByRole("link", { name: "AURELIA home" }).first().click();
    }
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /A new language of style/ })).toBeVisible();
  });

  test("admin area redirects unauthenticated visitors", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("demo customer can sign in and view account", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("customer@aurelia.demo");
    await page.getByLabel("Password").fill("Aurelia!2026");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByText("Demo Customer")).toBeVisible();
  });
});
