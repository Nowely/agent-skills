"""Build only this fixture's artifacts; no network or external dependencies."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent
LOGS = ROOT / "logs"
LOGS.mkdir(exist_ok=True)
ENV = {**os.environ, "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": "/dev/null",
       "GIT_AUTHOR_NAME": "Fixture Author", "GIT_AUTHOR_EMAIL": "fixture@example.invalid",
       "GIT_COMMITTER_NAME": "Fixture Author", "GIT_COMMITTER_EMAIL": "fixture@example.invalid"}


def run(args, cwd):
    return subprocess.run(args, cwd=cwd, env=ENV, text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def checked(args, cwd):
    result = run(args, cwd)
    if result.returncode:
        raise RuntimeError(f"{args}: {result.stdout}")
    return result.stdout.strip()


shutil.copy2(ROOT / "base/package.json", ROOT / "head/package.json")
shutil.copy2(ROOT / "base/test/round.test.js", ROOT / "head/test/round.test.js")
for label in ["base", "head"]:
    result = run(["node", "--test"], ROOT / label)
    (LOGS / f"{label}-tests.log").write_text(result.stdout)
    assert result.returncode == 0, f"{label} tests failed"

source = (ROOT / "head/src/round.js").read_text()
seal_guard = "      if (sealed) throw new Error('ROUND_SEALED');\n"
stale_guard = "      if (expectedRevision !== revision) throw new Error('STALE_REVISION');\n"
unknown_guard = "      if (!tables.has(table)) throw new Error('UNKNOWN_TABLE');\n"
occupied_guard = """      if ([...receipts.values()].some(receipt => receipt.table === table)) {
        throw new Error('TABLE_RECORDED');
      }
"""
score_guard = """      if (![home, away].every(score => Number.isInteger(score) && score >= 0 && score <= 99) || home === away) {
        throw new Error('INVALID_SCORE');
      }
"""
replay = """      const previous = receipts.get(id);
      if (previous) {
        if (previous.table !== table || previous.home !== home || previous.away !== away) {
          throw new Error('ID_REUSED');
        }
        return previous;
      }
"""
publication = """      persist(receipt);
      receipts.set(id, receipt);
      revision = receipt.revision;
"""
mutations = [
    ("drop-replay", replay, ""),
    ("seal-before-replay", replay + seal_guard, seal_guard + replay),
    ("drop-seal-guard", seal_guard, ""),
    ("drop-stale-guard", stale_guard, ""),
    ("unknown-before-stale", stale_guard + unknown_guard, unknown_guard + stale_guard),
    ("score-before-unknown", unknown_guard + occupied_guard + score_guard,
     score_guard + unknown_guard + occupied_guard),
    ("score-before-occupied", occupied_guard + score_guard, score_guard + occupied_guard),
    ("drop-unknown-guard", unknown_guard, ""),
    ("drop-table-uniqueness", occupied_guard, ""),
    ("drop-score-guard", score_guard, ""),
    ("ignore-replay-table", "previous.table !== table || ", ""),
    ("ignore-replay-home", "previous.home !== home || ", ""),
    ("ignore-replay-away", " || previous.away !== away", ""),
    ("include-revision-in-replay", "if (previous.table !== table",
     "if (expectedRevision !== previous.revision || previous.table !== table"),
    ("append-on-replay", "        return previous;", "        persist(previous);\n        return previous;"),
    ("publish-before-append", publication,
     "      receipts.set(id, receipt);\n      revision = receipt.revision;\n      persist(receipt);\n"),
    ("wrap-adapter-exception", "      persist(receipt);",
     "      try { persist(receipt); } catch (error) { throw new Error(error.message); }"),
    ("skip-revision-number", "revision: revision + 1", "revision: revision + 2"),
    ("seal-increments-revision", "      sealed = true;", "      sealed = true;\n      revision += 1;"),
    ("seal-does-nothing", "      sealed = true;", ""),
    ("allow-fractions", "Number.isInteger(score)", "Number.isFinite(score)"),
    ("allow-negative-score", " && score >= 0", ""),
    ("allow-large-score", " && score <= 99", ""),
    ("allow-tie", " || home === away", ""),
    ("mutable-returned-receipt",
     "Object.freeze({ id, table, home, away, revision: revision + 1 })",
     "({ id, table, home, away, revision: revision + 1 })"),
    ("drop-snapshot-results",
     "[...receipts.values()].map(receipt => ({ ...receipt }))", "[]"),
]
outcomes = []
with (LOGS / "mutants.log").open("w") as log:
    for name, old, new in mutations:
        assert source.count(old) == 1, (name, source.count(old))
        with tempfile.TemporaryDirectory(prefix="trial-", dir=ROOT / "private") as folder:
            trial = Path(folder)
            shutil.copytree(ROOT / "head", trial, dirs_exist_ok=True)
            (trial / "src/round.js").write_text(source.replace(old, new))
            parsed = run(["node", "--check", "src/round.js"], trial)
            assert parsed.returncode == 0, f"{name} is not a valid negative mutant"
            result = run(["node", "--test", "test/round.test.js", "test/acceptance.test.js"], trial)
            killed = result.returncode != 0 and "# fail 0\n" not in result.stdout
            log.write(f"\nMUTANT {name}: {'KILLED' if killed else 'SURVIVED'}\n{result.stdout}")
            outcomes.append({"name": name, "killed": killed, "exit": result.returncode})
assert all(item["killed"] for item in outcomes), outcomes
(LOGS / "mutants.json").write_text(json.dumps(outcomes, indent=2) + "\n")

with tempfile.TemporaryDirectory(prefix="scope-", dir=ROOT / "private") as folder:
    trial = Path(folder)
    shutil.copytree(ROOT / "head", trial, dirs_exist_ok=True)
    convenience = """
    receipt(id) {
      return receipts.get(id) ?? null;
    },
