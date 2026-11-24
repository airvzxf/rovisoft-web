# Contributing Guide

Thanks for your interest in contributing to **RoviSoft.net**. This document describes the process and conventions for participating in the project.

## Code of Conduct

- Be respectful and direct.
- Contributions must be technical and demonstrable.
- Code that degrades performance or portability will not be accepted.

## Prerequisites

- A modern browser (latest Firefox, Chrome, Safari).
- For the tests and checks: Node.js (version in `.nvmrc`) and Python 3. Run `npm ci` once to install the development tools.

## Code Conventions

### General

- **No runtime dependencies.** The site loads no libraries, frameworks or npm packages. `package.json` only lists development tools (Playwright, wrangler, Prettier); nothing from `node_modules/` is ever published.
- **Vanilla JS (ES6+).** Code lives in `src/main.js` and `src/storage.js`. No TypeScript or transpilers.
- **Inlined CSS in `index.html`.** No separate `style.css` file — CSS is inlined for instant first paint.
- **UTF-8 encoding** in all files.
- **Indentation:** 2 spaces.
- **Semicolons** at the end of every JavaScript statement.
- **Double quotes** for HTML attributes and JavaScript strings (Prettier defaults); single quotes only for strings that contain HTML with double-quoted attributes.
- **IIFE** for encapsulation: `(function () { "use strict"; ... })();`

### File Structure

```
src/
├── index.html       # HTML + inlined CSS (no external stylesheet)
├── 404.html         # Not-found page
├── _headers         # Cloudflare Pages security headers (CSP, HSTS, ...)
├── robots.txt       # Points crawlers to the sitemap
├── sitemap.xml
├── og-image.png     # Link preview (npm run og-image)
├── main.js          # Main terminal logic
├── storage.js       # Persistence module (localStorage/sessionStorage)
├── i18n/
│   └── en.js        # English translations (lazy-loaded)
└── fonts/
    └── *.woff2      # Martian Mono (4 Unicode subsets)
```

### Adding New Commands

Follow the existing pattern in `main.js`:

1. Add the command function to the `commands` object.
2. Add the corresponding entry in the `help()` function.
3. Add translations in the `I18N.es` object inside `main.js` (Spanish) and in `src/i18n/en.js` (English).
4. Add the manual page to the `manPages` object with corresponding translation keys.
5. Tab autocomplete picks up the new command automatically (it lists the keys of `commands`).
6. If a link may run it (`?cmd=`), add it to `URL_SAFE_COMMANDS`. Only add read-only commands.

### Security Rules

- Escape every value that comes from the user, the URL or storage with `escapeHtml()` before it reaches `innerHTML`. `tf()` does **not** escape its arguments.
- Look up user input in objects with `own(obj, key)`, never `obj[key]`: names such as `constructor` or `__proto__` would otherwise reach `Object.prototype`.
- The Content-Security-Policy in `src/_headers` allows inline scripts by hash. After editing any inline `<script>` in `src/*.html`, run `python csp-hashes.py` (and `python csp-hashes.py --check` before committing), or the browser will block the script.

### Internationalization (i18n)

- **Spanish** translations are embedded in `main.js`.
- **English** translations are in `src/i18n/en.js` and loaded dynamically.
- Use the `t('key')` function to get the translated string.
- Keys follow the `command.property` format (e.g. `help.clear`, `about.bio`).
- To add a new language, create `src/i18n/<code>.js` following the format of `en.js`.

### Storage

- The `Storage` module (`src/storage.js`) handles `localStorage` and `sessionStorage`.
- Use `Storage.save()` / `Storage.load()` for persistence.
- Prefer existing module functions over direct `localStorage` access.

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Optional body with details.
```

### Types

| Type       | Usage                                   |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `refactor` | Restructuring without functional change |
| `docs`     | Documentation changes                   |
| `style`    | Formatting (no logic change)            |
| `perf`     | Performance improvement                 |
| `i18n`     | Translations or language changes        |
| `chore`    | Maintenance (build, config)             |

### Examples

```
feat: add logout command
fix: prevent prompt overflow on mobile
refactor: extract command parser into separate function
docs: update README with new command reference
i18n: add French translations
```

## Contribution Process

1. **Fork** the repository.
2. Create a **descriptive branch**: `feat/logout-command`, `fix/mobile-prompt`, etc.
3. Make your changes following the conventions above.
4. **Test** your changes: `npm run check` and `npm test` (see below), plus a look in the browser.
5. Verify you haven't broken existing functionality:
   - All commands still work.
   - Themes (dark/light) apply correctly.
   - Language switching works.
   - Storage persists across reloads.
   - Terminal works on mobile (scroll, prompt visible).
6. **Commit** with a descriptive message following Conventional Commits.
7. **Push** to your fork.
8. Open a **Pull Request** against the `main` branch.

## Testing

CI (`.github/workflows/ci.yml`) runs the same commands on every pull request.

```sh
npm ci              # once: install the development tools
npm run check       # version consistency, CSP hashes and Prettier
npm test            # Playwright end-to-end tests (desktop and phone)
npm run format      # apply Prettier
```

- `npm test` starts `wrangler pages dev src`, which applies `_headers` and `404.html` like Cloudflare Pages, and fails on any console error, CSP violation or exception. Download its browser once with `npx playwright install chromium`, or use an installed one: `CHROMIUM_PATH=/usr/bin/chromium npm test`.
- Serve the site by hand with `npm run serve` (port 8788), or with `python serve.py` to simulate a slow network.
- `python3 scripts/check-links.py` checks the external links (CI runs it every week).
- After a visible change to the welcome screen, regenerate the link preview with `npm run og-image` while `npm run serve` is running.
- `npm run og-preview` shows how a shared link looks on WhatsApp, Facebook, X and LinkedIn without sharing it (they cache the first preview of a URL), and checks the Open Graph tags and image. It writes `test-results/og-preview.png`. Pass a URL to check production or a preview deployment: `npm run og-preview -- https://rovisoft.net/`.
- To open the local server from a phone on the same network, serve on all interfaces (`npx wrangler pages dev src --ip 0.0.0.0 --port 8080`) and allow the port in the firewall, e.g. `sudo ufw allow from 192.168.1.0/24 to any port 8080 proto tcp` (remove it afterwards with `sudo ufw delete allow from 192.168.1.0/24 to any port 8080 proto tcp`).

## Releases

The site is deployed by Cloudflare Pages on every push to `main`. A release records a version as a GitHub Release (`.github/workflows/release.yml`):

1. In the release pull request, set the new version in `VERSION`, the `VERSION` constant of `src/main.js`, the three `?v=` in `src/index.html` (`main.js`, `storage.js` and `og:image`), `package.json` and the README, and move the `## [Unreleased]` notes to a `## [X.Y.Z] - YYYY-MM-DD` section of `CHANGELOG.md`. `npm run check` fails if any of them disagrees.
2. Merge it into `main`.
3. Sign the tag on the merge commit and push it:

   ```sh
   git fetch origin main
   git tag -s vX.Y.Z -m 'release: X.Y.Z' "$(git rev-parse origin/main)"
   git push origin vX.Y.Z
   ```

The workflow checks that the tag is signed by a key in `.github/trusted-signers` (read from `main`), that it points at a commit of `main` and that the version and changelog match. It then publishes the release notes, the site archive with its SHA-256 checksum and a build provenance attestation, and waits until https://rovisoft.net serves the new version.

## Security

Report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your code will be published under the **GNU Affero General Public License v3** — the same license as the project. See [LICENSE](LICENSE) for details.
