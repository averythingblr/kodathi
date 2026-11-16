#!/usr/bin/env python3
"""Build src/data/texts.json from the published texts saved in scripts/sources/.

Each source file holds one page of Vaidika Vignanam (vignanam.org) in three scripts, line for line:
English (transliteration), Kannada and Telugu. Nothing is translated or respelled here: the lines are only
split into numbered parts. Run: python3 scripts/build-texts.py"""
import json, re

SRC = 'https://vignanam.org/{lang}/{page}.html'
LANGS = [('en', 'english'), ('kn', 'kannada'), ('te', 'telugu')]

def load(page):
    b = json.load(open(f'scripts/sources/{page}.json', encoding='utf8'))
    n = len(b['english'])
    assert all(len(b[l]) == n for _, l in LANGS), page
    rows = [{k: b[l][i] for k, l in LANGS} for i in range(n)]
    # the three scripts must be blank on the same lines
    assert all(len({bool(r[k]) for k, _ in LANGS}) == 1 for r in rows), page
    return rows

def source(page):
    return {'name': 'Vaidika Vignanam', **{k: SRC.format(lang=l, page=page) for k, l in LANGS}}

MARK = re.compile(r'\s*॥\s*\d+\s*॥\s*$')          # "॥ 10 ॥" at the end of every tenth sharanam
def unmark(r): return {k: MARK.sub('', v) for k, v in r.items()}
def title(r): return {'en': r['en'].title() if r['en'].isupper() else r['en'], 'kn': r['kn'], 'te': r['te']}

def blocks(rows):
    out, cur = [], []
    for r in rows:
        if r['en']: cur.append(r)
        elif cur: out.append(cur); cur = []
    if cur: out.append(cur)
    return out

texts = []

# 1. Sharanu ghosha: the 108 sharanams, then the ninaadalu (one calls, all answer)
rows = load('ayyappa-saranu-ghosha')
cut = next(i for i, r in enumerate(rows) if r['en'].startswith('śrī ayyappa svāmi ninādāni'))
names = [unmark(r) for r in rows[1:cut] if r['en']]
assert len(names) == 108, len(names)
texts.append({'id': 'sharanu-ghosha', 'kind': 'names', 'name': 'Sharanu ghosha', 'title': title(rows[0]), 'lines': names, 'source': source('ayyappa-saranu-ghosha')})
calls = []
for r in rows[cut + 1:]:
    if not r['en']: continue
    parts = {k: [p.strip() for p in v.split('–')] for k, v in r.items()}
    assert all(len(p) == 2 for p in parts.values()), r
    calls.append({'call': {k: p[0] for k, p in parts.items()}, 'answer': {k: p[1] for k, p in parts.items()}})
texts.append({'id': 'ninaadalu', 'kind': 'calls', 'name': 'Ninaadalu', 'title': title(rows[cut]), 'lines': calls, 'source': source('ayyappa-saranu-ghosha')})

def verses(rows):
    """Blocks of lines; a block whose last line ends in a verse number is a verse, the rest are closing lines."""
    out = []
    for b in blocks(rows):
        num = re.search(r'॥\s*(\d+)\s*॥\s*$', b[-1]['en'])
        out.append({'n': int(num.group(1)) if num else None, 'lines': b})
    return out

# 2. Loka Veeram (Shasta Pancharatnam) and the namaskara shlokas printed with it
rows = load('ayyappa-pancha-ratnam')
cut = next(i for i, r in enumerate(rows) if r['en'].startswith('——'))
texts.append({'id': 'loka-veeram', 'kind': 'verses', 'name': 'Loka Veeram', 'title': title(rows[0]), 'verses': verses(rows[1:cut]), 'source': source('ayyappa-pancha-ratnam')})
rest = [r for r in rows[cut + 1:]]
head = next(r for r in rest if r['en'])
texts.append({'id': 'namaskara-shlokas', 'kind': 'verses', 'name': 'Shasta namaskara shlokas', 'title': {k: v.rstrip(' ।') for k, v in head.items()}, 'verses': verses(rest[rest.index(head) + 1:]), 'source': source('ayyappa-pancha-ratnam')})

# 3. Ayyappa stotram
rows = load('ayyappa-stotram')
texts.append({'id': 'ayyappa-stotram', 'kind': 'verses', 'name': 'Ayyappa stotram', 'title': title(rows[0]), 'verses': verses(rows[1:]), 'source': source('ayyappa-stotram')})

# 4. Harivarasanam
rows = load('harivarasanam')
texts.append({'id': 'harivarasanam', 'kind': 'verses', 'name': 'Harivarasanam', 'title': title(rows[0]), 'verses': verses(rows[1:]), 'source': source('harivarasanam')})

json.dump(texts, open('src/data/texts.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for t in texts:
    print(t['id'], t['title']['kn'], '|', len(t.get('lines', t.get('verses'))), 'parts')
