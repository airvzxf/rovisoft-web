// Phone-sized viewport (Pixel 7): the prompt must stay usable.

import { test, expect } from "./fixtures.mjs";

test("a long command scrolls so the cursor stays visible", async ({
  terminal,
}) => {
  await terminal.open();
  const { page } = terminal;
  await page.locator("#cmd-input").focus();
  await page.keyboard.type("echo " + "abcdefghij".repeat(10));

  const wrapper = page.locator("#prompt-input-wrapper");
  const box = await wrapper.boundingBox();
  const cursor = await page.locator("#cursor").boundingBox();
  expect(cursor.x).toBeGreaterThanOrEqual(box.x - 1);
  expect(cursor.x + cursor.width).toBeLessThanOrEqual(box.x + box.width + 1);
  expect(await wrapper.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);

  await page.keyboard.press("Enter");
  expect(await wrapper.evaluate((el) => el.scrollLeft)).toBe(0);
});

test("the prompt input does not trigger iOS zoom", async ({ terminal }) => {
  await terminal.open();
  const fontSize = await terminal.page
    .locator("#cmd-input")
    .evaluate((el) => getComputedStyle(el).fontSize);
  expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);
});

test("the page never scrolls horizontally", async ({ terminal }) => {
  await terminal.open("?cmd=help&cmd=su%20airvzxf&cmd=airvzxf%20projects");
  await expect(terminal.output).toContainText("c2flowch");
  const overflow = await terminal.page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
