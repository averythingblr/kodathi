#!/usr/bin/env python3
"""Make a copy of dist/ that works from any folder (relative paths), for the preview artifact.
Usage: npm run build && python3 scripts/preview-copy.py <out-dir>"""
import glob, os, re, shutil, sys
out = sys.argv[1]
shutil.rmtree(out, ignore_errors=True)
shutil.copytree('dist', out)
os.rename(f'{out}/_astro', f'{out}/assets')
os.chdir(out)
pages = ['gallery', 'poojas', 'festivals', 'visit']
for f in glob.glob('**/*.html', recursive=True):
    p = '../' * f.count('/'); home = p or './'
    s = open(f, encoding='utf8').read()
    for pg in pages:
        s = re.sub(r'(href=")/%s/(#[^"]*)?"' % pg, lambda m: f'{m.group(1)}{p}{pg}/index.html{m.group(2) or ""}"', s)
    s = re.sub(r'(href=")/(#[^"]*)?"', lambda m: f'{m.group(1)}{home}{m.group(2) or ""}"', s)
    s = s.replace('data-base="/"', f'data-base="{home}"')
    s = re.sub(r'(["\'(\s,])/_astro/', lambda m: m.group(1) + p + 'assets/', s)
    s = re.sub(r'(["\'(\s,])/(media/|cal/|favicon\.svg)', lambda m: m.group(1) + p + m.group(2), s)
    open(f, 'w', encoding='utf8').write(s)
for f in glob.glob('assets/*.css') + glob.glob('assets/*.js'):
    s = open(f, encoding='utf8').read(); s2 = s.replace('/_astro/', './')
    if s2 != s: open(f, 'w', encoding='utf8').write(s2)
