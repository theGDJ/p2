import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const routes = ["/", "/assistant", "/assistant?mode=identify&q=pressure%20cooker", "/standards", "/labs", "/certification", "/consumer", "/dashboard"];
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
let failed = false;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:3000${route}`, { waitUntil: "networkidle" });
    if (route.includes("pressure")) await page.locator('section[aria-label="Product verdict"]').waitFor();
    await page.addScriptTag({ path: axePath });
    const result = await page.evaluate(async () => await globalThis.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
    const violations = result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
    if (violations.length) failed = true;
    process.stdout.write(`${route}: ${violations.length ? JSON.stringify(violations) : "0 violations"}\n`);
  }
} finally {
  await browser.close();
}
if (failed) process.exitCode = 1;
