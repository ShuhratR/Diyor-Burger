import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const root = process.cwd();
const baseUrl = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = path.join(root, "artifacts", "visual");
const referenceDir = path.join(root, "screens");
const cases = [
  { id: "home", route: "/", reference: "ChatGPT Image 20 сент. 2026 г., 14_12_49 (1).png" },
  { id: "menu", route: "/menu", reference: "ChatGPT Image 20 сент. 2026 г., 14_12_56 (6).png" },
  { id: "combos", route: "/combos", reference: "ChatGPT Image 20 сент. 2026 г., 14_12_57 (7).png" },
  { id: "favorites", route: "/favorites", reference: "ChatGPT Image 20 сент. 2026 г., 14_19_37 (2).png" },
  { id: "cart", route: "/cart", reference: "ChatGPT Image 20 сент. 2026 г., 14_15_06 (9).png" },
  { id: "checkout", route: "/checkout", reference: "ChatGPT Image 20 сент. 2026 г., 14_15_07 (10).png" },
  { id: "contacts", route: "/contacts", reference: "ChatGPT Image 20 сент. 2026 г., 14_19_38 (3).png" },
];

const viewport = { width: 390, height: 693 };
const deviceScaleFactor = 941 / 390;
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];

try {
  for (const item of cases) {
    const context = await browser.newContext({ viewport, deviceScaleFactor });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${item.route}`, { waitUntil: "networkidle" });
    const currentPath = path.join(outputDir, `${item.id}.png`);
    await page.screenshot({ path: currentPath, animations: "disabled" });
    const current = PNG.sync.read(await readFile(currentPath));
    const reference = PNG.sync.read(await readFile(path.join(referenceDir, item.reference)));
    const sameSize = current.width === reference.width && current.height === reference.height;
    let mismatchPixels = null;
    let mismatchPercent = null;
    if (sameSize) {
      const diff = new PNG({ width: current.width, height: current.height });
      mismatchPixels = pixelmatch(reference.data, current.data, diff.data, current.width, current.height, { threshold: 0.08, includeAA: true });
      mismatchPercent = Number(((mismatchPixels / (current.width * current.height)) * 100).toFixed(2));
      await writeFile(path.join(outputDir, `${item.id}.diff.png`), PNG.sync.write(diff));
    }
    report.push({ id: item.id, route: item.route, reference: item.reference, current: `${item.id}.png`, currentSize: `${current.width}x${current.height}`, referenceSize: `${reference.width}x${reference.height}`, sameSize, mismatchPixels, mismatchPercent });
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.table(report.map(({ id, route, sameSize, mismatchPercent }) => ({ id, route, sameSize, mismatchPercent: mismatchPercent ?? "size mismatch" })));
