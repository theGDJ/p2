import { chromium } from "playwright-core";

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://127.0.0.1:3000");
  await page.getByRole("button", { name: "Identify a product" }).click();
  await page.getByPlaceholder("PVC insulated house wiring cable").fill("pressure cooker");
  await page.getByRole("button", { name: "Identify", exact: true }).click();
  await page.locator('section[aria-label="Product verdict"]').waitFor();
  assert((await page.textContent("body")).includes("Domestic pressure cookers"), "home-to-product result failed");

  await page.goto("http://127.0.0.1:3000/finder", { waitUntil: "networkidle" });
  assert(page.url().includes("/assistant?mode=identify"), "/finder redirect failed");

  await page.goto("http://127.0.0.1:3000/certification?scheme=hallmark#documents", { waitUntil: "networkidle" });
  await page.getByRole("dialog").waitFor();
  assert((await page.getByRole("dialog").textContent()).includes("Hallmarking"), "hallmark document deep link failed");
  await page.getByRole("button", { name: "Close" }).click();
  const tabs = page.locator('[aria-label="Certification steps"] [role="tab"]');
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  assert((await tabs.nth(1).getAttribute("aria-selected")) === "true", "stepper keyboard navigation failed");

  await page.goto("http://127.0.0.1:3000/labs", { waitUntil: "networkidle" });
  const before = await page.locator("tbody tr").count();
  await page.getByRole("button", { name: /Show 12 more/ }).click();
  const after = await page.locator("tbody tr").count();
  assert(before === 12 && after === 24, `labs pagination failed (${before} -> ${after})`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://127.0.0.1:3000/assistant?q=%E0%A4%B9%E0%A5%87%E0%A4%B2%E0%A4%AE%E0%A5%87%E0%A4%9F%20%E0%A4%AA%E0%A4%B0%20%E0%A4%95%E0%A5%8C%E0%A4%A8-%E0%A4%B8%E0%A4%BE%20%E0%A4%AE%E0%A4%BE%E0%A4%A8%E0%A4%95%20%E0%A4%B2%E0%A4%BE%E0%A4%97%E0%A5%82%20%E0%A4%B9%E0%A5%88%3F", { waitUntil: "networkidle" });
  await mobile.getByRole("heading", { name: "हेलमेट पर कौन-सा मानक लागू है?" }).waitFor({ timeout: 30000 });
  await mobile.locator("article").first().waitFor({ timeout: 30000 });
  assert((await mobile.textContent("body")).includes("IS 4151"), "Hindi query did not return the helmet standard");
  await mobile.close();

  process.stdout.write("home → result: pass\nHindi query: pass\n/finder redirect: pass\ncertification deep link: pass\nstepper keyboard navigation: pass\nlabs pagination: pass\n");
} finally {
  await browser.close();
}
