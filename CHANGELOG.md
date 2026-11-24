# Changelog

All notable changes to RoviSoft.net are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
The `## [X.Y.Z]` section of a version is the body of its GitHub Release.

## [Unreleased]

## [1.14.0] - 2026-11-24

### Added

- `eggs` command: shows how many Easter eggs the visitor has discovered, in
  total and per level (Rookie, Hacker, Legend). Discovering an egg prints a
  notice. Eggs run from a link (`?cmd=`) do not count, and the progress
  follows the storage consent like the rest of the data.
- `airvzxf skills`: an Artificial Intelligence section (foundations, local
  models, RAG, agents, model evaluation).
- `airvzxf projects`: `cache-anything-new-action` and
  `assembly-from-the-ground-up`.
- Cloudflare Pages files: `_headers` (Content-Security-Policy with hashed
  inline scripts, HSTS, `X-Frame-Options`, `Permissions-Policy`), a real
  `404.html`, `robots.txt`, `sitemap.xml` and an `og-image.png` link preview.
- Open Graph and Twitter Card metadata, `canonical`, `<noscript>` and an
  `aria-live` log for screen readers.
- Development tooling: Playwright end-to-end tests against
  `wrangler pages dev`, version and CSP hash checks, a link checker, CI,
  Dependabot and a signed-tag release workflow.
- `npm run og-preview`: draws the WhatsApp, Facebook, X and LinkedIn cards
  of a link and checks its Open Graph tags and image, without sharing it.
- `SECURITY.md`: private vulnerability reporting and scope.

### Changed

- `airvzxf about`: new bio and title (Applied AI Engineer); the years of
  experience are computed from the first job (August 2005).
- `airvzxf research`: real course names and dates that match when each
  model and tool existed.
- Links (`?cmd=`) can only run read-only commands; `config`, `alias`,
  `theme`, `reboot` and `reset` must be typed.
- `su root` explains that the root password is not public.
- `neofetch` shows the real storage usage instead of a random number.
- Spanish manual pages use accents; error messages that were always in
  English are translated.

### Fixed

- Cross-site scripting through links: a command name such as `constructor`
  reached `Object.prototype` and printed its arguments as HTML, and
  `theme edit` printed the theme name unescaped.
- `lang constructor` and `theme constructor` stored invalid values.
- Aliases with uppercase letters never ran; alias names are now validated.
- The second line of the welcome banner was one column short.
- Mobile: the terminal follows the visible viewport, the prompt no longer
  makes iOS zoom in, and long commands scroll so the cursor stays visible.
- Unknown paths answered `200` with the home page instead of `404`.

### Removed

- `src/wrangler.jsonc`: the site is deployed by Cloudflare Pages, which
  published the file as a public asset.
- `research` entries for repositories that no longer exist.

## [1.12.0] - 2026-05-19

First version recorded in this changelog. See the git history for the
earlier development of the terminal.

[Unreleased]: https://github.com/airvzxf/rovisoft-web/compare/v1.14.0...HEAD
[1.14.0]: https://github.com/airvzxf/rovisoft-web/releases/tag/v1.14.0
