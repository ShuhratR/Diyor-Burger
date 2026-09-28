import { expect, test } from "@playwright/test";

const email = process.env.QA_ADMIN_EMAIL;
const password = process.env.QA_ADMIN_PASSWORD;

// Runs only when both values are supplied as GitHub Actions repository secrets.
// Read-only: does not save, archive, restore or change restaurant records.
test("test administrator can log in and inspect every admin section", async ({ page }) => {
  expect(email, "Configure QA_ADMIN_EMAIL as a repository secret").toBeTruthy();
  expect(password, "Configure QA_ADMIN_PASSWORD as a repository secret").toBeTruthy();

  const response = await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await page.locator('input[name="email"]').fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.getByRole("button", { name: "Войти" }).click();

  await expect(page, "Test administrator was not authenticated").toHaveURL(/\/admin(?:\?.*)?$/);
  await expect(page.locator("body")).not.toContainText("У вас нет доступа к админ-панели.");

  const adminRoutes = [
    "/admin/products",
    "/admin/combos",
    "/admin/categories",
    "/admin/archive",
    "/admin/delivery",
    "/admin/banners",
    "/admin/settings",
  ];
  for (const route of adminRoutes) {
    const pageResponse = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(pageResponse?.status(), `Failed HTTP status for ${route}`).toBe(200);
    await expect(page, `Unexpected login redirect for ${route}`).not.toHaveURL(/\/admin\/login/);
    await expect(page.locator("body"), `Backend unavailable on ${route}`).not.toContainText("Данные недоступны");
    await expect(page.locator("body"), `Backend unavailable on ${route}`).not.toContainText("Данные временно недоступны");
  }
});

test("test administrator can open product, combo and delivery editors without saving", async ({ page }) => {
  expect(email, "Configure QA_ADMIN_EMAIL as a repository secret").toBeTruthy();
  expect(password, "Configure QA_ADMIN_PASSWORD as a repository secret").toBeTruthy();

  await page.goto("/admin/login");
  await page.locator('input[name="email"]').fill(email!);
  await page.locator('input[name="password"]').fill(password!);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/admin(?:\?.*)?$/);

  await page.goto("/admin/products");
  await page.getByRole("button", { name: /Добавить товар/ }).click();
  const product = page.locator('[role="dialog"]');
  await expect(product.locator('input[name="name"]')).toBeVisible();
  await expect(product.locator('select[name="productType"]')).toBeVisible();
  await expect(product.locator('input[name="oldPrice"]')).toBeVisible();
  await product.getByRole("button", { name: "Закрыть" }).click();

  await page.goto("/admin/combos");
  await page.getByRole("button", { name: /Добавить комбо/ }).click();
  const combo = page.locator('[role="dialog"]');
  await expect(combo.locator('input[name="name"]')).toBeVisible();
  await expect(combo.locator('input[name="price"]')).toBeVisible();
  await combo.getByRole("button", { name: "Закрыть" }).click();

  await page.goto("/admin/delivery");
  await page.getByRole("button", { name: /Добавить зону/ }).click();
  const zone = page.locator('[role="dialog"]');
  await expect(zone.locator('input[name="name"]')).toBeVisible();
  await expect(zone.locator('input[name="fee"]')).toBeVisible();
  await expect(zone.locator('input[name="threshold"]')).toBeVisible();
  await zone.getByRole("button", { name: "Закрыть" }).click();

  // Explicitly no form submission, upload or mutation in this smoke test.
});
