// Easter egg discovery and the `eggs` progress command.

import { test, expect } from "./fixtures.mjs";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const discoveries = (terminal) =>
  terminal.output.getByText("¡Easter egg descubierto!");

test("eggs run from a link do not count", async ({ terminal }) => {
  await terminal.open("?cmd=sudo&cmd=42&cmd=eggs");
  await expect(terminal.output).toContainText("Easter eggs descubiertos: 0/8");
  await expect(discoveries(terminal)).toHaveCount(0);
  await expect(terminal.output).toContainText(
    /Nivel 1 · Novato:\s+\[\.\.\.\] 0\/3\s+\?\?\?/,
  );
});

test("discovering every egg", async ({ terminal }) => {
  test.setTimeout(120_000);
  await terminal.open();

  // Level 1.
  await terminal.run("sudo");
  await terminal.run("exit");
  await terminal.run("sudo"); // A repeated egg is not announced again.
  await terminal.run("su root");
  await terminal.run("x");
  await expect(discoveries(terminal)).toHaveCount(3);

  // The "konami" word is only a hint, not the egg.
  await terminal.run("konami");
  await expect(terminal.output).toContainText(
    "Algunos secretos requieren más que escribir.",
  );
  await expect(discoveries(terminal)).toHaveCount(3);

  // Level 2.
  await terminal.run("42");
  await terminal.run("cowsay");
  await terminal.run("cowsay");
  await terminal.run("rm -rf /");
  await terminal.idle(); // The animation prints a line every 0-2 s.
  await expect(terminal.output).toContainText("Es broma");
  await expect(discoveries(terminal)).toHaveCount(6);

  // Level 3: the Matrix animation and the Konami key sequence.
  await terminal.run("matrix");
  await expect(terminal.page.locator("canvas")).toBeVisible();
  await terminal.page.waitForTimeout(400); // The animation ignores the first 300 ms.
  await terminal.page.keyboard.press("Escape");
  await expect(terminal.page.locator("canvas")).toHaveCount(0);
  await terminal.idle();
  await terminal.page.locator("#cmd-input").focus();
  for (const key of KONAMI) await terminal.page.keyboard.press(key);
  await expect(terminal.output).toContainText("MODO HACKER ACTIVADO");
  await expect(discoveries(terminal)).toHaveCount(8);

  await terminal.run("eggs");
  await expect(terminal.output).toContainText("Easter eggs descubiertos: 8/8");
  await expect(terminal.output).toContainText(
    /Nivel 1 · Novato:\s+\[###\] 3\/3\s+sudo\s+exit\s+su root/,
  );
  await expect(terminal.output).toContainText("↑↑↓↓←→←→BA");
  await expect(terminal.output).toContainText("¡Los encontraste todos!");

  const stored = await terminal.page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("rs_eggs")),
  );
  expect(stored).toHaveLength(8);
});

test("progress follows the storage consent", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("sudo");
  await terminal.run("config accept");
  await expect(terminal.output).toContainText(
    "Almacenamiento persistente aceptado.",
  );
  const persisted = await terminal.page.evaluate(() =>
    localStorage.getItem("rs_eggs"),
  );
  expect(JSON.parse(persisted)).toEqual(["sudo"]);

  await terminal.open();
  await terminal.run("eggs");
  await expect(terminal.output).toContainText("Easter eggs descubiertos: 1/8");
});

test("man eggs", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("man eggs");
  await expect(terminal.output).toContainText("eggs - Progreso de easter eggs");
});
