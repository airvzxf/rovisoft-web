# RoviSoft.net

**RoviSoft.net** is not a traditional website: it's an **interactive command-line terminal** (TTY) that functions as a personal homepage. Visitors arrive and find themselves in a simulated UNIX terminal, where the mouse is practically useless and everything is navigated by typing commands. The aesthetics are inspired by classic terminal emulators: dark background, monospaced font, and a _blinking cursor_.

The terminal features a **fixed prompt at the top** of the screen. All command history and output flows downward, and the browser's native scroll handles the rest.

**Live**: [https://rovisoft.net](https://rovisoft.net)

## Features

- **Interactive terminal** — Full UNIX-like experience with prompt, history, and tab autocomplete
- **User system** — Sessions for `guest`, `airvzxf`, and `root` (with password)
- **20+ commands** — `help`, `neofetch`, `theme`, `lang`, `man`, `alias`, `config`, Easter eggs, and more
- **Theme system** — Dark/light modes, custom themes via CSS variables, adjustable typography
- **Internationalization** — Spanish and English with lazy-loading on demand (`lang es`/`lang en`)
- **Persistent storage** — `localStorage` with accept/reject cookie-consent flow
- **Aliases** — Full alias system with history expansion (`!!`, `!N`) and multi-command (`;`)
- **URL parameters** — Execute commands from the URL for deep linking
- **Man pages** — UNIX-style manual pages for every command
- **Zero dependencies** — Vanilla HTML5/CSS3/JavaScript, no build tools, no frameworks
- **Instant load** — Inlined CSS, self-hosted font (Martian Mono), lazy i18n loading

## Commands

### General

| Command | Description |
| --- | --- |
| `help` | List all available commands |
| `clear` | Clear the screen |
| `whoami` | Show current username |
| `who` | Show current user info |
| `users` | List system users |
| `su <user>` | Switch to the specified user (`guest`, `airvzxf`, `root`) |
| `about` | Show site owner information |
| `neofetch` | ASCII art with system information |
| `contact` | Show contact methods |
| `projects` | List portfolio projects |
| `social` | Show social media links |
| `date` | Show current date and time |
| `echo` | Echo input text |
| `banner` | Display the RoviSoft ASCII banner |
| `license` | Show license (AGPL) and repository link |
| `lang es/en` | Change interface language |
| `history` | Show command history for the session |
| `alias` / `unalias` | Manage command aliases |
| `theme` | Manage color and typography themes |
| `config` | Manage storage preferences |
| `man <cmd>` | Display manual page for a command |
| `version` | Show current version |
| `reboot` | Reboot terminal (refreshes page, no data loss) |
| `reset` | Factory reset (clears all stored data) |

### `airvzxf` exclusive (requires `su airvzxf`)

| Command | Description |
| --- | --- |
| `airvzxf about` | Owner information |
| `airvzxf contact` | Contact methods |
| `airvzxf social` | Social media links |
| `airvzxf projects` | Portfolio projects |
| `airvzxf skills` | Tech stack and domains |
| `airvzxf research` | AI and ML research |

## URL Parameters

The terminal supports command execution via URL parameters:

| Format | Example |
| --- | --- |
| Semicolons in single `cmd` | `/?cmd=clear;su%20airvzxf;airvzxf%20about` |
| Repeated `&cmd=` params | `/?cmd=clear&cmd=su%20airvzxf&cmd=airvzxf%20about` |

Both formats can be combined. After execution, URL parameters are stripped via `history.replaceState` to prevent re-execution on refresh.

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `↑` / `↓` | Navigate command history |
| `Tab` | Autocomplete command |
| `Ctrl+L` | Clear screen |
| `!!` | Repeat last command |
| `!N` | Execute Nth command from history |
| `;` | Separator for multiple commands |

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
└── src/
    ├── index.html      # Structure with inlined CSS
    ├── main.js         # Terminal logic (~3500 lines)
    ├── storage.js      # Persistence module
    ├── i18n/
    │   └── en.js       # English translations (lazy-loaded)
    └── fonts/
        └── martian-mono-*.woff2  # Self-hosted font (4 subsets)
```

## Known Issues

### Mobile

- **Prompt bar disappears** when scrolling through command history and reappears truncated when typing.
- **Long input text overflows** the prompt bar on mobile — characters disappear past the visible area without scrolling. The prompt should expand vertically (up to ~4 lines) and then allow scroll, rather than clipping text.

## Version

**1.12.0** — Type `version` in the terminal for the current version.

## License

Copyright (C) 2026 Israel Alberto Roldan Vega. Licensed under the **GNU Affero General Public License v3** — see [LICENSE](LICENSE) for the full text.

The AGPL ensures that any modification offered as a network service must publish its source code under the same license. See [https://www.gnu.org/licenses/agpl-3.0.html](https://www.gnu.org/licenses/agpl-3.0.html).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

_The intersection of creativity, principles, and technology._
