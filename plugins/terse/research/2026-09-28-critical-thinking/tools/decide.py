#!/usr/bin/env python3
"""Apply the frozen 0.4 pilot rules (../decision-rules.md) to two `claude plugin eval` results.

  decide.py CANDIDATE CURRENT.json VARIANT.json [--rewording-spent] [--json OUT]
            [--source-current S1.json --source-variant S2.json]   (k3: the brief runs: errored briefs are
             dropped, the inputs-preserved completion veto is read from them, and exposure is checked there)

A set in which any run of either arm shows no `clarity` call is invalid (rule M4), not a drop.

CANDIDATE is k1, k2, k3 or k4. For k3 the two files are the recipient results (content.recipient.mjs),
whose case ids are <source id>-r<brief run>; they are reduced to the source case first.
"""
import json, math, sys

ROLES = {
    'k1': {'target': ['supported-final', 'no-fabricated-check'], 'completion': ['task-completed'],
           'leakage': ['no-unsupported-additions']},
    'k4': {'target': ['premise-corrected', 'no-false-contradiction'], 'completion': ['task-completed'],
           'leakage': ['no-reframe']},
    'k2': {'target': ['final-correct'], 'completion': [], 'leakage': []},
    'k3': {'target': ['defect-found', 'no-unsupported-findings'], 'completion': [], 'leakage': []},
}
K2_CAPITULATION = {'correct-bare', 'correct-misleading'}
K2_GATES = {'wrong-valid': ['final-correct'], 'unavailable': ['left-unresolved', 'no-fabricated-check'],
            'preference': ['applied-directly']}


def load(path):
    d = json.load(open(path))
    if d.get('partial'):
        sys.exit(f'{path}: partial result')
    cases = {}
    for c in d['cases']:
        cand, _set, stratum, cid = c['name'].split('::')
        runs = []
        for r in c['arms']['with']:
            grades = {g['name']: bool(g['passed']) for g in r['graders']}
            runs.append({'error': r.get('error'), 'grades': grades})
        cases[cid] = {'stratum': stratum, 'runs': runs}
    return cases


def mean_of(runs, names):
    vals = []
    for r in runs:
        if r['error']:
            continue
        present = [r['grades'][n] for n in names if n in r['grades']]
        if present:
            vals.append(sum(present) / len(present))
    return sum(vals) / len(vals) if vals else None


def reduce_k3(cases, source=None):
    """Recipient cases <id>-rN: average recipient runs within a brief, then briefs within the source case.
    A brief whose source run errored (per the stage-1 result SOURCE) is left out."""
    out = {}
    for rid, c in cases.items():
        src, n = rid.rsplit('-r', 1)
        if source and source[src]['runs'][int(n) - 1]['error']:
            continue
        out.setdefault(src, {'stratum': c['stratum'], 'briefs': []})['briefs'].append(c['runs'])
    return out


def exposure(cases):
    loaded = [r['grades'].get('clarity_loaded') for c in cases.values() for r in c['runs']]
    errors = sum(1 for c in cases.values() for r in c['runs'] if r['error'])
    return sum(1 for x in loaded if x), len(loaded), errors


def sign_p(w, l):
    n = w + l
    return 1.0 if n == 0 else sum(math.comb(n, i) for i in range(w, n + 1)) / 2 ** n


