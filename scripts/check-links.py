#!/usr/bin/env python3
"""Check that the external links of the site still work.

The portfolio links to GitHub repositories, the AUR and social networks.
Repositories get renamed, branches change (master -> main) and accounts
move, so this runs on a schedule and reports:

  * errors   (exit 1): the link does not answer with 2xx/3xx;
  * warnings (exit 0): the link redirects, so the site should point to the
                       new address before the redirect disappears.

Sites that refuse automated clients only produce warnings.

  python3 scripts/check-links.py
"""

import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ["src/main.js", "src/index.html", "src/404.html", "src/i18n/en.js"]

# Not pages: XML namespaces, schema and the site itself (a pull request
# can add a file that production does not serve yet).
SKIP = re.compile(r"^https://(www\.w3\.org/|www\.sitemaps\.org/|rovisoft\.net)")
# Sites that answer automated clients with 403/429/999.
BOT_HOSTILE = re.compile(r"^https://(www\.)?(linkedin\.com|x\.com|twitter\.com)/")

USER_AGENT = "Mozilla/5.0 (compatible; rovisoft-web link checker)"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def status(url, attempts=3):
    """Returns (status, location) without following redirects.

    A network error (no HTTP answer at all) is retried, since CI runners
    sometimes fail to reach a host for a few seconds; an HTTP error is not.
    """
    opener = urllib.request.build_opener(NoRedirect)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(1, attempts + 1):
        try:
            with opener.open(request, timeout=20) as response:
                return response.status, None
        except urllib.error.HTTPError as err:
            return err.code, err.headers.get("Location")
        except (urllib.error.URLError, TimeoutError) as err:
            if attempt == attempts:
                return None, str(err)
            time.sleep(5 * attempt)


def main():
    urls = set()
    for source in SOURCES:
        text = (ROOT / source).read_text(encoding="utf-8")
        urls.update(re.findall(r"https://[^\s\"'<>)`]+", text))

    errors = warnings = 0
    for url in sorted(u for u in urls if not SKIP.match(u)):
        code, detail = status(url)
        lenient = bool(BOT_HOSTILE.match(url))
        if code is not None and 200 <= code < 300:
            print(f"ok    {code} {url}")
        elif code is not None and 300 <= code < 400:
            warnings += 1
            print(f"::warning::{url} redirects ({code}) to {detail}")
        elif lenient:
            warnings += 1
            print(f"::warning::{url} answered {code or detail} (site blocks bots)")
        else:
            errors += 1
            print(f"::error::{url} answered {code or detail}")

    print(f"{len(urls)} links, {errors} broken, {warnings} warnings.")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
