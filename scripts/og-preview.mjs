// Shows how a link to the site would look when shared, without sharing it.
//
// WhatsApp, Facebook, X and LinkedIn cache the first preview they build
// for a URL, so testing a change there is slow. This script reads the page
// the way their crawlers do (plain HTML, no JavaScript), checks the Open
// Graph and Twitter tags, and draws approximate cards for each network
// into test-results/og-preview.png (and .html).
//
// Usage:
//   npm run serve                                  # in another shell
//   npm run og-preview                             # local site
//   npm run og-preview -- https://rovisoft.net/    # production or a preview URL
//   CHROMIUM_PATH=/usr/bin/chromium npm run og-preview
//
// og:image is an absolute https://rovisoft.net/ URL. When the page is read
// from another origin (localhost or a preview deployment), the image is
// loaded from that origin instead, so the local og-image.png is the one
// shown and checked.

import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const target = new URL(
  process.argv[2] || process.env.BASE_URL || "http://127.0.0.1:8788/",
);
const OUT_DIR = fileURLToPath(new URL("../test-results/", import.meta.url));

const problems = [];
const warnings = [];

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Every <meta property|name="..." content="..."> in the page, in order.
function readMeta(html) {
  const meta = {};
  for (const tag of html.match(/<meta\b[^>]*>/gis) || []) {
    const key = /\b(?:property|name)\s*=\s*"([^"]+)"/i.exec(tag);
    const content = /\bcontent\s*=\s*"([^"]*)"/i.exec(tag);
    if (key && content && !(key[1] in meta)) {
      meta[key[1]] = decodeEntities(content[1].replace(/\s+/g, " ").trim());
    }
  }
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  meta["<title>"] = title ? decodeEntities(title[1].trim()) : "";
  return meta;
}

