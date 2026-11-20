# Protocol for the real-card pair, third version

Use the question, inputs, run order, caps, judging and reporting in
[the second protocol](07-pair-protocol.md). Replace its product-clone and access checks with the procedure below
before launching either worker. This revision records preparation only. The pair has yet to run.

## Product baseline

The coordinator prepares each arm from the same immutable base commit. In an empty directory, fetch only that
commit and its tree through the Git file transport. A local clone can copy the source object store, including
later submissions, even after its remote is removed.

Set `source` to the product repository's absolute path, `base` to the full base commit ID and `arm` to a new
directory. Run in Bash with the coordinator's access. Keep this preparation log outside the worker environment.

```bash
set -eu
git init -q "$arm"
git -C "$arm" fetch -q --depth=1 --no-tags --no-recurse-submodules "file://$source" "$base"
git -C "$arm" checkout -q --detach FETCH_HEAD
test "$(git -C "$arm" rev-parse HEAD)" = "$base"
test "$(git -C "$arm" rev-list --count HEAD)" = 1
test -z "$(git -C "$arm" remote)"
test ! -e "$arm/.git/objects/info/alternates"
diff <(git -C "$arm" rev-list --objects --no-object-names HEAD | LC_ALL=C sort) \
     <(git -C "$arm" cat-file --batch-all-objects --batch-check='%(objectname)' | LC_ALL=C sort)
rm "$arm/.git/FETCH_HEAD"
```

The object lists must agree before either worker starts. Also verify that the released commit and a known
later-only blob each fail `git -C "$arm" cat-file -e "$oid"`. Both working trees must match the base. Give the
workers only the approved design inputs and consumer context. The skill arm also gets the installed skill.

## Worker access

An isolated Git history proves what is in the product checkout. On a shared filesystem a worker may still read
the original repository, the other arm, the judge, research, caches or transcripts. Use separate read-restricted
worker environments with only the arm, its approved inputs and tools mounted. Verify from **inside each worker**
that known files in the source checkout, judge and other arm are unreadable, including through symlinks and shared
mounts. Record which paths and service routes were reachable. A common Figma seat still shares service state and
rate limits as described in the second protocol. If filesystem isolation cannot be enforced, record that answer
access was possible and report the run as non-blind.
