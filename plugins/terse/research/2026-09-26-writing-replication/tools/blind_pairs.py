#!/usr/bin/env python3
"""Blind pairs for the owner: the same task answered with and without `clarity`.

  blind_pairs.py WITH.jsonl WITHOUT.jsonl OUT_DIR
      takes repeat 1 of each case present in both files, puts the two final texts in random A/B order, writes
      OUT_DIR/pairs.md (the tasks and texts, no labels) and OUT_DIR/key.json (which letter is which arm).
"""
import json, random, sys, os

with_path, without_path, out = sys.argv[1:4]
cases = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'evals', 'clarity-trigger', 'cases.json')))
cases = cases if isinstance(cases, list) else cases.get('cases', cases)
prompt = {c['id']: c['prompt'] for c in cases}


def load(p, arm):
    rows = {}
    for line in open(p):
        x = json.loads(line)
        if x.get('arm') == arm and x.get('repeat') == 1 and x.get('finalText'):
            rows[x['case']] = x['finalText']
    return rows


w, wo = load(with_path, 'with-plugin'), load(without_path, 'without-plugin')
ids = [c for c in prompt if c in w and c in wo]
rng = random.Random(20260927)
rng.shuffle(ids)
key, md = {}, ['# Blind pairs', '',
               'For each task, two answers. Read both and note which one reads better for the person it is for '
               '(A, B, or "same"), and anything either one gets wrong or leaves out. The order is random per pair.', '']
for n, cid in enumerate(ids, 1):
    a_is_with = rng.random() < 0.5
    a, b = (w[cid], wo[cid]) if a_is_with else (wo[cid], w[cid])
    key[str(n)] = {'case': cid, 'A': 'with' if a_is_with else 'without', 'B': 'without' if a_is_with else 'with'}
    md += [f'## Pair {n}', '', '**Task**', '', '> ' + prompt[cid].replace('\n', '\n> '), '',
           '**A**', '', a.strip(), '', '**B**', '', b.strip(), '', '---', '']
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'pairs.md'), 'w').write('\n'.join(md))
json.dump(key, open(os.path.join(out, 'key.json'), 'w'), indent=1)
print(f'{len(ids)} pairs -> {out}/pairs.md; key in {out}/key.json')
