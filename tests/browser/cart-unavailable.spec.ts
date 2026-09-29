import { expect, test } from "@playwright/test";

const oldCart = {
  version: 1,
  items: [
    { productId: "archived-combo", quantity: 1, productName: "Комбо №6" },
    { productId: "hamburger", quantity: 2, productName: "Гамбургер" },
    { productId: "pepperoni", variantId: "archived-size", quantity: 1, productName: "Пицца Пепперони", variantName: "36 см" },
  ],
};
test.beforeEach(async ({ page }) => {
  await page.addInitScript(items => { localStorage.setItem("diyor-cart", JSON.stringify(items)); }, oldCart);
});
test("mobile checkout names invalid items and removes only selected lines", async ({ page }) => {
  await page.goto("/checkout");
  const modal = page.getByRole("dialog", { name: "Некоторые блюда больше недоступны" });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText("Комбо №6");
  await expect(modal).toContainText("Пицца Пепперони · 36 см");
  await modal.getByRole("button", { name: "Удалить Комбо №6" }).click();
  await expect(modal).not.toContainText("Комбо №6");
  await modal.getByRole("button", { name: "Удалить все недоступные" }).click();
  await expect(modal).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Оформить и открыть WhatsApp" })).toBeEnabled();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem("diyor-cart") || "{}").items))
    .toEqual([{ productId: "hamburger", quantity: 2, productName: "Гамбургер" }]);
});
test("resolving a stale cart preserves customer input", async ({ page }) => {
  await page.goto("/checkout");
  await page.getByRole("button", { name: "Закрыть предупреждение" }).click();
  await page.getByLabel("Имя", { exact: true }).fill("Суҳроб");
  await page.getByLabel("Телефон", { exact: true }).fill("901234567");
  await page.getByRole("button", { name: "Посмотреть и удалить" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Удалить все недоступные" }).click();
  await expect(page.getByLabel("Имя", { exact: true })).toHaveValue("Суҳроб");
  await expect(page.getByLabel("Телефон", { exact: true })).toHaveValue("901234567");
});
test("invalid cart returns all unavailable IDs and no order", async ({ request }) => {
  const response = await request.post("/api/checkout/prepare", {
    data: { ...oldCart, name: "Тест", phone: "901234567", fulfillment: "pickup" },
  });
  expect(response.status()).toBe(400);
  const data = await response.json();
  expect(data.ok).toBe(false);
  expect(data.unavailableItems).toHaveLength(2);
  expect(data.unavailableItems.map((item: {productId: string}) => item.productId))
    .toEqual(["archived-combo", "pepperoni"]);
  expect(data.summary).toBeUndefined();
});
