#!/usr/bin/env python3
"""Pages of every human turn for the top-down gap search.

  mkhumanpages.py      writes analysis/human-pages/page-NNN.md (<= 18,000 characters each) and prints the count

Each user turn (role user in corpus/turns.jsonl, file order within a session, sessions in index order) comes whole,
headed `## <turn id> · <dialog_id>`, preceded by the first and last 400 characters of the nearest earlier
assistant or assistant-tool turn of the same session, and followed by a line saying which summary episodes
already use it as their user_turn. A turn longer than a page is split with a continuation mark.
"""
import json, os

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f'{R}/analysis/human-pages'
LIMIT = 18000

turns = [json.loads(l) for l in open(f'{R}/corpus/turns.jsonl')]
eps = {}
for l in open(f'{R}/episodes/episodes.jsonl'):
    e = json.loads(l)
    eps.setdefault(e['user_turn'], []).append(e['id'])

blocks = []
last_asst = {}
for t in turns:
    s = t['id'].split('-')[0]
    if t['role'] in ('assistant', 'assistant-tool'):
        last_asst[s] = t
        continue
    if t['role'] != 'user':
        continue
    prev = last_asst.get(s)
    ctx = ''
    if prev:
        x = prev['text']
        ctx = x if len(x) <= 800 else x[:400] + '\n[…]\n' + x[-400:]
        ctx = f"> предыдущий текст ассистента ({prev['id']}, {prev['role']}):\n> " + ctx.replace('\n', '\n> ') + '\n\n'
    mark = f"в сводке: {', '.join(eps[t['id']])}" if t['id'] in eps else 'в сводке: нет'
    head = f"## {t['id']} · {t.get('dialog_id', '')}\n\n"
    body = t['text']
    room = LIMIT - 400 - len(head) - len(ctx) - len(mark)
    if len(body) <= room:
        blocks.append(head + ctx + body + '\n\n' + mark + '\n\n')
    else:
        chunks = [body[i:i + LIMIT - 1200] for i in range(0, len(body), LIMIT - 1200)]
        for k, c in enumerate(chunks, 1):
            h = f"## {t['id']} · {t.get('dialog_id', '')} (продолжение {k}/{len(chunks)})\n\n"
            blocks.append(h + (ctx if k == 1 else '') + c + '\n\n' + (mark + '\n\n' if k == len(chunks) else ''))

pages, cur = [], ''
for b in blocks:
    if cur and len(cur) + len(b) > LIMIT - 60:
        pages.append(cur)
        cur = ''
    cur += b
if cur:
    pages.append(cur)
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))
for i, p in enumerate(pages, 1):
    open(f'{OUT}/page-{i:03d}.md', 'w').write(f'# human page {i:03d}/{len(pages):03d}\n\n' + p)
n_user = sum(1 for t in turns if t['role'] == 'user')
print(f'user_turns={n_user} blocks={len(blocks)} pages={len(pages)} max_chars={max(len(p) for p in pages) + 30}')