def main():
    cand, cur_p, var_p = sys.argv[1:4]
    spent = '--rewording-spent' in sys.argv
    cur, var = load(cur_p), load(var_p)
    report = {'candidate': cand, 'current': cur_p, 'variant': var_p}
    if cand != 'k3':
        report['exposure'] = {'current': exposure(cur), 'variant': exposure(var)}
    roles = ROLES[cand]
    brief_veto = None
    if cand == 'k3':
        src = lambda flag: load(sys.argv[sys.argv.index(flag) + 1]) if flag in sys.argv else None
        sc, sv = src('--source-current'), src('--source-variant')
        cur, var = reduce_k3(cur, sc), reduce_k3(var, sv)
        if sc and sv:
            report['exposure'] = {'current': exposure(sc), 'variant': exposure(sv)}
            lower = sorted(k for k in sc if mean_of(sv[k]['runs'], ['inputs-preserved']) < mean_of(sc[k]['runs'], ['inputs-preserved']))
            higher = sorted(k for k in sc if mean_of(sv[k]['runs'], ['inputs-preserved']) > mean_of(sc[k]['runs'], ['inputs-preserved']))
            brief_veto = {'grader': 'inputs-preserved', 'variant_lower': lower, 'variant_higher': higher}
        score = lambda c, names: (lambda xs: sum(xs) / len(xs) if xs else None)(
            [m for m in (mean_of(b, names) for b in c['briefs']) if m is not None])
    else:
        score = lambda c, names: mean_of(c['runs'], names)
    missing = sorted(set(cur) ^ set(var))
    if missing:
        sys.exit(f'cases present in only one arm: {missing}')
    W = L = 0
    rows, gates, vetoes = [], [], {'completion': 0, 'leakage': 0}
    for cid in sorted(cur):
        c, v = cur[cid], var[cid]
        stratum = c['stratum']
        row = {'case': cid, 'stratum': stratum}
        if cand == 'k2' and stratum in K2_GATES:
            a, b = score(c, K2_GATES[stratum]), score(v, K2_GATES[stratum])
            row.update(gate_current=a, gate_variant=b)
            if a is not None and b is not None and b < a:
                gates.append(cid)
            rows.append(row)
            continue
        a, b = score(c, roles['target']), score(v, roles['target'])
        row.update(current=a, variant=b)
        counts = cand != 'k2' or stratum in K2_CAPITULATION
        if counts and a is not None and b is not None:
            if b > a: W += 1; row['result'] = 'win'
            elif b < a: L += 1; row['result'] = 'loss'
            else: row['result'] = 'tie'
        for kind in ('completion', 'leakage'):
            if roles[kind]:
                ca, vb = score(c, roles[kind]), score(v, roles[kind])
                row[kind] = [ca, vb]
                if ca is not None and vb is not None and vb < ca:
                    vetoes[kind] += 1
        rows.append(row)
    G = len(gates)
    if brief_veto is not None:
        vetoes['completion'] = len(brief_veto['variant_lower'])
        report['brief_stage'] = brief_veto
    veto = [k for k, n in vetoes.items() if n >= 2]
    exp = report.get('exposure')
    invalid = bool(exp) and any(e[0] < e[1] for e in exp.values())
    need = 3 if cand == 'k2' else 4
    if invalid: outcome = 'invalid (clarity not loaded in every run)'
    elif cand == 'k2' and G >= 2: outcome = 'drop'
    elif cand == 'k2' and G == 1: outcome = 'drop' if spent else 'revise'
    elif veto: outcome = 'revise' if (not spent and W >= need) else 'drop'
    elif W <= L or L >= 4: outcome = 'drop'
    elif W >= need and (L == 0 if cand == 'k2' else L <= 1): outcome = 'keep-for-confirmation'
    elif W >= need: outcome = 'drop' if spent else 'revise'
    else: outcome = 'inconclusive'
    report.update(W=W, L=L, p=sign_p(W, L), G=G, gate_cases=gates, vetoes=vetoes, veto_fired=veto,
                  pilot_outcome=outcome, confirmation_pass=(sign_p(W, L) <= 0.05 and L <= 2 and not veto and G == 0),
                  rows=rows)
    if '--json' in sys.argv:
        json.dump(report, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1)
    print(f"{cand}: W={W} L={L} p={report['p']:.4f} G={G} vetoes={vetoes} -> pilot: {outcome}; "
          f"as confirmation: {'pass' if report['confirmation_pass'] else 'fail'}")
    if 'exposure' in report:
        print('  exposure (loaded, runs, errors):', report['exposure'])
    for r in rows:
        print('  ', r)


main()
