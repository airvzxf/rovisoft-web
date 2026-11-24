// The owner's portfolio (`airvzxf` subcommands) in both languages.

import { test, expect, yearsOfExperience } from "./fixtures.mjs";

const PROJECTS = {
  c2flowch: "https://github.com/airvzxf/c2flowch",
  telora: "https://github.com/airvzxf/telora",
  bose_connect_linux: "https://github.com/airvzxf/bose-connect-app-linux",
  ftp_deployment_action: "https://github.com/airvzxf/ftp-deployment-action",
  cache_anything_new_action:
    "https://github.com/airvzxf/cache-anything-new-action",
  assembly_from_the_ground_up:
    "https://github.com/airvzxf/assembly-from-the-ground-up",
  fibonacci_benchmark:
    "https://github.com/airvzxf/assembly/tree/main/linux/benchmark/fibonacci",
  aur_packages: "https://aur.archlinux.org/packages/duc",
};

test("airvzxf requires logging in", async ({ terminal }) => {
  await terminal.open();
  await terminal.run("airvzxf about");
  await expect(terminal.output).toContainText("airvzxf: permiso denegado.");
});

test("projects: every project has its link and no stale star counts", async ({
  terminal,
}) => {
  await terminal.open("?cmd=su%20airvzxf;airvzxf%20projects");
  for (const [name, url] of Object.entries(PROJECTS)) {
    await expect(terminal.output).toContainText(name);
    await expect(
      terminal.output.locator(`a[href="${url}"][rel="noopener"]`),
    ).toHaveCount(1);
  }
  await expect(terminal.output).not.toContainText("★");
});

test("about, skills and research (Spanish)", async ({ terminal }) => {
  const years = yearsOfExperience();
  await terminal.open("?cmd=su%20airvzxf");
  await terminal.run("airvzxf about");
  await expect(terminal.output).toContainText(
    `Senior Software Engineer con más de ${years} años de experiencia`,
  );
  await expect(terminal.output).toContainText("Applied AI Engineer");
  await expect(terminal.output).toContainText("Guadalajara, Jalisco, México");

  await terminal.run("airvzxf skills");
  await expect(terminal.output).toContainText(
    /INTELIGENCIA ARTIFICIAL:[\s\S]*RAG:[\s\S]*Evaluación:/,
  );
  await expect(terminal.output).toContainText(
    /DOMINIOS:\s+Arquitectura de sistemas/,
  );

  await terminal.run("airvzxf research");
  await expect(terminal.output).toContainText(/2024-12-02[^\n]*MCP/);
  await expect(terminal.output).not.toContainText(
    /formic|ai-llm-rust-expert|Gemma 4|DeepSeek V4|Specialization/,
  );

  await terminal.run("man airvzxf");
  await expect(terminal.output).toContainText(
    `de ${years} años de experiencia`,
  );
});

test("about, skills and research (English)", async ({ terminal }) => {
  const years = yearsOfExperience();
  await terminal.open("?cmd=lang%20en");
  await expect(terminal.output).toContainText("Language changed to 'en");
  await terminal.run("su airvzxf");
  await terminal.run("airvzxf about");
  await expect(terminal.output).toContainText(
    `Senior Software Engineer with over ${years} years of experience`,
  );
  await terminal.run("airvzxf skills");
  await expect(terminal.output).toContainText("ARTIFICIAL INTELLIGENCE:");
  await expect(terminal.output).toContainText("Applied AI: RAG");
  await terminal.run("airvzxf research");
  await expect(terminal.output).toContainText("Comparison of AI labs");
});
