// Core terminal behaviour: welcome screen, commands, history, aliases,
// languages and the su root Easter egg.

import { test, expect } from "./fixtures.mjs";

const bannerLines = (page) =>
  page.locator(".ascii-banner").evaluate((el) => el.textContent.split("\n"));

test("the inline banner matches the banner drawn by main.js", async ({
  terminal,
}) => {
  // First paint: the inline script in index.html draws the banner.
  await terminal.open();
  const inline = await bannerLines(terminal.page);

  // An unknown stored language makes main.js draw the welcome screen again
  // with its own copy of the banner (and must fall back to Spanish).
  await terminal.page.evaluate(() => sessionStorage.setItem("rs_lang", "xx"));
  await terminal.open();
  await expect(terminal.output).toContainText("Bienvenido a RoviSoft.net");
  // The inline script marks the welcome as "xx"; main.js redraws it as "es".
  await expect(terminal.page.locator("#welcome-message")).toHaveAttribute(
    "data-lang",
    "es",
  );
  const rendered = await bannerLines(terminal.page);

  // Comparing whole lines (trailing spaces included) catches a letter
  // column shifted in either copy, as happened on line 2.
  expect(inline).toHaveLength(8);
  expect(rendered).toEqual(inline);
});

test("help lists every command", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("help");
  await expect(terminal.output).toContainText("Progreso de easter eggs");
  for (const command of [
    "help",
    "clear",
    "whoami",
    "users",
    "su",
    "airvzxf",
    "neofetch",
    "date",
    "echo",
    "alias",
    "unalias",
    "theme",
    "lang",
    "config",
    "reboot",
    "reset",
    "version",
    "license",
    "history",
    "man",
    "eggs",
  ]) {
    // toContainText collapses line breaks, so match the rendered lines.
    expect(await terminal.output.innerText()).toMatch(
      new RegExp(`^\\s*${command}\\b`, "m"),
    );
  }
});

test("su root always fails and gives a hint", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("su root");
  await expect(terminal.page.locator("#prompt-user")).toHaveText("Contraseña:");
  await terminal.run("secreto");
  await expect(terminal.output).toContainText("su: Autenticación fallida.");
  await expect(terminal.output).toContainText(
    "la contraseña de root no es pública",
  );
  await expect(terminal.page.locator("#prompt-user")).toHaveText("guest");
});

test("aliases are case-insensitive and validated", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("alias LL=whoami");
  await terminal.run("LL");
  await expect(terminal.output).toContainText("→ whoami");
  await terminal.run("alias foo bar=help");
  await expect(terminal.output).toContainText("nombre inválido 'foo bar'");
  await terminal.run("alias matrix=help");
  await expect(terminal.output).toContainText(
    "'matrix' es un comando existente",
  );
  await terminal.run("unalias ll");
  await terminal.run("alias ll");
  await expect(terminal.output).toContainText("alias: ll: no definido.");
});

test("history expansion", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("echo hola");
  await terminal.run("!!");
  await expect(terminal.output.getByText("hola")).toHaveCount(2);
  await terminal.run("!999");
  await expect(terminal.output).toContainText("!999: evento no encontrado");
});

test("neofetch shows the real storage usage", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("neofetch");
  await expect(terminal.output).toContainText(
    /Storage:\s+[\d.]+ (B|KiB) \/ 5\.0 MiB \(sesión\)/,
  );
});

test("man pages", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("man");
  await expect(terminal.output).toContainText("Páginas de manual disponibles:");
  await terminal.run("man man");
  await expect(terminal.output).toContainText("VÉASE TAMBIÉN");
  await terminal.run("man nada");
  await expect(terminal.output).toContainText(
    "No hay entrada de manual para 'nada'",
  );
});

test("switching to English loads the translation under the CSP", async ({
  terminal,
}) => {
  await terminal.open();
  await terminal.run("lang en");
  await expect(terminal.output).toContainText("Cargando English...");
  await expect(terminal.output).toContainText("Language changed to 'en");
  await expect(terminal.page.locator("html")).toHaveAttribute("lang", "en");
  await terminal.run("su root");
  await terminal.run("x");
  await expect(terminal.output).toContainText(
    "the root password is not public",
  );
  await terminal.run("!999");
  await expect(terminal.output).toContainText("!999: event not found");
});

test("themes", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("theme light");
  await expect(terminal.page.locator("html")).toHaveAttribute(
    "data-theme",
    "light",
  );
  await terminal.run("theme create mio --base=dark --green=#ff00ff");
  await terminal.run("theme mio");
  const green = await terminal.page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--green")
      .trim(),
  );
  expect(green).toBe("#ff00ff");
});
