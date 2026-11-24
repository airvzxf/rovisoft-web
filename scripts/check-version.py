#!/usr/bin/env python3
"""Check that every copy of the version number agrees with VERSION.

The version appears in several places and a forgotten one breaks things:
an old `?v=` in index.html keeps visitors on a cached main.js for a year,
and link previews on an old og-image.png.

  python3 scripts/check-version.py                # files agree with VERSION
  python3 scripts/check-version.py --tag v1.14.0  # ...and with a release tag
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tag", help="release tag, e.g. v1.14.0 or v1.14.0-rc.1")
    args = parser.parse_args()

    version = read("VERSION").strip()
    errors = []

    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        errors.append(f"VERSION: '{version}' is not X.Y.Z")

    if args.tag is not None:
        core = re.sub(r"-.*$", "", args.tag.removeprefix("v"))
        if core != version:
            errors.append(f"tag {args.tag}: expected VERSION {core}, found {version}")

    found = re.findall(r'const VERSION = "([^"]+)";', read("src/main.js"))
    if found != [version]:
        errors.append(f"src/main.js: VERSION constant is {found or 'missing'}")

    html = read("src/index.html")
    assets = re.findall(r'src="(storage|main)\.js\?v=([^"]+)"', html)
    if sorted(name for name, _ in assets) != ["main", "storage"]:
        errors.append("src/index.html: expected main.js?v= and storage.js?v=")
    for name, value in assets:
        if value != version:
            errors.append(f"src/index.html: {name}.js?v={value}")
    # Link previews (WhatsApp, Facebook, ...) cache og:image by URL, so a
    # new image is only fetched when the URL changes.
    images = re.findall(r'content="https://rovisoft\.net/og-image\.png\?v=([^"]+)"', html)
    if images != [version]:
        errors.append(f"src/index.html: og:image ?v= is {images or 'missing'}")

    package = json.loads(read("package.json"))["version"]
    if package != version:
        errors.append(f"package.json: version {package}")

    if f"**{version}**" not in read("README.md"):
        errors.append(f"README.md: no '**{version}**' in the Version section")

    if not re.search(rf"^## \[{re.escape(version)}\]", read("CHANGELOG.md"), re.M):
        errors.append(f"CHANGELOG.md: no '## [{version}]' section")

    if errors:
        for error in errors:
            print(f"::error::{error}")
        sys.exit(f"Version {version} is not consistent ({len(errors)} problems).")
    print(f"Version {version} is consistent across the repository.")


if __name__ == "__main__":
    main()
