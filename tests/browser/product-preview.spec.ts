import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "small mobile", width: 360, height: 640 },
  { name: "Android mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

async function openPreview(page: Page, route: string, name: string) {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response?.status(), route + " should load").toBe(200);
  await page.getByRole("button", { name: "Открыть " + name, exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name, exact: true })).toBeVisible();
  return dialog;
}

async function expectViewportOverlay(page: Page) {
  const bounds = await page.locator(".quick-view-layer").boundingBox();
  const dialog = await page.getByRole("dialog").boundingBox();
  expect(bounds).not.toBeNull();
  expect(dialog).not.toBeNull();
  expect(await page.evaluate(() => document.querySelector(".quick-view-layer")?.parentElement === document.body))
    .toBe(true);
  const viewport = page.viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.y).toBeGreaterThanOrEqual(-1);
  expect(bounds!.width).toBeGreaterThanOrEqual(viewport.width - 2);
  expect(bounds!.height).toBeGreaterThanOrEqual(viewport.height - 2);
  expect(dialog!.x).toBeGreaterThanOrEqual(-1);
  expect(dialog!.y).toBeGreaterThanOrEqual(-1);
  expect(dialog!.x + dialog!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(dialog!.y + dialog!.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(dialog!.width).toBeGreaterThan(viewport.width <= 390 ? 300 : 400);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
}

for (const viewport of viewports) {
  test.describe("product preview at " + viewport.name, () => {
    test.beforeEach(async ({ page }) => page.setViewportSize({ width: viewport.width, height: viewport.height }));

    test("combo is a complete viewport dialog with its ingredients and buy action", async ({ page }) => {
      const dialog = await openPreview(page, "/combos", "Комбо Чизбургер");
      await expectViewportOverlay(page);
      await expect(dialog.getByRole("heading", { name: "Что входит в комбо" })).toBeVisible();
      await expect(dialog.getByText("Картофель фри")).toBeVisible();
      await expect(dialog.getByText("Напиток 0.4")).toBeVisible();
      const content = dialog.locator(".quick-view-content");
      await content.evaluate(element => { element.scrollTop = element.scrollHeight; });
      await expect(dialog.getByRole("button", { name: /Добавить в корзину/ })).toBeVisible();
      const button = await dialog.getByRole("button", { name: /Добавить в корзину/ }).boundingBox();
      const box = await dialog.boundingBox();
      expect(button!.y + button!.height).toBeLessThanOrEqual(box!.y + box!.height + 2);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    });

    test("normal product is not clipped by product-card overflow", async ({ page }) => {
      const dialog = await openPreview(page, "/menu", "Гамбургер");
      await expectViewportOverlay(page);
      await expect(dialog.locator(".food-image, .food-placeholder")).toBeVisible();
      await expect(dialog.getByRole("button", { name: /Добавить в корзину/ })).toBeVisible();
      await expect(dialog.getByRole("button", { name: "Закрыть карточку товара" })).toBeFocused();
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
      await dialog.getByRole("button", { name: "Закрыть карточку товара" }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });

    test("pizza contains all size options and the purchase control", async ({ page }) => {
      const dialog = await openPreview(page, "/menu", "Пицца Пепперони");
      await expectViewportOverlay(page);
      await expect(dialog.getByRole("heading", { name: "Выберите размер" })).toBeVisible();
      await expect(dialog.getByRole("button", { name: /28 см/ })).toBeVisible();
      await dialog.getByRole("button", { name: /28 см/ }).click();
      await expect(dialog.getByRole("button", { name: /Добавить ·/ })).toBeEnabled();
      await dialog.locator(".quick-view-content").evaluate(element => { element.scrollTop = element.scrollHeight; });
      const purchase = await dialog.getByRole("button", { name: /Добавить ·/ }).boundingBox();
      const box = await dialog.boundingBox();
      expect(purchase!.y + purchase!.height).toBeLessThanOrEqual(box!.y + box!.height + 2);
    });
  });
}

test("the same preview works from a category, search results, and favorites", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let dialog = await openPreview(page, "/menu/burgers", "Гамбургер");
  await expectViewportOverlay(page);
  await page.keyboard.press("Escape");
  dialog = await openPreview(page, "/search?q=Гамбургер", "Гамбургер");
  await expectViewportOverlay(page);
  await page.keyboard.press("Escape");
  await page.goto("/menu");
  const burgerCard = page.getByRole("button", { name: "Открыть Гамбургер", exact: true }).locator("..");
  await burgerCard.getByRole("button", { name: "Добавить в избранное" }).click();
  dialog = await openPreview(page, "/favorites", "Гамбургер");
  await expectViewportOverlay(page);
});

test("backdrop tap closes the modal and restores the opener focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const opener = page.getByRole("button", { name: "Открыть Гамбургер", exact: true });
  await page.goto("/menu");
  await opener.click();
  await expectViewportOverlay(page);
  await page.locator(".quick-view-layer").click({ position: { x: 3, y: 3 } });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
});

for (const [name, route] of [
  ["Хот-дог", "/menu/hotdogs"],
  ["Ролл Буррито", "/menu/rolls"],
  ["Картофель фри", "/menu/sides"],
  ["Coca-Cola 0.4", "/menu/drinks"],
] as const) {
  test(name + " uses the same full-screen preview", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const dialog = await openPreview(page, route, name);
    await expectViewportOverlay(page);
    await expect(dialog.getByRole("button", { name: /Добавить в корзину/ })).toBeVisible();
  });
}
