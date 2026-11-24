// Generates src/og-image.png, the 1200x630 link preview image, from a
// screenshot of the real terminal (welcome banner, dark theme).
//
// Usage (the site must be running, e.g. `npm run serve` in another shell):
//   npm run og-image
//   BASE_URL=http://127.0.0.1:8080 CHROMIUM_PATH=/usr/bin/chromium npm run og-image

import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8788";
const OUTPUT = fileURLToPath(new URL("../src/og-image.png", import.meta.url));

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {},
);
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });
  await page.goto(`${BASE_URL}/`);
  await page.locator("#cmd-input").waitFor({ state: "attached" });
  await page.waitForFunction(
    () => !document.getElementById("cmd-input").disabled,
  );
  await page.evaluate(() => document.fonts.ready);
  // Zoom in so the banner fills the preview, and use a solid cursor: the
  // blink animation would make the image random.
  await page.addStyleTag({
    content: `
      :root { --font-size: 21px; }
      .ascii-banner { font-size: 24px; line-height: 1.05; margin: 12px 0 30px; }
      .output-line { word-break: normal; }
      .cursor { animation: none; }
    `,
  });
  await page.screenshot({ path: OUTPUT, type: "png" });
  console.log(`Wrote ${OUTPUT}`);
} finally {
  await browser.close();
}
