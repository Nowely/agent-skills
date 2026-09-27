#!/usr/bin/env python3
"""Codex agents in batches, no wrappers.

  batch.py new  TSV            TSV: id<TAB>prompt-file; writes each prompt through the launcher's --new
  batch.py run  IDS [-P 12] [--log NAME]
                               launch-only runs, at most P at once; one line per agent, then totals;
                               the per-agent table also goes to measures/batches/NAME.tsv
  batch.py status IDS          the status line of each agent, without launching
"""
import json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

LAUNCHER = '/Users/ruliny/.claude/plugins/cache/nowely/entrust/0.20.0/skills/codex/scripts/agent-run.mjs'
RUN = '/Users/ruliny/.claude/plugins/data/entrust-nowely/orchestrate/-Users-ruliny-Git-agent-skills/2026-09-26-writing-replication'
RESEARCH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = dict(os.environ, CLAUDE_PLUGIN_DATA='/Users/ruliny/.claude/plugins/data/entrust-nowely')


def report_path(i):
    return f'{RUN}/{i}/report.json'


def row(i):
    p = report_path(i)
    try:
        d = json.load(open(p))
    except Exception:
        return dict(id=i, exit='missing', turn='', tokens=0, cached=0, used='', wall=0, n_episodes='', status='')
    tu = ((d.get('tokenUsage') or {}).get('total') or {})
    aj = d.get('answerJson') or {}
    rl = (d.get('rateLimits') or {}).get('primary') or {}
    return dict(id=i, exit=d.get('exitCode'), turn=d.get('turnStatus'), tokens=tu.get('totalTokens', 0),
                cached=tu.get('cachedInputTokens', 0), used=rl.get('usedPercent', ''),
                wall=round(((d.get('timing') or {}).get('wallMs') or 0) / 1000),
                n_episodes=len(aj.get('episodes', [])) if isinstance(aj.get('episodes'), list) else '',
                status=aj.get('status', ''))


def ids_from(path):
    return [l.strip() for l in open(path) if l.strip() and not l.startswith('#')]


def cmd_new(tsv):
    for line in open(tsv):
        if not line.strip():
            continue
        i, pf = line.rstrip('\n').split('\t')
        r = subprocess.run(['node', LAUNCHER, '--new', '--report-file', report_path(i)],
                           stdin=open(pf), capture_output=True, text=True, env=ENV)
        print(i, 'ok' if r.returncode == 0 else f'FAIL {r.returncode} {r.stderr.strip()[:200]}')


def launch(i):
    t0 = time.time()
    p = subprocess.run(['node', LAUNCHER, '--report-file', report_path(i)], capture_output=True, text=True, env=ENV)
    r = row(i)
    r['launcher_rc'] = p.returncode
    try:
        fresh = os.path.getmtime(report_path(i)) >= t0 - 1
    except OSError:
        fresh = False
    if not fresh:
        r['exit'] = 'stale-or-missing'
    elif p.returncode != (r['exit'] if isinstance(r['exit'], int) else -1):
        r['exit'] = f"mismatch(launcher={p.returncode},report={r['exit']})"
    print(f"{i}\texit={r['exit']}\tturn={r['turn']}\ttokens={r['tokens']}\tep={r['n_episodes']}\tused%={r['used']}\twall={round(time.time()-t0)}s", flush=True)
    return r


def cmd_run(ids, P, log):
    with ThreadPoolExecutor(P) as ex:
        rows = list(ex.map(launch, ids))
    ok = sum(1 for r in rows if r['exit'] == 0)
    tok = sum(r['tokens'] for r in rows)
    print(f'TOTAL agents={len(rows)} exit0={ok} tokens={tok} cached={sum(r["cached"] for r in rows)} max_used%={max([r["used"] for r in rows if r["used"] != ""] or [""])}')
    if log:
        os.makedirs(f'{RESEARCH}/measures/batches', exist_ok=True)
        with open(f'{RESEARCH}/measures/batches/{log}.tsv', 'w') as f:
            keys = list(rows[0].keys()) if rows else []
            f.write('\t'.join(keys) + '\n')
            for r in rows:
                f.write('\t'.join(str(r[k]) for k in keys) + '\n')


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == 'new':
        cmd_new(a[1])
    elif a[0] == 'run':
        P = int(a[a.index('-P') + 1]) if '-P' in a else 12
        log = a[a.index('--log') + 1] if '--log' in a else None
        cmd_run(ids_from(a[1]), P, log)
    elif a[0] == 'status':
        for i in ids_from(a[1]):
            print(row(i))
