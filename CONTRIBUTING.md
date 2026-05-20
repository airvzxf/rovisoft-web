# Contributing Guide

Thanks for your interest in contributing to **RoviSoft.net**. This document describes the process and conventions for participating in the project.

## Code of Conduct

- Be respectful and direct.
- Contributions must be technical and demonstrable.
- Code that degrades performance or portability will not be accepted.

## Prerequisites

- A modern browser (latest Firefox, Chrome, Safari).

## Code Conventions

### General

- **No external dependencies.** No libraries, frameworks, or npm packages.
- **Vanilla JS (ES6+).** Code lives in `src/main.js` and `src/storage.js`. No TypeScript or transpilers.
- **Inlined CSS in `index.html`.** No separate `style.css` file — CSS is inlined for instant first paint.
- **UTF-8 encoding** in all files.
- **Indentation:** 2 spaces.
- **Semicolons** at the end of every JavaScript statement.
- **Double quotes** for HTML attributes, **single quotes** for JavaScript strings.
- **IIFE** for encapsulation: `(function () { "use strict"; ... })();`

### File Structure

```
src/
├── index.html       # HTML + inlined CSS (no external stylesheet)
├── main.js          # Main terminal logic
├── storage.js       # Persistence module (localStorage/sessionStorage)
├── i18n/
│   └── en.js        # English translations (lazy-loaded)
└── fonts/
    └── *.woff2      # Martian Mono (4 Unicode subsets)
```

### Adding New Commands

Follow the existing pattern in `main.js`:

1. Add the command function to the `COMMANDS` object.
2. Add the corresponding entry in the `help()` function.
3. Add translations in the `i18n` object inside `main.js` (Spanish) and in `src/i18n/en.js` (English).
4. Add the manual page (`man`) with corresponding translation keys.
5. Add the keyword to the autocomplete array if applicable.

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

| Type | Usage |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Restructuring without functional change |
| `docs` | Documentation changes |
| `style` | Formatting (no logic change) |
| `perf` | Performance improvement |
| `i18n` | Translations or language changes |
| `chore` | Maintenance (build, config) |

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
4. **Test** your changes in the browser.
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

There is no automated test suite. Testing is manual:

- Open the terminal in the browser.
- Execute each modified command and verify its output.
- Test on mobile (responsive).
- Test language switching (`lang es`/`lang en`).
- Test theme switching (`theme dark`/`theme light`).
- Test storage (`config accept`/`config reject`/`config status`).
- Test URL parameters (`?cmd=help`).

## License

By contributing, you agree that your code will be published under the **GNU Affero General Public License v3** — the same license as the project. See [LICENSE](LICENSE) for details.
