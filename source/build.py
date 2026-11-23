#!/usr/bin/env python3
"""Build Then and Now into one self-contained page.

Bundles the ES modules in assets/js into a single classic script (so the page also
works when opened straight from a folder with a double-click), inlines the stylesheet,
and embeds the typefaces, so the result needs no internet and no other files.

    python3 build.py OUT.html [--version 1]
"""
import base64, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
FONTS = ROOT / 'fonts'
ORDER = ['assets/js/scenes.js', 'assets/js/refs.js', 'assets/js/content.js', 'assets/js/ui.js',
         'assets/js/store.js', 'assets/js/regions.js', 'assets/js/charts.js', 'assets/js/diagrams.js',
         'assets/js/guidedata.js', 'assets/js/views/journey.js', 'assets/js/views/practice.js',
         'assets/js/views/insight.js', 'assets/js/views/tools.js', 'assets/js/views/guide.js',
         'assets/js/app.js']

IMPORT_RE = re.compile(r'^\s*import\s+(?:(\*\s*as\s+\w+)|(\{[^}]*\}))\s+from\s+[\'"]([^\'"]+)[\'"];?\s*$', re.M | re.S)


def modname(path):
    return '__' + pathlib.Path(path).stem.replace('-', '_')


def transform(src, path):
    prelude = []

    def swap(m):
        star, named, spec = m.group(1), m.group(2), m.group(3)
        target = modname(spec)
        if star:
            prelude.append(f'const {star.split("as")[1].strip()} = {target};')
        else:
            prelude.append(f'const {" ".join(named.split())} = {target};')
        return ''

    body = IMPORT_RE.sub(swap, src)
    exported = re.findall(r'^export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)', body, re.M)
    body = re.sub(r'^export\s+', '', body, flags=re.M)
    if re.search(r'^\s*(import|export)\s', body, re.M):
        sys.exit(f'{path}: an import or export was not converted')
    returns = '{ ' + ', '.join(sorted(set(exported))) + ' }'
    return (f'\n/* ---- {path} ---- */\nconst {modname(path)} = (function () {{\n'
            + '\n'.join(prelude) + '\n' + body + f'\nreturn {returns};\n}})();\n')


def fonts_css():
    faces = json.loads((FONTS / 'fonts.json').read_text())
    out = []
    for f in faces:
        if f['family'] == 'IBM Plex Mono':
            continue
        data = (FONTS / (f['file'] + '.b64')).read_text().strip()
        out.append(f"@font-face{{font-family:\"{f['family']}\";font-style:{f['style']};font-weight:{f['weight']};"
                   f"font-display:swap;src:url(data:font/woff2;base64,{data}) format(\"woff2\");unicode-range:{f['range']}}}")
    return '\n'.join(out)


def icon_uri():
    svg = (ROOT / 'assets/img/icon.svg').read_text()
    return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()


def build(out, version):
    js = ['(function () {\n"use strict";\n']
    for p in ORDER:
        js.append(transform((ROOT / p).read_text(encoding='utf-8'), p))
    js.append('\n})();\n')
    bundle = ''.join(js).replace('</script', '<\\/script')
    css = (ROOT / 'assets/css/app.css').read_text(encoding='utf-8')
    page = f'''<!doctype html>
<html lang="en-AU" data-palette="harbour">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Then and Now</title>
<meta name="description" content="A private, offline guide in five stages to deconstructing and overcoming PTSD: how it works, the steps the best-tested treatments use, and tools for hard moments. Every claim graded for evidence.">
<meta name="theme-color" content="#F2F6F7">
<meta name="color-scheme" content="light dark">
<meta name="generator" content="Then and Now v{version}">
<link rel="icon" href="{icon_uri()}">
<style>
{fonts_css()}
{css}
</style>
</head>
<body>
<a class="skip btn" href="#app" onclick="document.getElementById('app').focus();return false">Skip to content</a>
<div id="chrome"></div>
<main id="app" tabindex="-1"><noscript><div class="card" style="max-width:60ch;margin:3rem auto"><h1>JavaScript is needed</h1>
<p class="muted">Then and Now runs entirely in your browser, with no server. Please turn on JavaScript to use it.</p></div></noscript></main>
<script>
{bundle}
</script>
</body>
</html>
'''
    pathlib.Path(out).write_text(page, encoding='utf-8')
    print(f'wrote {out}: {len(page.encode()) / 1024:.0f} KB')


if __name__ == '__main__':
    args = sys.argv[1:]
    ver = '1'
    if '--version' in args:
        i = args.index('--version'); ver = args[i + 1]; del args[i:i + 2]
    build(args[0] if args else str(ROOT.parent / 'Then and Now.html'), ver)
