# Security Policy

## Supported versions

Only the version served at https://rovisoft.net (the latest commit of `main`) is supported. Older releases are not patched; a fix ships in the next release.

| Version         | Supported |
| --------------- | --------- |
| 1.14.x (latest) | Yes       |
| < 1.14          | No        |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report privately through GitHub: **Security → Report a vulnerability** on this repository (<https://github.com/airvzxf/rovisoft-web/security/advisories/new>). If you cannot use GitHub, use the email shown by `su airvzxf` and then `airvzxf contact` in the terminal.

Include:

1. A short description of the issue and its impact.
2. A reproducer: the URL (for example a `?cmd=` link) or the commands typed, and the browser and version.
3. The version (`version` in the terminal) or commit SHA.

## What to expect

- **Acknowledgement** within 72 hours.
- **Triage** within 7 days.
- **Fix** for high-impact issues as soon as possible; Cloudflare Pages deploys `main` within minutes. Lower-severity issues go into the next release.
- **Credit** in the release notes, unless you prefer otherwise.

## Scope

The site is static: Cloudflare Pages serves the files in `src/` and there is no server-side code, no account and no form that sends data. Everything a visitor stores (preferences, aliases, themes, history, Easter egg progress) stays in their own browser.

Of interest:

- Script execution (XSS) through anything the terminal renders: typed commands, `?cmd=` links, aliases, themes, or values stored in `localStorage` / `sessionStorage`.
- A `?cmd=` link that runs a command outside the read-only allowlist (`URL_SAFE_COMMANDS` in `src/main.js`), or that changes stored data.
- A way around the Content-Security-Policy or the other headers in `src/_headers`.
- Data stored in `localStorage` before the visitor accepts it with `config accept`.
- Tampering with the release pipeline (`.github/workflows/release.yml`): publishing a release from an unsigned tag, a tag outside `main`, or an archive that does not match its checksum.

Out of scope:

- The Cloudflare platform itself; report it to Cloudflare.
- The `root` password Easter egg: guessing it is the game, not a vulnerability.
- Attacks that need the visitor to paste code into their own browser console, or a compromised browser or extension.
- Missing best-practice headers or scanner findings without a demonstrated impact.
- Denial of service or traffic volume against rovisoft.net.

## Release integrity

Release tags are signed with the SSH key in `.github/trusted-signers` (or the PGP key in `.github/trusted-signers.asc`). The release workflow refuses a tag that is unsigned, signed by another key, or not on `main`. Each GitHub Release carries the site archive, its `SHA256SUMS` and a build provenance attestation:

```sh
git verify-tag vX.Y.Z
sha256sum -c SHA256SUMS
gh attestation verify rovisoft-web-X.Y.Z.tar.gz --repo airvzxf/rovisoft-web
```
