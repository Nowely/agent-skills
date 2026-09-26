// Word counts of the passages the cut ledger names: whitespace-delimited tokens of the quoted sentences,
// the bullet dash not counted. Each sentence must occur in the file it is said to come from.
import fs from "node:fs";
const RUN = "$TMPDIR/terse/runs/20260922-233021-terse-readme";
const text = (f) => fs.readFileSync(`${RUN}/${f}`, "utf8").replace(/\s+/g, " ");
const words = (s) => s.split(" ").filter((x) => x && x !== "-").length;
const P = [
  ["00-original.md", "00:27-29 rethink's rationale", ["It exists because a draft written at ordinary quality was abandoned by its reader at the third section, and nine of his nine objections were about what the document contained, where it sat and how much of it there was.", "None was about phrasing."]],
  ["00-original.md", "00:53 C22", ["It makes documentation truer and easier to answer from."]],
  ["00-original.md", "00:55-56 C25, C26", ["If your text is long because it is wrong, this shortens it.", "If it is long because it explains something hard, it will stay long and start being right."]],
  ["00-original.md", "00:70-72 C34, C35", ["Two of the six failures were lies rather than findability.", "A reader repeated two guarantees from `README.md:5-9` that the code does not make.", "A structural rewrite would have carried both forward in better prose."]],
  ["00-original.md", "00:73-75 C36-C38", ["A reader's own sense of clarity ran against the truth.", "Two who reported no confusion answered wrong; the one who called a section scattered and confusing answered right.", "Neither skill asks a reader whether the text was clear."]],
  ["00-original.md", "00:84-86 C45, C46", ["Two published benchmarks that did run that arm found it large.", "The reference files say so where it matters, and [references/prior-art.md](references/prior-art.md) collects every finding against these numbers."]],
  ["00-original.md", "00:31-34 C12, C13", ["Three writers produce candidates and two judges score them on the failures rather than on taste; the winner then goes through a loop of critics whose lenses do not overlap — the code, the rules, an adversarial reader, a task, a reader's questions — until a round finds nothing new and nothing got worse.", "Every round is kept as its own file."]],
  ["00-original.md", "00:48-49 C20, C21", ["Nothing else is needed — no dependencies, no configuration file, no account anywhere.", "Node 22 or newer if you run the checkout directly."]],
  ["00-original.md", "00:76-78 C39, C40, C41", ["Five published writing standards were put against two unguided controls across ten agents, models hidden from the judges.", "Both controls beat both entries of both standards.", "On the first 116 words, seven of ten agents proposed nothing and the only agent that shortened the passage was a control."]],
  ["00-original.md", "00:19-21 the five causes in plain words", ["the text lied, the answer was nowhere, the true sentence sat where it misleads, it was there and unfindable, or every sentence was true and the sequence left the reader worse off."]],
  ["01-candidate.md", "01:45-46 the placement sentence", ["When you re-audit a temporary candidate, keep it at the same relative location in a copy of its Markdown tree so its links still resolve."]],
  ["03-review.md", "03:101-102 the permission no page grants", ["A writer may reword one or correct it when it is false."]],
  ["03-review.md", "03:75 G4", ["The section below describes this commit, not that one."]],
];
for (const [f, k, ss] of P) {
  const t = text(f);
  for (const s of ss) if (!t.includes(s)) throw new Error(`not in ${f}: ${s.slice(0, 60)}`);
  console.log(String(ss.reduce((a, s) => a + words(s), 0)).padStart(3), " ", k, `(${ss.map(words).join(" + ")})`);
}
