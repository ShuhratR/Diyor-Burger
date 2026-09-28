import { expect, test } from "@playwright/test";

const screens = [
  { name: "compact phone", width: 360, height: 640 },
  { name: "Android phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

for (const screen of screens) {
  test("admin entrance is clear and fits " + screen.name, async ({ page }) => {
    await page.setViewportSize({ width: screen.width, height: screen.height });
    const response = await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { name: "С возвращением!" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Вход в админ-панель" })).toBeVisible();
    await expect(page.getByLabel("Email администратора")).toBeVisible();
    await expect(page.getByLabel("Пароль", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Войти в админ-панель" })).toBeVisible();
    await expect(page.locator(".site-header")).toBeHidden();
    await expect(page.locator(".bottom-nav")).toBeHidden();

    const measurements = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      fullWidth: document.documentElement.scrollWidth,
    }));
    expect(measurements.fullWidth).toBeLessThanOrEqual(measurements.viewportWidth + 1);

    const email = await page.getByLabel("Email администратора").boundingBox();
    const password = await page.getByLabel("Пароль", { exact: true }).boundingBox();
    const login = await page.getByRole("button", { name: "Войти в админ-панель" }).boundingBox();
    expect(email!.height).toBeGreaterThanOrEqual(44);
    expect(password!.height).toBeGreaterThanOrEqual(44);
    expect(login!.height).toBeGreaterThanOrEqual(44);
  });
}

test("password visibility is explicitly controlled", async ({ page }) => {
  await page.goto("/admin/login");
  const password = page.getByLabel("Пароль", { exact: true });
  const toggle = page.getByRole("button", { name: "Показать пароль" });
  await expect(password).toHaveAttribute("type", "password");
  await toggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Скрыть пароль" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Скрыть пароль" }).click();
  await expect(password).toHaveAttribute("type", "password");
});

test("invalid input stays on form and shows a message without real credentials", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email администратора").fill("not-an-email");
  await page.getByLabel("Пароль", { exact: true }).fill("sample-value-only");
  await page.getByRole("button", { name: "Войти в админ-панель" }).click();
  expect(await page.getByLabel("Email администратора").evaluate(
    (el: HTMLInputElement) => el.validity.typeMismatch,
  )).toBe(true);
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("configured-data failure is visible without revealing credentials", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email администратора").fill("demo@example.invalid");
  await page.getByLabel("Пароль", { exact: true }).fill("example-only-not-real");
  await page.getByRole("button", { name: "Войти в админ-панель" }).click();
  await expect(page.getByRole("alert")).toContainText("Админ-панель пока не подключена");
  await expect(page).toHaveURL(/\/admin\/login/);
});
