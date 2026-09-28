from html.parser import HTMLParser
from pathlib import Path
root = Path(__file__).parent
class Check(HTMLParser):
    ids = set()
    refs = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.add(attrs['id'])
        if tag in {'script', 'link', 'img'}:
            target = attrs.get('src') or attrs.get('href')
            if target and not target.startswith(('http:', 'https:', '#', 'mailto:')):
                self.refs.append(target)
        if tag == 'a' and attrs.get('href','').startswith('#'):
            self.refs.append(attrs['href'])
        if tag == 'button' and attrs.get('aria-controls'):
            self.refs.append('#' + attrs['aria-controls'])
site = Check()
html = (root/'index.html').read_text()
site.feed(html)
for ref in site.refs:
    if ref.startswith('#'):
        assert ref[1:] in site.ids or ref[1:] in {'anasayfa', 'uygulama', 'ciftlik', 'oyunlar', 'iletisim', 'indir'}, f"Broken route: {ref}"
    else:
        assert (root/ref).exists(), f"Missing asset: {ref}"
assert 'firebase' not in html.lower()
assert html.count('data-view=') == 6
assert '@media(max-width:700px)' in (root/'style.css').read_text()
assert 'prefers-reduced-motion' in (root/'style.css').read_text()
assert len(list((root/'media').glob('*'))) == 6
print(f"Site check passed: {len(site.refs)} assets and anchor references, 6 selected media files.")
