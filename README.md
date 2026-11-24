# RoviSoft.net

**RoviSoft.net** is not a traditional website: it's an **interactive command-line terminal** (TTY) that functions as a personal homepage. Visitors arrive and find themselves in a simulated UNIX terminal, where the mouse is practically useless and everything is navigated by typing commands. The aesthetics are inspired by classic terminal emulators: dark background, monospaced font, and a _blinking cursor_.

The terminal features a **fixed prompt at the top** of the screen. All command history and output flows downward, and the browser's native scroll handles the rest.

**Live**: [https://rovisoft.net](https://rovisoft.net)

## Features

- **Interactive terminal** — Full UNIX-like experience with prompt, history, and tab autocomplete
- **User system** — Sessions for `guest` and `airvzxf`; `root` asks for a password that is not public (an Easter egg)
- **20+ commands** — `help`, `neofetch`, `theme`, `lang`, `man`, `alias`, `config`, Easter eggs, and more
- **Theme system** — Dark/light modes, custom themes via CSS variables, adjustable typography
- **Internationalization** — Spanish and English with lazy-loading on demand (`lang es`/`lang en`)
- **Persistent storage** — `localStorage` with accept/reject cookie-consent flow
- **Aliases** — Full alias system with history expansion (`!!`, `!N`) and multi-command (`;`)
- **URL parameters** — Execute commands from the URL for deep linking
- **Man pages** — UNIX-style manual pages for every command
- **Easter eggs** — Hidden commands and key sequences in three levels; `eggs` tracks your progress
- **Zero dependencies** — Vanilla HTML5/CSS3/JavaScript, no build tools, no frameworks
- **Instant load** — Inlined CSS, self-hosted font (Martian Mono), lazy i18n loading

## Commands

### General

| Command                | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `help`                 | List all available commands                               |
| `clear`                | Clear the screen                                          |
| `whoami`               | Show current username                                     |
| `users`                | List system users                                         |
| `su <user>`            | Switch to the specified user (`guest`, `airvzxf`, `root`) |
| `airvzxf <subcommand>` | Owner information (requires `su airvzxf`, see below)      |
| `neofetch`             | System information                                        |
| `date`                 | Show current date and time                                |
| `echo`                 | Echo input text                                           |
| `license`              | Show license (AGPL) and repository link                   |
| `lang es/en`           | Change interface language                                 |
| `history`              | Show command history for the session                      |
| `alias` / `unalias`    | Manage command aliases                                    |
| `theme`                | Manage color and typography themes                        |
| `config`               | Manage storage preferences                                |
| `man <cmd>`            | Display manual page for a command                         |
| `eggs`                 | Show how many Easter eggs you have discovered, per level  |
| `version`              | Show current version                                      |
| `reboot`               | Reboot terminal (refreshes page, no data loss)            |
| `reset`                | Factory reset (clears all stored data)                    |

### `airvzxf` exclusive (requires `su airvzxf`)

| Command            | Description            |
| ------------------ | ---------------------- |
| `airvzxf about`    | Owner information      |
| `airvzxf contact`  | Contact methods        |
| `airvzxf social`   | Social media links     |
| `airvzxf projects` | Portfolio projects     |
| `airvzxf skills`   | Tech stack and domains |
| `airvzxf research` | AI and ML research     |

## URL Parameters

The terminal supports command execution via URL parameters:

| Format                     | Example                                            |
| -------------------------- | -------------------------------------------------- |
| Semicolons in single `cmd` | `/?cmd=clear;su%20airvzxf;airvzxf%20about`         |
| Repeated `&cmd=` params    | `/?cmd=clear&cmd=su%20airvzxf&cmd=airvzxf%20about` |

Both formats can be combined. After execution, URL parameters are stripped via `history.replaceState` to prevent re-execution on refresh.

For safety, a link can only run read-only commands: `help`, `clear`, `whoami`, `users`, `su`, `airvzxf`, `neofetch`, `date`, `echo`, `version`, `license`, `history`, `man`, `lang` and `eggs`, plus the Easter eggs. Commands that change stored data (`config`, `alias`, `unalias`, `theme`, `reboot`, `reset`) must be typed in the terminal.

## Keyboard Shortcuts

| Key       | Action                           |
| --------- | -------------------------------- |
| `↑` / `↓` | Navigate command history         |
| `Tab`     | Autocomplete command             |
| `Ctrl+L`  | Clear screen                     |
| `!!`      | Repeat last command              |
| `!N`      | Execute Nth command from history |
| `;`       | Separator for multiple commands  |

## Tech Stack

Exclusively native web technologies, no frameworks, no dependencies, no build tools:

- **HTML5** — Minimal semantic structure
- **CSS3** — CSS variables for themes, self-hosted `@font-face`, cursor animations
- **JavaScript (ES6+)** — Command parser, user system, history, autocomplete, dynamic i18n

```
rovisoft-web/
├── LICENSE             # GNU AGPL v3
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md         # How to report a vulnerability
├── CHANGELOG.md        # Release notes (Keep a Changelog)
├── VERSION             # Current version, checked against every other copy
├── package.json        # Development tools only (Playwright, wrangler, Prettier)
├── serve.py            # Local test server (throttling, compression)
├── csp-hashes.py       # Updates the CSP script hashes in src/_headers
├── scripts/            # Version and link checks, link preview image and tester
├── tests/e2e/          # Playwright end-to-end tests
├── .github/            # CI, link check, release workflow, Dependabot
└── src/                # Published as-is by Cloudflare Pages
    ├── index.html      # Structure with inlined CSS
    ├── 404.html        # Not-found page
    ├── _headers        # Security headers (CSP, HSTS, ...)
    ├── robots.txt      # Points crawlers to the sitemap
    ├── sitemap.xml
    ├── og-image.png    # Link preview image
    ├── main.js         # Terminal logic (~3500 lines)
    ├── storage.js      # Persistence module
    ├── i18n/
    │   └── en.js       # English translations (lazy-loaded)
    └── fonts/
        └── martian-mono-*.woff2  # Self-hosted font (4 subsets)
```

## Deployment

The site is hosted on **Cloudflare Pages**. Every push to `main` publishes the `src/` directory as-is (no build step); other branches get a preview URL. `src/_headers` sets the security headers and `src/404.html` is served for unknown paths.

- **CI** runs on every pull request: version consistency, CSP hashes, Prettier, actionlint and the Playwright end-to-end tests (desktop and phone) against a local Cloudflare Pages server.
- **Links** are checked every week, since renamed repositories break them without any change here.
- **Releases** are signed tags (`vX.Y.Z`) on `main`: the workflow verifies the signature, publishes the changelog notes with the site archive, its checksum and a build provenance attestation, and confirms that https://rovisoft.net serves the new version. See [CONTRIBUTING.md](CONTRIBUTING.md#releases).

## Known Issues

### Mobile

- The prompt used to disappear while scrolling and long commands were clipped. Version 1.14.0 sizes the terminal to the visible viewport (`100dvh`), stops iOS from zooming into the prompt, and scrolls long commands horizontally so the cursor stays visible. Automated tests cover a phone-sized viewport; the fixes still need confirmation on real phones.

## Version

**1.14.1** — Type `version` in the terminal for the current version.

## License

Copyright (C) 2026 Israel Alberto Roldan Vega. Licensed under the **GNU Affero General Public License v3** — see [LICENSE](LICENSE) for the full text.

The AGPL ensures that any modification offered as a network service must publish its source code under the same license. See [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines. Report security problems privately as described in [SECURITY.md](SECURITY.md).

---

_The intersection of creativity, principles, and technology._
