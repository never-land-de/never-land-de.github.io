"""Dependency-free asset/link and integration checks: python3 tests/station_links.py."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest
from urllib.parse import urljoin, urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.links.extend(v for k, v in attrs if k in ('src', 'href') and v)


class StationLinks(unittest.TestCase):
    def test_html_assets_and_links_at_root_and_preview_prefix(self):
        for prefix in ('/', '/repository-preview/'):
            for file in ('station/index.html', 'tech/index.html'):
                for ref in Links((ROOT / file).read_text()).links:
                    # Existing Tech favicons are webroot-relative; outside this change.
                    if file == 'tech/index.html' and prefix != '/' and ref.startswith('/'):
                        continue
                    url = urlsplit(urljoin('https://example.test' + prefix + file, ref))
                    if url.netloc != 'example.test':
                        continue
                    self.assertTrue(url.path.startswith(prefix), ref)
                    path = unquote(url.path.removeprefix(prefix))
                    self.assertTrue((ROOT / path).is_file(), (file, ref))

    def test_module_imports_fonts_and_registry_links(self):
        for path in (ROOT / 'station').glob('*'):
            if path.suffix not in ('.mjs', '.css'):
                continue
            text = path.read_text()
            refs = re.findall(r"(?:from\s+['\"]|url\(['\"]?)([^'\")]+)", text)
            if path.name == 'logs.mjs':
                refs += re.findall(r"['\"]((?:\.\./)[^'\"]+\.html)['\"]", text)
            for ref in refs:
                self.assertTrue((path.parent / ref).resolve().is_file(), (path.name, ref))

    def test_isolated_entry_after_footer_and_no_legacy_name(self):
        tech = (ROOT / 'tech/index.html').read_text()
        self.assertEqual(tech.count('class="station-entry"'), 1)
        self.assertGreater(tech.index('class="station-entry"'), tech.index('</footer>'))
        for path in (ROOT / 'station').iterdir():
            self.assertNotIn('codex', path.read_text().lower(), path.name)
        html = (ROOT / 'station/index.html').read_text()
        self.assertNotRegex(html, r'(?:href|src)="https?://')


if __name__ == '__main__':
    unittest.main(verbosity=2)
