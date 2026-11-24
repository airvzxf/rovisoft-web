// Input from links (?cmd=) and from the prompt must never become HTML or
// reach Object.prototype, and links must not change stored data.

import { test, expect } from "./fixtures.mjs";

const XSS_PAYLOADS = [
  "constructor <img/src/onerror=document.body.id='pwned'>",
  "theme edit <img/src/onerror=document.body.id='pwned'>",
  "echo <img/src/onerror=document.body.id='pwned'>",
  "alias <img/src/onerror=document.body.id='pwned'>",
];

for (const payload of XSS_PAYLOADS) {
  test(`?cmd= does not inject HTML: ${payload.split(" ")[0]}`, async ({
    terminal,
  }) => {
    await terminal.open(`?cmd=${encodeURIComponent(payload)}`);
    await expect(terminal.output.locator(".command-line").last()).toBeVisible();
    await expect(terminal.output.locator("img")).toHaveCount(0);
    expect(await terminal.page.evaluate(() => document.body.id)).toBe("");
  });
}

test("prototype member names are unknown commands", async ({ terminal }) => {
  await terminal.open();
  for (const name of ["constructor", "__proto__", "toString"]) {
    await terminal.run(name);
    await expect(terminal.output).toContainText(
      `comando no encontrado: ${name.toLowerCase()}`,
    );
  }
  await terminal.run("man constructor");
  await expect(terminal.output).toContainText(
    "No hay entrada de manual para 'constructor'",
  );
  await terminal.run("lang constructor");
  await expect(terminal.output).toContainText(
    "idioma desconocido 'constructor'",
  );
  await terminal.run("theme constructor");
  await expect(terminal.output).toContainText("theme: 'constructor' no existe");
  await terminal.run("su airvzxf");
  await terminal.run("airvzxf constructor");
  await expect(terminal.output).toContainText(
    "subcomando desconocido 'constructor'",
  );
  const stored = await terminal.page.evaluate(() => ({
    theme: sessionStorage.getItem("rs_theme"),
    lang: sessionStorage.getItem("rs_lang"),
  }));
  expect(stored.theme).not.toBe("constructor");
  expect(stored.lang).not.toBe("constructor");
});

test("links only run read-only commands", async ({ terminal }) => {
  await terminal.open(
    "?cmd=config%20accept&cmd=reset&cmd=alias%20x%3Dhelp&cmd=theme%20light&cmd=help",
  );
  for (const command of ["config", "reset", "alias", "theme"]) {
    await expect(terminal.output).toContainText(
      `${command}: no se ejecuta desde un enlace por seguridad`,
    );
  }
  await expect(terminal.output).toContainText("Muestra esta ayuda");
  const stored = await terminal.page.evaluate(() => ({
    consent: localStorage.getItem("rs_config_accepted"),
    theme: sessionStorage.getItem("rs_theme"),
  }));
  expect(stored.consent).toBeNull();
  expect(stored.theme).toBeNull();
});

test("an alias cannot smuggle a blocked command into a link", async ({
  terminal,
}) => {
  await terminal.open();
  await terminal.run("alias boom=reset");
  await terminal.page.goto("/?cmd=boom");
  await expect(terminal.output).toContainText(
    "reset: no se ejecuta desde un enlace por seguridad",
  );
});

test("the URL is cleaned after running link commands", async ({ terminal }) => {
  await terminal.open("?cmd=whoami");
  await expect(terminal.output).toContainText("guest");
  expect(new URL(terminal.page.url()).search).toBe("");
});
