// Shared helpers for the end-to-end tests.
//
// The `terminal` fixture opens the site, types commands and, when the test
// ends, fails if the page logged any console error, CSP violation or
// uncaught exception.

import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  terminal: async ({ page }, use) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

    const output = page.locator("#output-area");
    const input = page.locator("#cmd-input");

    await use({
      page,
      output,
      errors,
      // Opens the terminal (optionally with ?cmd= parameters) and waits
      // until it accepts input.
      async open(query = "") {
        await page.goto(`/${query}`);
        await expect(input).toBeEnabled();
      },
      // Types a command and presses Enter, like a visitor.
      async run(command) {
        await expect(input).toBeEnabled();
        await input.focus();
        await page.keyboard.type(command);
        await page.keyboard.press("Enter");
      },
      // Waits until the terminal accepts input again (after an animation).
      async idle(timeout = 60_000) {
        await expect(input).toBeEnabled({ timeout });
      },
    });

    expect(errors, "console errors, CSP violations or exceptions").toEqual([]);
  },
});

export { expect };

// Years since the owner's first job (August 2005), as the site computes it.
export function yearsOfExperience(now = new Date()) {
  return now.getFullYear() - 2005 - (now.getMonth() < 7 ? 1 : 0);
}
