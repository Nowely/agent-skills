"""Search every 2026-09-22 row quote (S1-*, S2-*) in today's saved pages after normalisation.

Normalisation, both sides: HTML entities decoded; markdown emphasis, backticks, backslash escapes,
link targets and list markers removed; curly quotes to straight; en/em dashes and minus to '-';
ellipsis to '...'; whitespace collapsed; case folded. A quote with '...' is split and every
fragment of 4+ words must occur, in order, on one page.
Usage: drift.py OLD_S1 OLD_S2 PAGES_DIR  -> TSV on stdout: id, status, page, quote head
"""
import html, os, re, sys

def norm(s):
    s = html.unescape(s)
    s = re.sub(r'\]\([^)]*\)', ']', s)            # [text](url) -> [text]
    s = re.sub(r'[\[\]]', '', s)
    s = s.replace('\\', '')
    s = re.sub(r'(\*\*|__|\*|`)', '', s)
    s = re.sub(r'(?m)^\s*(?:[-*+]|\d+\.)\s+', ' ', s)  # list markers at line start
    s = re.sub(r'<[^>]+>', ' ', s)
    for a, b in (('‘', "'"), ('’', "'"), ('“', '"'), ('”', '"'),
                 ('–', '-'), ('—', '-'), ('−', '-'), ('…', '...'),
                 (' ', ' ')):
        s = s.replace(a, b)
    s = re.sub(r'\s+', ' ', s)
    return s.strip().casefold()

def rows(path, prefix):
    out = []
    for line in open(path, encoding='utf-8'):
        if not line.startswith('| ' + prefix + '-'):
            continue
        cells = [c.strip() for c in line.rstrip('\n').strip('|').split(' | ')]
        rid = cells[0]
        quoted = [c for c in cells[1:] if c[:1] in '"“']
        q = (quoted[0] if quoted else (cells[2] if len(cells) > 2 else '')).strip()
        if len(q) >= 2 and q[0] in '"“' and q[-1] in '"”':
            q = q[1:-1]
        out.append((rid, q))
    return out

def main():
    s1, s2, pages = sys.argv[1:4]
    texts = {}
    for f in sorted(os.listdir(pages)):
        if f.endswith(('.txt',)):
            texts[f] = norm(open(os.path.join(pages, f), encoding='utf-8', errors='replace').read())
    for rid, q in rows(s1, 'S1') + rows(s2, 'S2'):
        frags = [f.strip(' .') for f in re.split(r'\.\.\.|…|\[\.\.\.\]', norm(q))]
        frags = [f for f in frags if len(f.split()) >= 4] or [norm(q)]
        hit = None
        for name, t in texts.items():
            pos, ok = 0, True
            for fr in frags:
                i = t.find(fr, pos)
                if i < 0:
                    ok = False
                    break
                pos = i + len(fr)
            if ok:
                hit = name
                break
        status = 'present' if hit else 'not-found'
        print('\t'.join([rid, status, hit or '-', q[:90].replace('\t', ' ')]))

main()