"""
    assert source.count(convenience) == 1
    (trial / "src/round.js").write_text(source.replace(convenience, ""))
    (trial / "test/receipt.test.js").unlink()
    result = run(["node", "--test"], trial)
    (LOGS / "optional-removal.log").write_text(result.stdout)
    assert result.returncode == 0

repo = ROOT / "reviewer"
assert not repo.exists(), "Do not overwrite an existing reviewer repository"
shutil.copytree(ROOT / "base", repo)
checked(["git", "init", "--initial-branch=main", "--template="], repo)
checked(["git", "config", "core.hooksPath", "/dev/null"], repo)
checked(["git", "add", "."], repo)
checked(["git", "-c", "commit.gpgsign=false", "commit", "-m", "Initial score desk"], repo)
base_commit = checked(["git", "rev-parse", "HEAD"], repo)
shutil.copytree(ROOT / "head", repo, dirs_exist_ok=True)
checked(["git", "add", "."], repo)
checked(["git", "-c", "commit.gpgsign=false", "commit", "-m", "Extend round submission protocol"], repo)
head_commit = checked(["git", "rev-parse", "HEAD"], repo)
diff = checked(["git", "diff", "--binary", "HEAD~1", "HEAD"], repo) + "\n"
(ROOT / "inputs.diff").write_text(diff)
(ROOT / "commits.json").write_text(json.dumps({"base": base_commit, "head": head_commit}, indent=2) + "\n")
assert checked(["git", "rev-list", "--count", "HEAD"], repo) == "2"
assert checked(["git", "status", "--porcelain"], repo) == ""
assert checked(["git", "remote"], repo) == ""
assert checked(["git", "for-each-ref", "--format=%(refname)"], repo) == "refs/heads/main"
tracked = checked(["git", "ls-files"], repo).splitlines()
expected = sorted(str(path.relative_to(ROOT / "head")) for path in (ROOT / "head").rglob("*") if path.is_file())
assert tracked == expected
for rel in tracked:
    assert (repo / rel).read_bytes() == (ROOT / "head" / rel).read_bytes()
    base_path = ROOT / "base" / rel
    if base_path.exists():
        blob = subprocess.run(["git", "show", f"{base_commit}:{rel}"], cwd=repo,
                              env=ENV, check=True, stdout=subprocess.PIPE).stdout
        assert blob == base_path.read_bytes()
reviewer_test = run(["node", "--test"], repo)
(LOGS / "reviewer-tests.log").write_text(reviewer_test.stdout)
assert reviewer_test.returncode == 0
verification = {
    "node": checked(["node", "--version"], ROOT),
    "git": checked(["git", "--version"], ROOT),
    "commits": [base_commit, head_commit],
    "commitCount": 2, "status": "clean", "refs": ["refs/heads/main"], "remotes": [],
    "reviewerFiles": tracked, "reviewerMatchesHead": True, "baseCommitMatchesBase": True,
    "negativeMutantsKilled": len(outcomes), "negativeMutantsTotal": len(outcomes),
    "optionalRemovalPasses": True,
    "sha256": {rel: hashlib.sha256((repo / rel).read_bytes()).hexdigest() for rel in tracked},
}
(LOGS / "verification.json").write_text(json.dumps(verification, indent=2) + "\n")
paths = sorted(path for path in ROOT.rglob("*") if path.is_file()
               and ".git" not in path.relative_to(ROOT).parts
               and path.name != "manifest.sha256")
(ROOT / "manifest.sha256").write_text("".join(
    f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.relative_to(ROOT)}\n" for path in paths))
for line in (ROOT / "manifest.sha256").read_text().splitlines():
    digest, rel = line.split("  ", 1)
    assert hashlib.sha256((ROOT / rel).read_bytes()).hexdigest() == digest
print(json.dumps(verification, indent=2))
print(f"Verified {len(paths)} SHA256 manifest entries.")