function pngSize(buf) {
  const sig = "89504e470d0a1a0a";
  if (buf.length < 24 || buf.subarray(0, 8).toString("hex") !== sig) {
    return null;
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const res = await fetch(target, {
  headers: { "user-agent": "facebookexternalhit/1.1" },
  redirect: "manual",
});
if (res.status !== 200) {
  console.error(`${target} answered ${res.status}; crawlers need a 200.`);
  process.exit(1);
}
const meta = readMeta(await res.text());

for (const key of ["og:title", "og:description", "og:image", "og:url"]) {
  if (!meta[key]) problems.push(`missing ${key}`);
}
if (!meta["twitter:card"]) warnings.push("missing twitter:card");

const title = meta["og:title"] || meta["<title>"];
const description = meta["og:description"] || meta.description || "";
if (title.length > 60) {
  warnings.push(`og:title is ${title.length} chars; cards cut it near 60`);
}
if (description.length > 160) {
  warnings.push(
    `og:description is ${description.length} chars; cards cut it near 160`,
  );
}

let imageData = "";
let imageNote = "";
if (meta["og:image"]) {
  let imageUrl = new URL(meta["og:image"], target);
  if (imageUrl.protocol !== "https:") {
    problems.push("og:image must be an absolute https:// URL");
  }
  const canonical = meta["og:url"] ? new URL(meta["og:url"]).origin : "";
  if (imageUrl.origin === canonical && target.origin !== canonical) {
    imageUrl = new URL(imageUrl.pathname, target);
    imageNote = ` (read from ${target.origin} instead of ${canonical})`;
  }
  const img = await fetch(imageUrl);
  const type = img.headers.get("content-type") || "";
  const buf = Buffer.from(await img.arrayBuffer());
  if (img.status !== 200) {
    problems.push(`og:image ${imageUrl} answered ${img.status}`);
  } else if (!type.startsWith("image/")) {
    problems.push(`og:image is served as "${type}", not an image`);
  } else {
    imageData = `data:${type};base64,${buf.toString("base64")}`;
    const kb = Math.round(buf.length / 1024);
    // WhatsApp drops images above roughly 600 KB and is unreliable above
    // 300 KB; Facebook accepts up to 8 MB.
    if (kb > 600) problems.push(`og:image is ${kb} KB; WhatsApp skips it`);
    else if (kb > 300) warnings.push(`og:image is ${kb} KB; keep it < 300 KB`);
    const size = pngSize(buf);
    if (size) {
      const w = Number(meta["og:image:width"]);
      const h = Number(meta["og:image:height"]);
      if (w && h && (w !== size.width || h !== size.height)) {
        problems.push(
          `og:image is ${size.width}x${size.height} but the tags say ${w}x${h}`,
        );
      }
      if (size.width < 600 || size.height < 315) {
        warnings.push(
          `og:image is ${size.width}x${size.height}; large cards need 1200x630`,
        );
      }
      imageNote = `${size.width}x${size.height}, ${kb} KB${imageNote}`;
    } else {
      imageNote = `${kb} KB${imageNote}`;
    }
  }
}

const domain = new URL(meta["og:url"] || target).hostname;
const alt = meta["og:image:alt"] || "";
const img = (cls) =>
  imageData
    ? `<img class="${cls}" src="${imageData}" alt="${escapeHtml(alt)}">`
    : `<div class="${cls} noimg">no image</div>`;
const t = escapeHtml(title);
const d = escapeHtml(description);
const host = escapeHtml(domain);

const html = `<!doctype html><meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; background: #e9edef; width: 1100px;
    font: 14px/1.35 system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  h2 { font-size: 13px; margin: 0 0 8px; color: #54656f; text-transform: uppercase; letter-spacing: .05em; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  .clip1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
  .clip2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .noimg { display: grid; place-items: center; background: #ccc; color: #555; aspect-ratio: 1.91; }
  img { display: block; width: 100%; aspect-ratio: 1.91; object-fit: cover; }

  .wa { background: #efeae2; padding: 16px; border-radius: 8px; }
  .wa .bubble { margin-left: auto; width: 360px; background: #d9fdd3; border-radius: 8px; padding: 3px; box-shadow: 0 1px .5px rgba(0,0,0,.13); }
  .wa .card { background: #d1f4cc; border-radius: 6px; overflow: hidden; }
  .wa .txt { padding: 6px 10px 8px; }
  .wa .ti { font-weight: 600; color: #111b21; }
  .wa .de { color: #667781; font-size: 13px; }
  .wa .do { color: #667781; font-size: 12px; margin-top: 2px; }
  .wa .msg { padding: 6px 7px 2px; color: #027eb5; font-size: 14px; }
  .wa .time { text-align: right; color: #667781; font-size: 11px; padding: 0 7px 3px; }

  .fb { background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #dadde1; width: 500px; }
  .fb .txt { background: #f0f2f5; padding: 10px 12px; }
  .fb .do { color: #65676b; font-size: 12px; text-transform: uppercase; }
  .fb .ti { font-weight: 600; font-size: 16px; color: #050505; margin: 2px 0; }
  .fb .de { color: #65676b; font-size: 14px; }

  .x { width: 500px; }
  .x .wrap { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid #cfd9de; }
  .x .over { position: absolute; left: 12px; bottom: 12px; background: rgba(0,0,0,.77); color: #fff; font-size: 13px; padding: 0 6px; border-radius: 4px; max-width: 90%; }
  .x .from { color: #536471; font-size: 13px; margin-top: 4px; }

  .li { width: 500px; background: #fff; border: 1px solid #e0dfdc; border-radius: 8px; overflow: hidden; }
  .li .txt { padding: 10px 12px; background: #eef3f8; }
  .li .ti { font-weight: 600; color: rgba(0,0,0,.9); }
  .li .do { color: rgba(0,0,0,.6); font-size: 12px; margin-top: 2px; }

  .report { margin-top: 28px; background: #fff; border-radius: 8px; padding: 14px 16px; font: 13px/1.5 ui-monospace, monospace; white-space: pre-wrap; }
</style>
<div class="grid">
  <section><h2>WhatsApp</h2><div class="wa"><div class="bubble">
    <div class="card">${img("")}<div class="txt">
      <div class="ti clip2">${t}</div><div class="de clip2">${d}</div><div class="do">${host}</div>
    </div></div>
    <div class="msg">${escapeHtml(meta["og:url"] || target.href)}</div><div class="time">12:00 ✓✓</div>
  </div></div></section>

  <section><h2>Facebook / Messenger</h2><div class="fb">${img("")}<div class="txt">
    <div class="do">${host}</div><div class="ti clip2">${t}</div><div class="de clip1">${d}</div>
  </div></div></section>

  <section><h2>X (${escapeHtml(meta["twitter:card"] || "no twitter:card")})</h2><div class="x">
    <div class="wrap">${img("")}<div class="over clip1">${escapeHtml(meta["twitter:title"] || title)}</div></div>
    <div class="from">From ${host}</div>
  </div></section>

  <section><h2>LinkedIn</h2><div class="li">${img("")}<div class="txt">
    <div class="ti clip2">${t}</div><div class="do">${host}</div>
  </div></div></section>
</div>
<div class="report">${escapeHtml(
  [
    `Page:  ${target.href}`,
    `Image: ${imageNote || "none"}`,
    ...problems.map((p) => `ERROR: ${p}`),
    ...warnings.map((w) => `WARN:  ${w}`),
    problems.length + warnings.length ? "" : "All checks passed.",
    "",
    "Cards are approximations; each network changes its layout over time.",
  ].join("\n"),
)}</div>`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(`${OUT_DIR}og-preview.html`, html);

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {},
);
try {
  const page = await browser.newPage({
    viewport: { width: 1148, height: 600 },
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: `${OUT_DIR}og-preview.png`, fullPage: true });
} finally {
  await browser.close();
}

console.log(`Image: ${imageNote || "none"}`);
for (const p of problems) console.log(`ERROR: ${p}`);
for (const w of warnings) console.log(`WARN:  ${w}`);
console.log(`Wrote ${OUT_DIR}og-preview.png and og-preview.html`);
process.exit(problems.length ? 1 : 0);
