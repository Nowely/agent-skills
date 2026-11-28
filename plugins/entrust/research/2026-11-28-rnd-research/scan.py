#!/usr/bin/env python3
"""Which files and sections of rnd did each recorded session open? Usage: scan.py <out.json> <session folder>...  (each folder holds meta, turns/*.jsonl and the skills/rnd copy the session read)."""
import json, glob, os, re, sys, collections

ROOTS = sys.argv[2:]
SK = "skills/rnd/"

def sections(path):
    """[(start_line, title)] of ## headings in a file, 1-based."""
    out = [(1, "(top)")]
    try:
        for i, l in enumerate(open(path, encoding="utf8"), 1):
            if l.startswith("## "): out.append((i, l[3:].strip()))
    except OSError: pass
    return out

def hit_sections(secs, start, end):
    names = []
    for k, (s, t) in enumerate(secs):
        e = secs[k + 1][0] - 1 if k + 1 < len(secs) else 10**9
        if s <= end and e >= start: names.append(t)
    return names

rows = []
for root in ROOTS:
    for d in sorted(glob.glob(root + "/*/")):
        name = os.path.basename(d.rstrip("/"))
        turns = sorted(glob.glob(d + "turns/*.jsonl"))
        if not turns: continue
        meta = {}
        try:
            for l in open(d + "meta"): k, _, v = l.strip().partition("="); meta[k] = v
        except OSError: pass
        opened = collections.defaultdict(set)
        for t in turns:
            for line in open(t, encoding="utf8", errors="replace"):
                try: ev = json.loads(line)
                except ValueError: continue
                msg = ev.get("message") or {}
                if ev.get("type") != "assistant" or not isinstance(msg.get("content"), list): continue
                for c in msg["content"]:
                    if c.get("type") != "tool_use": continue
                    inp = c.get("input") or {}
                    tool = c.get("name")
                    targets = []
                    if tool == "Read" and SK in str(inp.get("file_path", "")):
                        off = int(inp.get("offset") or 1); lim = inp.get("limit")
                        targets.append((inp["file_path"], off, off + int(lim) - 1 if lim else 10**9))
                    elif tool == "Grep" and SK in str(inp.get("path", "")):
                        targets.append((inp["path"], 0, -1))  # a search, not a read
                    elif tool == "Bash" and SK in str(inp.get("command", "")):
                        for m in re.finditer(r"(\S*" + re.escape(SK) + r"\S*\.md)", inp["command"]):
                            cmd = inp["command"]
                            kind = "grep" if re.search(r"\bgrep\b|\brg\b", cmd) else "read"
                            targets.append((m.group(1).strip("'\""), 1, 10**9) if kind == "read" else (m.group(1), 0, -1))
                    for fp, s, e in targets:
                        rel = fp.split(SK, 1)[1]
                        if e < 0: opened[rel].add("(searched)"); continue
                        local = os.path.join(d, "skills/rnd", rel)
                        for n in hit_sections(sections(local), s, e): opened[rel].add(n)
        rows.append((name, meta.get("arm", "?"), meta.get("kind", "?"), {k: sorted(v) for k, v in opened.items()}))

json.dump(rows, open(sys.argv[1], "w"), indent=1)
by_file = collections.Counter(); by_sec = collections.Counter(); n = 0
for name, arm, kind, opened in rows:
    if not opened and arm.startswith("N"): continue
    n += 1
    for f, secs in opened.items():
        by_file[f] += 1
        for s in secs: by_sec[(f, s)] += 1
print("sessions with any rnd read:", sum(1 for r in rows if r[3]), "of", len(rows))
for name, arm, kind, opened in rows:
    print(f"{name:28} {arm:3} {kind:7} files={len(opened)} " + "; ".join(f"{f}" for f in sorted(opened)))
print("\nfile -> sessions that opened it")
for f, c in by_file.most_common(): print(f"  {c:3}  {f}")
print("\nsection -> sessions that opened it")
for (f, s), c in sorted(by_sec.items(), key=lambda x: (-x[1], x[0])): print(f"  {c:3}  {f} :: {s}")
