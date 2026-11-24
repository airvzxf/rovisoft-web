// What Cloudflare Pages serves: headers, the 404 page and the files for
// crawlers and link previews.

import { test, expect } from "@playwright/test";

test("security headers", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  const headers = res.headers();
  const csp = headers["content-security-policy"];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toMatch(/script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+;/);
  expect(csp).not.toContain("unsafe-eval");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
});

test("unknown paths get the 404 page", async ({ page }) => {
  const consoleErrors = [];
  const failedResources = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("response", (res) => {
    if (res.status() >= 400 && res.request().resourceType() !== "document") {
      failedResources.push(`${res.status()} ${res.url()}`);
    }
  });

  const res = await page.goto("/no-existe/aqui");
  expect(res.status()).toBe(404);
  await expect(page.locator("body")).toContainText("No such file or directory");
  await expect(page.locator('a[href="/"]')).toBeVisible();

  // The browser logs the 404 of the page itself; anything else (a missing
  // font, a CSP violation) is a real error.
  expect(failedResources).toEqual([]);
  expect(
    consoleErrors.filter(
      (text) =>
        !/^Failed to load resource: the server responded with a status of 404/.test(
          text,
        ),
    ),
  ).toEqual([]);
  expect(consoleErrors.length).toBeLessThanOrEqual(1);
});

test("deployment files are not published", async ({ request }) => {
  for (const path of ["/wrangler.jsonc", "/_headers", "/package.json"]) {
    const res = await request.get(path);
    expect(res.status(), path).not.toBe(200);
  }
});

test("robots.txt and sitemap.xml", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(
    "Sitemap: https://rovisoft.net/sitemap.xml",
  );
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("<loc>https://rovisoft.net/</loc>");
});

test("link preview metadata", async ({ page, request }) => {
  await page.goto("/");
  const meta = (selector) =>
    page.locator(selector).first().getAttribute("content");
  // ?v= changes with every release so previews fetch the new image;
  // scripts/check-version.py checks its value.
  expect(await meta('meta[property="og:image"]')).toMatch(
    /^https:\/\/rovisoft\.net\/og-image\.png\?v=\d+\.\d+\.\d+$/,
  );
  const title = await meta('meta[property="og:title"]');
  const description = await meta('meta[property="og:description"]');
  expect(title.length).toBeGreaterThanOrEqual(60);
  expect(title.length).toBeLessThanOrEqual(90);
  expect(description.length).toBeGreaterThanOrEqual(155);
  expect(description.length).toBeLessThanOrEqual(200);
  expect(await meta('meta[property="og:image:width"]')).toBe("1200");
  expect(await meta('meta[property="og:image:height"]')).toBe("630");
  expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rovisoft.net/",
  );

  const image = await request.get("/og-image.png");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
  const png = await image.body();
  // PNG header: width and height are big-endian at bytes 16 and 20.
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});
