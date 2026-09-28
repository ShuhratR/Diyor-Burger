import { expect, test } from "@playwright/test";

const routes = [
  { id: "home", path: "/", heading: null },
  { id: "menu", path: "/menu", heading: "Меню" },
  { id: "combos", path: "/combos", heading: "Все комбо" },
  { id: "search", path: "/search", heading: null },
  { id: "favorites", path: "/favorites", heading: null },
  { id: "cart", path: "/cart", heading: null },
  { id: "checkout", path: "/checkout", heading: null },
  { id: "contacts", path: "/contacts", heading: "Контакты" },
  { id: "admin-login", path: "/admin/login", heading: "Вход в админ-панель" },
] as const;

for (const route of routes) {
  test(`public/mobile: ${route.id} loads and renders`, async ({ page }, testInfo) => {
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response, `No HTTP response for ${route.path}`).not.toBeNull();
    expect(response!.status(), `${route.path} returned HTTP ${response!.status()}`).toBe(200);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    if (route.heading) {
      await expect(page.getByRole("heading", { name: route.heading, exact: true }).first()).toBeVisible();
    }
    const screenshot = testInfo.outputPath(`${route.id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });
    await testInfo.attach(`${route.id}-mobile`, { path: screenshot, contentType: "image/png" });
  });
}

test("admin area rejects a fresh unauthenticated browser", async ({ page }) => {
  const response = await page.goto("/admin", { waitUntil: "domcontentloaded" });
  expect(response).not.toBeNull();
  await expect(page).toHaveURL(/\/admin\/login(?:\?.*)?$/);
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test("catalog contains a viewable product without changing live data", async ({ page }) => {
  const response = await page.goto("/menu", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  const first = page.locator(".product-card").first();
  await expect(first, "No rendered product in production catalog").toBeVisible();
  await first.locator("button.product-card-open").click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('[role="dialog"] button[aria-label="Закрыть карточку товара"]')).toBeVisible();
});

test("checkout rejects malformed request without creating an order", async ({ request }) => {
  const response = await request.post("/api/checkout/prepare", {
    data: "{malformed",
    headers: { "content-type": "application/json" },
  });
  expect(response.status(), "Checkout API should be available and reject malformed JSON").toBe(400);
  const payload = await response.json();
  expect(payload).toMatchObject({ ok: false, code: "INVALID_CHECKOUT" });
});

test("anonymous checkout can read configuration and reject an unknown item", async ({ request }) => {
  // This is a syntactically valid, non-orderable request. It must never send WhatsApp.
  // HTTP 503 here reveals missing anonymous access or unavailable production data.
  const response = await request.post("/api/checkout/prepare", {
    data: {
      items: [{ productId: "00000000-0000-4000-8000-000000000001", quantity: 1 }],
      name: "QA",
      phone: "900000000",
      fulfillment: "pickup",
    },
  });
  expect(response.status(), "Anonymous checkout depends on readable settings, products and zones").toBe(400);
  const payload = await response.json();
  expect(payload).toMatchObject({ ok: false, code: "PRODUCT_NOT_FOUND" });
});
