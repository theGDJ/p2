import { chromium } from "playwright-core";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3000";
const routes = [
  "/",
  "/assistant",
  "/finder",
  "/standards",
  "/labs",
  "/certification",
  "/consumer",
  "/dashboard",
];
const viewports = [
  { label: "1440×900", width: 1440, height: 900 },
  { label: "390×844", width: 390, height: 844 },
];

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const results = [];
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(250);
      const measurement = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        viewport: window.innerHeight,
        path: window.location.pathname + window.location.search,
      }));
      results.push({ route, ...viewport, ...measurement, ratio: measurement.height / measurement.viewport });
    }
    await context.close();
  }
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser.close();
}
