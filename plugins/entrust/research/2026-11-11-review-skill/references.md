# References

Read after [the second Terra round](rounds.md#round-17-terra-round-2), to find methods for the next draft instead of one more rule for the fault a round happened to show. "Checked" means the claim was read on a page this pass found; "recalled" means it is the author's memory of a well-known source and was not opened.

## What a review finds

| Source | What it says | Basis |
|---|---|---|
| Mäntylä and Lassenius, [What Types of Defects Are Really Discovered in Code Reviews?](https://mmantyla.github.io/wiki/What+Types+of+Defects+Are+Really+Discovered+in+Code+Reviews%253F.html), IEEE TSE 2009 | Of 388 defects in nine industrial reviews and 371 in 23 student reviews, about 75% do not affect visible function: they make the code easier to understand and change. A study of open-source systems, [Beller et al., MSR 2014](https://microsoft.com/en-us/research/wp-content/uploads/2015/05/PID3556473.pdf), reports the same 75 to 25 split. | checked, abstract and the author's page |
| Bacchelli and Bird, [Expectations, Outcomes, and Challenges of Modern Code Review](https://2013.icse-conferences.org/content/expectations-outcomes-and-challenges-modern-code-review.html), ICSE 2013 | Finding defects is the stated reason to review; the outcomes are less about defects than expected, and understanding the change is the reviewer's main difficulty. | checked, abstract |
| Bosu, Greiler and Bird, [Characteristics of Useful Code Reviews](https://core.ac.uk/download/357402458.pdf), MSR 2015 | A comment counts as useful when it leads to a change that would not have been made otherwise; about a third of the comments studied at Microsoft were not. | checked, summaries |
| Google, [What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html) | Design comes first. Over-engineering is code "more generic than it needs to be"; the reviewer asks for the problem that needs solving now, and the future one "once it arrives". | checked, the page |

## How a reader finds it

| Source | What it says | Basis |
|---|---|---|
| Basili and Selby, [Comparing the Effectiveness of Software Testing Strategies](https://ifsq.org/work-basili-1987.html), IEEE TSE 1987 | Among 32 professional programmers, code reading by stepwise abstraction, in which the reader writes what the code does from the bottom up and compares that with the specification, found more faults, and at a higher rate, than functional or structural testing, interface faults above all. Among 42 advanced students the techniques did not differ. | checked, abstract |
| Laitenberger, El Emam and Harbich, [perspective-based reading of code](https://publica.fraunhofer.de/handle/publica/199594) | Three studies with 60 professional developers at Bosch Telecom: reading from an assigned perspective, producing something as one reads, found more than reading against a checklist. On design documents other studies found no difference. | checked, abstract |
| Gonçalves, Fregnan, Baum, Schneider and Bacchelli, [Do explicit review strategies improve code review performance?](https://link.springer.com/10.1007/s10664-022-10123-8), EMSE 2022 | Ad hoc review against a checklist and a guided checklist: no strong relation between the guidance given and review performance. The guided checklist helped on a small change and not on a complex one, where it limits the reviewer's own approach. Most participants were novices. | checked, abstract |
| Kazman et al., SAAM, in [Evaluating Software Architectures](https://www.informit.com/store/evaluating-software-architectures-methods-and-case-9780201704822) | Modifiability is judged with change scenarios: each is walked through the structure, and the components it would change are listed. Scenarios of different kinds that meet in one component show a component that mixes concerns; one scenario that touches many shows a concern that is scattered. | checked for the method's steps; the two readings of the result are recalled |
| Parnas, [On the Criteria To Be Used in Decomposing Systems into Modules](https://dl.acm.org/doi/10.1145/361598.361623), CACM 1972 | A module hides one decision that may change. Cutting a system along the steps of its processing gives modules that all change together. | recalled |
| Hickey, [Simple Made Easy](https://www.infoq.com/presentations/Simple-Made-Easy/), 2011 | Simple means not interleaved: one role, one concept. Things that change for different reasons and are braided together are the complexity; size is not. | recalled |
| Meyer, Design by Contract, in [Object-Oriented Software Construction](https://www.eecs.yorku.ca/course_archive/2014-15/F/3311/slides/15-DesignContract.pdf) | A contract gives each check to one side. The non-redundancy principle: the body of a routine never tests its own precondition, which is the opposite of defensive programming. | checked, lecture notes quoting the principle; the book was not opened |
| King, [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/), 2019 | Check an input once, at the boundary, into a value that cannot be wrong afterwards; code downstream that checks again shows a boundary that did not do its work. | recalled |

## How a model's review is kept true

| Source | What it says | Basis |
|---|---|---|
| Anthropic, [Code Review plugin](https://claude.com/plugins/code-review) | Five independent reviewers; each finding is scored from 0 to 100 and only those at 80 or more are posted. | checked, the page |
| [Towards Practical Defect-Focused Automated Code Review](https://arxiv.org/abs/2505.17928), ICML 2025 | Four parts: slicing the code for context, several roles, a filter against false alarms, and a prompt fitted to the reader. Measured on merge requests behind real fault reports, not on likeness of text. The abstract does not say how the filter works. | checked, abstract |
| Vendor accounts of second-pass verification, such as [Augment's](https://www.augmentcode.com/guides/why-use-recall-first-ai-code-review) | A second reader discards a finding for which it cannot find the evidence in the code; recall falls a little and precision rises a lot. | checked, a vendor's own numbers, not independently measured |

## What they point to

- **The instrument is weighted the wrong way round.** Nine of the twenty items of the first-written forms are behavior, which Terra finds with no instructions (0.89); three quarters of what reviews find in practice is the other kind, where the same reviewer scored 0.25 on design and 0.63 on necessity, 0.44 over the two. A rubric weighted as practice is would show that gap instead of hiding it under a 0.72; to bring the control down to the 20 to 40 percent the user asks for it also needs cases of the kinds listed below.
- **More guidance is not the lever.** The one controlled study of review checklists found no strong effect, and a harm on complex changes. What did work for human readers is reading that produces something: an abstraction of the code to hold against the specification, a perspective's own artifact. The change map and the target of draft 13 are of that kind. A sentence added to the page for the race of round 17 would be of the other.
- **Precision comes from a gate, not from a caution.** The page already says a defect needs a trigger a supported caller can produce; the reviewer agreed and reported the race. The systems that keep false findings out do it with a separate step that admits a finding only on evidence it can point to.
- **Structure can be judged by a test instead of by taste.** Each requirement is a change scenario. Walked through the units, it gives two facts that need no opinion: which scenarios meet in one unit with their lines interleaved, and which scenario is spread over many units. The first is a reason to split and the second a reason to merge; size is neither.
- **Necessity, the crutch and the dependency's contract are one question.** Who guarantees this value, and where is that written for the version that runs? A check on the side the contract does not give it to is redundant; a patch in a consumer for what a producer gets wrong belongs in the producer; where the producer is a library the project cannot change, the patch stays and the fix upstream is an idea.

## Kinds of finding the instrument does not cover

From the discussion of the round with the user. Each is a guess that a reviewer with no instructions does badly; none is measured, and a kind on which the control does well earns no words in the page.

- A fix at the symptom where the cause is elsewhere. One item today, and the control missed it.
- A requirement, or a decision taken in discussion, that rests on a technical claim the code contradicts.
- What should have changed and did not: a sibling path, a caller, leftovers of the old code.
- State with two sources of truth, or a cache that can drift.
- A surface that grows: a parameter, an export, a field of the result, a compatibility promise.
- A new dependency, or hand-written code, where the platform or the project already has it.
- Types that allow states that cannot occur, and checks written on top of them.
- Tests tied to the implementation instead of the requirement.
- Changes outside the task, and two changes in one.
- A forced workaround for a library that could be fixed in the library: an idea for upstream, with the condition under which the workaround goes.
- The reviewer's own fixes: whether each is the smallest change and at the source.
- A good change accepted as it is, with more than one kind of temptation.
- A change too large to read whole.
- What the user sees against a mockup.
