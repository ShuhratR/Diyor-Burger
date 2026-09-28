import { expect, test, type Page } from "@playwright/test";

async function checkLiveModal(page: Page) {
  const modal = page.getByRole("dialog");
  await expect(modal).toHaveAttribute("aria-modal", "true");
  await expect(modal.locator(".quick-view-content")).toBeVisible();
  await expect(modal.locator(".food-image, .food-placeholder")).toBeVisible();
  const measure = await page.evaluate(() => {
    const backdrop = document.querySelector<HTMLElement>(".quick-view-layer");
    const dialog = backdrop?.querySelector<HTMLElement>(".quick-view-modal");
    const rect = dialog?.getBoundingClientRect();
    return {
      portaled: backdrop?.parentElement === document.body,
      x: rect?.x ?? -100,
      y: rect?.y ?? -100,
      right: rect?.right ?? 99999,
      bottom: rect?.bottom ?? 99999,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      locked: document.body.style.overflow === "hidden",
    };
  });
  expect(measure.portaled).toBe(true);
  expect(measure.locked).toBe(true);
  expect(measure.x).toBeGreaterThanOrEqual(-1);
  expect(measure.y).toBeGreaterThanOrEqual(-1);
  expect(measure.right).toBeLessThanOrEqual(measure.viewportWidth + 1);
  expect(measure.bottom).toBeLessThanOrEqual(measure.viewportHeight + 1);
  await modal.locator(".quick-view-content").evaluate(node => { node.scrollTop = node.scrollHeight; });
  await expect(modal.locator(".purchase-button, .variant-selector").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("real combo opens a complete, unclipped client preview", async ({ page }) => {
  const response = await page.goto("/combos", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  const card = page.locator(".combo-reference-grid .product-card-open").first();
  await expect(card, "No publicly visible combo to check").toBeVisible();
  await card.click();
  await expect(page.getByRole("dialog")).toHaveClass(/quick-view-combo/);
  await checkLiveModal(page);
});

test("public menu previews work in every populated category", async ({ page }) => {
  const response = await page.goto("/menu", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  const links = await page.locator('.category-strip a[href^="/menu/"]')
    .evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute("href")).filter(Boolean))] as string[]);
  expect(links.length).toBeGreaterThanOrEqual(4);
  let populated = 0;
  for (const href of links) {
    const answer = await page.goto(href, { waitUntil: "domcontentloaded" });
    expect(answer?.status(), "Category " + href).toBe(200);
    const card = page.locator(".product-card-open").first();
    if (await card.count() === 0) continue;
    populated++;
    await card.click();
    await checkLiveModal(page);
  }
  expect(populated, "Too few real categories had testable products").toBeGreaterThanOrEqual(3);
});
