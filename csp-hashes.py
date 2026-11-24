#!/usr/bin/env python3
"""Keep the Content-Security-Policy script hashes in src/_headers up to date.

The CSP only allows inline <script> blocks whose SHA-256 hash it lists. Any
change to an inline script in src/*.html (even whitespace) changes its hash,
so run this script after editing one:

  python csp-hashes.py           # rewrite the hashes in src/_headers
  python csp-hashes.py --check   # exit 1 if src/_headers is out of date
"""

import base64
import hashlib
import re
import sys
from pathlib import Path

SRC_DIR = Path(__file__).parent / "src"
HEADERS = SRC_DIR / "_headers"

# Inline scripts only: <script> blocks without a src attribute.
INLINE_SCRIPT = re.compile(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", re.S)
SCRIPT_SRC = re.compile(r"(script-src 'self')((?: 'sha256-[A-Za-z0-9+/=]+')*)")


def inline_hashes():
    hashes = []
    for html in sorted(SRC_DIR.glob("*.html")):
        for body in INLINE_SCRIPT.findall(html.read_text(encoding="utf-8")):
            digest = hashlib.sha256(body.encode("utf-8")).digest()
            token = "'sha256-" + base64.b64encode(digest).decode("ascii") + "'"
            if token not in hashes:
                hashes.append(token)
    return hashes


def main():
    check = "--check" in sys.argv[1:]
    text = HEADERS.read_text(encoding="utf-8")
    if not SCRIPT_SRC.search(text):
        sys.exit(f"{HEADERS}: no \"script-src 'self'\" directive found")

    wanted = "".join(" " + h for h in inline_hashes())
    updated = SCRIPT_SRC.sub(lambda m: m.group(1) + wanted, text, count=1)

    if updated == text:
        print("CSP hashes are up to date.")
        return
    if check:
        sys.exit("CSP hashes are out of date: run `python csp-hashes.py`.")
    HEADERS.write_text(updated, encoding="utf-8")
    print(f"Updated {HEADERS}:{wanted}")


if __name__ == "__main__":
    main()
