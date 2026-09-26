# The benchmark: the skills against a bare agent, with a human best practice as the reference

The question, the owner's, 2026-09-24: take a popular repository whose README counts as best practice,
write two READMEs for it without looking at the existing one — one by a plain agent, one with these
skills — keep the repository's own README as the reference, and then say where ours came out better or
worse, and why. Nothing in the record measures the whole chain — `rethink` and then `rewrite` — against
a bare agent: the 2026-09-10 bake-off compared prompts on one README, judged by models
(`plugins/terse/research/2026-09-10-chain/`), and every run since was on this plugin's own README, judged by its owner.

## The premises, the owner's, 2026-09-24

1. **The model's memory of the genre is the baseline, not a threat.** No probe for whether the model can
   recite the reference: if what a model writes from memory were good, this plugin would not exist; what
   it writes is slop, and the bare agent's README is that slop measured.
2. **The reference keeps what only its maintainers know.** Nothing is subtracted for it and nothing is
   reproduced on purpose; the three texts are compared as they are, and **the owner is the final judge**.
3. **The stake.** If the bare agent's README beats the skills' on the owner's read, the skills fail their
   main task; the reflection then says what to change, and the result stands in the record either way.

## The three texts

- **A, the bare agent.** One Claude Opus agent, the code snapshot, one prompt and one attempt, no rules,
  no skill page, no survey, no revision. The prompt, verbatim: *Write the README for the repository at
  `<SNAPSHOT>`. Read whatever you need there. Write it to `<OUT>/README.md` and return the path.*
- **B, the skills.** `/terse:rewrite` on its one path — the writer, every critic at once, one repair —
  driven by the stand-in user below and never by a reader of C.
- **C, the reference.** The repository's own `README.md` at the snapshot commit, untouched.

## The snapshot, and who sees what

- One commit, named in the record; a clone at that commit under `$TMPDIR`; the root `README.md` removed
  from what A and B read and kept aside as C. Everything else stays and is the same for both — the
  sub-packages' READMEs, the changelog, the manifests: the code's own documentation, not the reference.
- B's genre scout, where one runs, excludes the target repository, its forks and mirrors and any page
  that quotes its README; a scout who lands on one drops it and says so in the report.
- No writer, critic or judge of A or B reads C before the ranking. The coordinator reads C only for its
  audit and for the scoring, after A and B are frozen with their SHA-256 in the record; where the
  coordinator has seen C before the run, the record says so and what was seen.
- A judge or a reader who recognises one of the texts says so in its report; the texts are not disguised.

## The stand-in user

The pages ask their user, in one message, for the purpose, what the text must and must not say, and the
word on the run. In the benchmark one Claude Opus agent stands in, kept for the
whole of B: it has read the snapshot and never C, answers what the pages ask from the snapshot's own
words — the manifests, the descriptions the code carries — and takes every default a page offers, saying
which. Its answers are recorded verbatim. The rules of [rules.md](rules.md) apply as for every text: the
stand-in answers the run's questions and never stands in for the owner's accumulated feedback.

## The rulers, written before the run

Every text gets the same measurements; where a ruler can be blind it is.

1. **Truth.** The audit's truth pass ([truth.md](truth.md)) on each
   text against the snapshot: claims confirmed, refuted, unconfirmed. On C this is the audit run on a
   best practice: whether the skill finds a real defect in one.
2. **Answerability.** One question key from the reader profile and the code
   ([measure.md](../skills/audit/references/measure.md)), written by an agent that has read none of the
   three texts; fresh readers, one per question per text, and a no-document arm; three trials per text,
   the flips reported with the counts.
3. **Tasks.** The audit's two task readers per text, in an isolated profile, from the text alone:
   achieved, partly, not.
4. **Form.** The genre's order and sub-blocks from B's survey applied to all three; `rule1.mjs`,
   `dup.mjs` with the plan's concepts, `sections.mjs`; lens 2's counts. The first two left the plugin
   in 0.2.0 and are in the tag `terse@0.1.1`.
5. **Blind ranking.** Three judges — Claude Fable, Codex Astra, Claude Opus — on the bake-off's judging
   sheet (`bake-off.md` in the tag `terse@0.1.1`), the texts shuffled, one reason per rank, a veto where
   the sheet gives one.
6. **The owner's read.** The three texts in a random order; the owner ranks them, says which they would
   send and why, verbatim into the record. This is the verdict; the rulers above explain it.
7. **Cost.** Tokens and minutes per text, agents by count and model.

The hypotheses, so the reflection is not fitted to the result: **H1**, B has fewer refuted claims than A
and than C; **H2**, C ranks first on the owner's read; **H3**, A is not behind B on form. H1 false means
the truth pass does not carry into a text written from a plan; H2 false is the plugin's best result;
H3 true with H1 true says the skills earn their cost on truth, not on prose; and A above B on the owner's
read is premise 3.

## The reflection

Per ruler, which text won and by what, quoted; what C carries that the snapshot does not contain, listed
and set aside as the maintainers' knowledge; what B has that C lacks; what A did that B should have; the
changes to the pages, each a proposal with its check; then a second repository, in another genre, whose
README the owner has not read.

## What this does not measure

One repository, one A: a bare agent's variance across attempts is unmeasured, and one trial of the owner's
read is one trial. A repository the owner named as an exemplar makes their read not blind to C, which the
record says. Human readers are not measured; the readers are models, as everywhere on these pages.

## The record

`plugins/terse/research/<date>-terse-benchmark-<repo>/`: a README with the result, `rounds.md`, the snapshot commit,
every prompt, A, B and C as frozen with their SHA-256, the audits, the readers' and task readers' returns,
the judges' reports, the owner's read verbatim, the costs. The result also goes into
[measurements.md](measurements.md) as a dated entry.

## Results

**2026-09-24, sharpdeveye/maestro** (`plugins/terse/research/2026-09-24-terse-benchmark-maestro/`). On the owner's blind
read: C, the repository's own README, first; B, the skills, second, at parity with C on a quick read; A, the
bare agent, third, for its formatting and wordiness. Three model judges put A first twice and C last three
times; the owner did the opposite at both ends. Refuted claims: A 12 of 121, B 11 of 69, C 25 of 105.
Readers answered 7 of 7 questions from A and from B, 3 of 7 from C, 1 of 7 with no document. B took
6 h 38 min against A's 14 minutes. The owner's second read: B still loses to C on formatting — C says what
it is, lists its advantages and gives a Quick start of install and first use — and B carried none of the
feedback the owner gave on this plugin's own README, because the run left the owner's words out by this
page's rule. That rule is withdrawn: the stand-in user answers the questions of the run, and
[rules.md](rules.md) applies as it does for every text.
