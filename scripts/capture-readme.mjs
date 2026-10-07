import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.screenshot({ path: "docs/home.png", fullPage: false });
  await page.goto("http://127.0.0.1:3000/assistant?mode=identify&q=pressure%20cooker", { waitUntil: "networkidle" });
  await page.locator('section[aria-label="Product verdict"]').waitFor();
  await page.screenshot({ path: "docs/product-result.png", fullPage: false });
} finally {
  await browser.close();
}
