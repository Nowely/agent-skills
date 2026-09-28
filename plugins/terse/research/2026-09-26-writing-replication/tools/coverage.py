#!/usr/bin/env python3
"""Which pages a Codex agent actually read, from its own rollout log.

  coverage.py MAP.tsv OUT_NAME      MAP: agent_id<TAB>P### (one part per agent)

A page counts as read only when its whole text, as it is on disk now, is a substring of one command
output the model received in the agent's own thread (the attempt's threadId from its own report).
A page whose first line (`# P### page NN/MM`) reached the model but whose whole text did not is
`partial` (truncated or read in pieces); the rest are `unread`. Pages are checked against
corpus/measures/corpus-revision.json when it exists: a page whose sha256 differs is reported as
`changed`. Writes measures/coverage/OUT_NAME.json and prints one line per agent and the totals.
"""
import glob, hashlib, json, os, sys

RUN = '/Users/ruliny/.claude/plugins/data/entrust-nowely/orchestrate/-Users-ruliny-Git-agent-skills/2026-09-26-writing-replication'
RESEARCH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARTS = f'{RESEARCH}/corpus/parts'
REVISION = f'{RESEARCH}/corpus/measures/corpus-revision.json'


def _revision():
    try:
        r = json.load(open(REVISION))
    except Exception:
        return {}
    sha = r.get('sha256') or {}
    return {k.split('parts/', 1)[1]: v for k, v in sha.items() if 'parts/' in k}


REV = _revision()


def pages_of(part):
    """A part id (P###), or comma-separated absolute page paths."""
    files = part.split(',') if part.startswith('/') else sorted(glob.glob(f'{PARTS}/{part}/page-*.md'))
    out = []
    for pf in files:
        raw = open(pf, 'rb').read()
        text = raw.decode('utf-8').replace('\r\n', '\n').rstrip('\n')
        rel = pf.split('/parts/', 1)[1] if '/parts/' in pf else None
        changed = bool(REV) and rel is not None and REV.get(rel) not in (None, hashlib.sha256(raw).hexdigest())
        name = rel or os.path.basename(pf)
        out.append((name, text.split('\n', 1)[0].strip(), text, changed))
    return out


def outputs_of(thread):
    files = glob.glob(os.path.expanduser(f'~/.codex/sessions/**/rollout-*-{thread}.jsonl'), recursive=True)
    outs = []
    for f in files:
        for line in open(f, encoding='utf-8'):
            try:
                e = json.loads(line)
            except Exception:
                continue
            p = e.get('payload') or {}
            if p.get('type') in ('custom_tool_call_output', 'function_call_output'):
                o = p.get('output')
                if isinstance(o, list):
                    o = ''.join(x.get('text', '') for x in o if isinstance(x, dict))
                if isinstance(o, str):
                    outs.append(o.replace('\r\n', '\n'))
                    # a model that prints JSON.stringify(result) gets the command output JSON-escaped
                    i = o.find('{"')
                    if i >= 0:
                        try:
                            inner = json.JSONDecoder().raw_decode(o[i:])[0]
                            if isinstance(inner, dict) and isinstance(inner.get('output'), str):
                                outs.append(inner['output'].replace('\r\n', '\n'))
                        except ValueError:
                            pass
    return outs, len(files)


def main(mapfile, name):
    res = []
    for line in open(mapfile):
        if not line.strip() or line.startswith('#'):
            continue
        aid, part = line.split()[:2]
        try:
            thread = json.load(open(f'{RUN}/{aid}/report.json')).get('threadId')
        except Exception:
            thread = None
        outs, nfiles = outputs_of(thread) if thread else ([], 0)
        pages = pages_of(part)
        read, partial, unread, changed = [], [], [], []
        for fn, first, text, ch in pages:
            if ch:
                changed.append(fn)
            if any(text in o for o in outs):
                read.append(fn)
            elif any(first in o for o in outs):
                partial.append(fn)
            else:
                unread.append(fn)
        full = len(read) == len(pages) and len(pages) > 0 and not changed
        res.append(dict(agent=aid, part=part, thread=thread, rollout_files=nfiles, pages=len(pages),
                        read=read, partial=partial, unread=unread, changed=changed, full=full))
        print(f"{aid}\t{part if not part.startswith('/') else 'pages-list'}\tpages={len(pages)}\tread={len(read)}\tpartial={len(partial)}\tunread={len(unread)}"
              f"\tchanged={len(changed)}\t{'FULL' if full else 'NOT-FULL'}")
    os.makedirs(f'{RESEARCH}/measures/coverage', exist_ok=True)
    json.dump(res, open(f'{RESEARCH}/measures/coverage/{name}.json', 'w'), ensure_ascii=False, indent=1)
    print(f"TOTAL agents={len(res)} full={sum(r['full'] for r in res)} pages={sum(r['pages'] for r in res)} "
          f"read={sum(len(r['read']) for r in res)} partial={sum(len(r['partial']) for r in res)} "
          f"unread={sum(len(r['unread']) for r in res)} changed={sum(len(r['changed']) for r in res)}")


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
