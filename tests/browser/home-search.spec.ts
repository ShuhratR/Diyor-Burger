import { expect, test } from "@playwright/test";
import { fixtureProducts } from "../../src/lib/menu/fixture";

test("home displays all popular dishes, not only four", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const expected = fixtureProducts.filter(product => product.isActive && product.isPopular).length;
  expect(expected).toBeGreaterThan(4);
  await expect(page.locator(".home-popular .product-card")).toHaveCount(expected);
});

test("home combo rail contains all combos in catalogue order and advances itself", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Комбо DIYOR BURGER" });
  const cards = carousel.locator(".product-card");
  const combos = fixtureProducts.filter(product => product.isActive && product.productType === "COMBO")
    .sort((a,b) => a.sortOrder-b.sortOrder);
  await expect(cards).toHaveCount(combos.length);
  for (let i = 0; i < combos.length; i++) {
    await expect(cards.nth(i).getByRole("heading", {name: combos[i].name})).toBeVisible();
  }
  const rail = carousel.locator(".product-grid");
  expect(await rail.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect.poll(async () => rail.evaluate(element => element.scrollLeft), { timeout: 7200 }).toBeGreaterThan(4);
  await carousel.getByRole("button", { name: "Остановить автоматическую прокрутку комбо" }).click();
  await expect(carousel.getByRole("button", { name: "Включить автоматическую прокрутку комбо" })).toBeVisible();
  await page.waitForTimeout(450);
  const before = await rail.evaluate(element => element.scrollLeft);
  await page.waitForTimeout(4700);
  const after = await rail.evaluate(element => element.scrollLeft);
  expect(Math.abs(after-before)).toBeLessThan(3);
});

test("typing pizza updates results automatically and finds pizza category", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/search");
  await page.getByRole("textbox", { name: "Поиск по меню" }).fill("пицца");
  await expect(page).toHaveURL(/q=%D0%BF%D0%B8%D1%86%D1%86%D0%B0/i, { timeout: 10000 });
  await expect(page.locator(".search-results .product-card")).toHaveCount(1);
  await expect(page.locator(".search-results .product-card-open")).toBeVisible();
});

test("min/max somoni controls apply an exact price range and support reset", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/search?q=пицца");
  await page.getByRole("button", { name: "Открыть фильтры" }).click();
  await page.getByRole("spinbutton", { name: "От, сомони" }).fill("65");
  await page.getByRole("spinbutton", { name: "До, сомони" }).fill("75");
  await page.getByRole("button", { name: /Показать результаты/ }).click();
  await expect(page).toHaveURL(/min=6500/);
  await expect(page).toHaveURL(/max=7500/);
  await expect(page.locator(".search-results .product-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Открыть фильтры" }).click();
  await page.getByRole("button", { name: "Сбросить фильтры" }).click();
  await page.getByRole("button", { name: /Показать результаты/ }).click();
  await expect(page.locator(".search-results .product-card")).toHaveCount(1);
});

test("search categories are not truncated to the first three", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/search?q=бургер");
  const allCategoryLinks = page.locator(".search-result-top .filter-row a");
  await expect(allCategoryLinks).toHaveCount(8);
});


// The modal temporarily pauses autoplay, but closing it must restart even
// though focus is restored to the original combo card.
test("combo carousel resumes after closing a quick view, retaining manual pause", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Комбо DIYOR BURGER" });
  const rail = carousel.locator(".product-grid");
  await carousel.locator(".product-card-open").first().click();
  await expect(page.getByRole("dialog", { name: /Комбо/ })).toBeVisible();
  await rail.evaluate(element => element.scrollTo({ left: 0, behavior: "instant" }));
  await page.waitForTimeout(3100);
  expect(await rail.evaluate(element => element.scrollLeft)).toBeLessThan(4);
  await page.getByRole("button", { name: "Закрыть карточку товара" }).click();
  await expect(page.getByRole("dialog", { name: /Комбо/ })).toHaveCount(0);
  await expect.poll(async () => rail.evaluate(element => element.scrollLeft), { timeout: 6500 }).toBeGreaterThan(4);

  // Reopening the same card and closing with Escape also restarts autoplay.
  await carousel.locator(".product-card-open").first().click();
  await expect(page.getByRole("dialog", { name: /Комбо/ })).toBeVisible();
  await rail.evaluate(element => element.scrollTo({ left: 0, behavior: "instant" }));
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Комбо/ })).toHaveCount(0);
  await expect.poll(async () => rail.evaluate(element => element.scrollLeft), { timeout: 6500 }).toBeGreaterThan(4);

  // A deliberate press of the Pause control must still persist.
  await carousel.getByRole("button", { name: "Остановить автоматическую прокрутку комбо" }).click();
  await expect(carousel.getByRole("button", { name: "Включить автоматическую прокрутку комбо" })).toBeVisible();
  await rail.evaluate(element => element.scrollTo({ left: 0, behavior: "instant" }));
  await page.waitForTimeout(3100);
  expect(await rail.evaluate(element => element.scrollLeft)).toBeLessThan(4);
});
