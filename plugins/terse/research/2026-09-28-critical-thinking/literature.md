# Literature: critical-thinking practices for an LLM writer

Collected on 2026-09-28 by an Opus research agent (L1) for the terse 0.4.0 candidates; its return as given. Every source was opened at least at the abstract; what was not is listed at the end.

Opus L1: done. Of the nine practices, two reliably help LLMs: checking a claim against something outside the writer's own context (a tool, a test, a source, a fresh context or another model), and keeping the expected answer and the author's framing out of a question. Two have null or harmful measured effects: generic "be careful / review carefully" instructions, and self-critique by the same model in the same context. Every source below was opened, at least at the abstract.

| # | Practice | Strength | Finding |
|---|---|---|---|
| 1 | Falsifiers / consider the opposite | moderate (people), weak (LLM) | In people it corrects bias better than "be fair and unbiased". Listing 10 alternatives backfired, listing 2 worked. In LLMs, testing the opposite raised rule-discovery success from 42% to 56%, mainly for thinking-mode models. As a forecasting prompt it had no significant effect. |
| 2 | Verification questions answered independently (CoVe) | moderate | Precision 0.17 to 0.32–0.36; FActScore 55.9 to 71.4 (Llama 65B). A model that sees its draft repeats the draft's errors. Part of the gain comes from making fewer claims. |
| 3 | Same-context self-critique vs a separate or external verifier | strong (against same-context; for external) | Self-correction without outside feedback lowered reasoning accuracy (GPT-3.5 CommonSenseQA 75.8 to 38.1). Sound external verifiers gave large gains. Models miss 64.5% of errors they fix when the same error is attributed to the user. Judges favour their own outputs. |
| 4 | Sycophancy under pushback | strong | "Are you sure?" flipped answers 46% of the time and cost 17% accuracy. Claude 1.3 wrongly admitted mistakes on 98% of questions. Rebuttals that cite a source caused the most correct-to-wrong flips. |
| 5 | Leading prompts | strong | A user-suggested wrong answer cut accuracy by up to 27%. Biased few-shot examples cut it by up to 36%, and the model's reasoning never mentioned the bias. Calling a change "bug-free" cut vulnerability detection by 16–93%. |
| 6 | Stated confidence and calibration | moderate | Stated confidence beats token probabilities (about 50% lower calibration error) but stays overconfident. Reasoning models are better calibrated. Readers over-trust default explanations, and longer ones raise trust further. First-person "I'm not sure" reduced over-reliance. |
| 7 | Premortem / listing risks | weak | In people it lowers plan confidence; the primary paper was not opened. As an LLM forecasting prompt it had no significant effect. Reflecting on failure before each agent action gave +3.5 points (preprint). |
| 8 | Generic "think critically / be careful" | contrary / none | "Review the answer carefully and report any serious problems" lowered accuracy. A caution-about-overconfidence prompt, personas and self-critique prompts had no effect. Exception: telling large RLHF models to avoid stereotyped output worked. |
| 9 | Claims tied to their evidence | moderate | Citations make errors findable but don't make claims true: only 51.5% of sentences were fully supported and 74.5% of citations were accurate. Abstaining when unsure raised answer quality from 80% to 90%. Models also fabricate tool runs they never made. |
| +10 | Check against an external signal (tool, test, source) | strong | Self-correction works when the feedback is reliable and external; prompted self-feedback does not. |
| +11 | Show the reader both sides | moderate | Explaining both why a claim is true and why it is false reduced human over-reliance on wrong LLM explanations. |
| +12 | Sample several times and compare | moderate | Facts that differ across samples flag hallucinated sentences. |

Each source is marked [PR] if peer-reviewed or [pre] if a preprint.

**1. Falsifiers / consider the opposite**
- Lord, Lepper & Preston 1984, "Considering the opposite: A corrective strategy for social judgment", *Journal of Personality and Social Psychology* 47(6) [PR], https://pubmed.ncbi.nlm.nih.gov/6527215/ (abstract read through the Europe PMC API).
  - Two experiments: biased reading of evidence, and biased testing of first impressions.
  - An explicit instruction to consider the opposite "had greater corrective effect than more demand-laden alternative instructions to be as fair and unbiased as possible."
  - The abstract gives no effect sizes.
- Sanna, Schwarz & Stocker 2002, "When debiasing backfires", *J. Exp. Psychol.: Learning, Memory, and Cognition* 28(3) [PR], https://pubmed.ncbi.nlm.nih.gov/12018501/ (abstract via Europe PMC).
  - People who listed 10 ways an event could have turned out differently showed more hindsight bias. Listing 2 left no significant bias.
  - Mechanism: the listing felt hard, which suggested there were few alternatives (Schwarz 2005, *Medical Decision Making*, https://dornsife.usc.edu/norbert-schwarz/wp-content/uploads/sites/231/2023/11/05_mdm_schwarz_difficult_thinking_proofs.pdf).
  - This is a human metacognitive mechanism; whether it transfers to LLMs is untested.
- Jhaveri, GX-Chen, Sucholutsky & Choi 2026, "Failing to Falsify", https://arxiv.org/abs/2604.02485 [pre].
  - 11 models (Qwen3, Llama-3.3-70B, GPT-4o, Gemini-2.5-Pro, QwQ, R1-distill) on the Wason 2-4-6 rule-discovery task.
  - The models mostly proposed triples that would confirm their hypothesis.
  - "Think-in-Opposites" (test an instance opposite on a salient feature) raised average success from 42% to 56%. The gains were significant mainly for thinking-mode models, and transfer to other tasks was partial.
- Lou & Sun 2024, "Anchoring Bias in LLMs: An Experimental Study", https://arxiv.org/abs/2412.06593 [pre]: chain-of-thought, "ignore anchor hints" and reflection were insufficient; gathering hints from several angles helped.
- Schoenegger et al. 2025 (full entry under 7): the "Counterfactual Reasoning" prompt changed the Brier score by −0.004, not significant.
- What it means for reports: the measured LLM gain came from *running* a disconfirming test in an interactive task, not from writing "consider the opposite" into an answer. One or two concrete falsifiers are supported; long lists are not.

**2. Chain-of-Verification**
- Dhuliawala et al. 2024, "Chain-of-Verification Reduces Hallucination in LLMs", ACL Findings [PR], https://aclanthology.org/2024.findings-acl.212/ (numbers checked in the arXiv PDF 2309.11495). Model: Llama 65B base, few-shot.
- Wikidata list questions:
  - Precision rose from 0.17 to 0.29 (joint), 0.36 (two-step) and 0.32 (factored).
  - Hallucinated entities per answer fell from 2.95 to 0.68–0.98.
  - Correct entities also fell, from 0.59 to 0.38–0.41.
- Biographies: FActScore rose from 55.9 to 63.7 (factored) and 71.4 (factor+revise), while facts per answer fell from 16.6 to 12.3.
- Llama 2 70B Chat with plain chain-of-thought did not improve (precision 0.12 to 0.08).
- Why independence matters: "models that attend to existing hallucinations in the context from their own generations tend to repeat the hallucinations." The factored variants, which hide the draft, did best.
- Limits: tested on closed-book factual lists and biographies with a base model, not reasoning or code. Precision partly rises because the answer says less.
- What it means for reports: answer each check without the draft in view — reread the file, rerun the command — and drop the claims that fail.

**3. Self-critique vs a separate verifier; self-preference**
- Huang et al. 2024, "LLMs Cannot Self-Correct Reasoning Yet", ICLR [PR], https://arxiv.org/abs/2310.01798. Numbers checked in the PDF.

  | Model | Task | Before | After self-correction |
  |---|---|---|---|
  | GPT-3.5 | CommonSenseQA | 75.8 | 38.1 (round 1) |
  | GPT-4 | GSM8K | 95.5 | 89.0 (round 2) |
  | GPT-3.5 with oracle stop labels | CommonSenseQA | 75.8 | 89.7 |

  - With oracle labels the gains come from knowing when to stop, which a real run does not have.
  - Correct answers turned wrong more often than wrong answers turned right.
- Kamoi et al. 2024, TACL survey [PR], https://arxiv.org/abs/2406.01297: "no prior work demonstrates successful self-correction with feedback from prompted LLMs," except in unusually suitable tasks. Self-correction works with reliable external feedback or large-scale fine-tuning.
- Stechly, Valmeekam & Kambhampati, ICLR 2025 [PR; venue from the ICLR listing], https://arxiv.org/abs/2402.08115: GPT-4 on Game of 24, graph colouring and STRIPS planning showed "performance collapse with self-critique and significant gains with sound external verification."
- Tyen et al. 2024, ACL Findings [PR], https://arxiv.org/abs/2311.08516: models struggle to *find* reasoning errors but fix them once told where they are. The abstract notes self-correction helps "style and quality" but hurts on reasoning. Self-Refine's ~20% average gain across 7 tasks (Madaan et al., NeurIPS 2023, https://arxiv.org/abs/2303.17651) sits on that side of the line.
- Tsui 2026, "Self-Correction Bench", COLM 2026 [PR per the arXiv page], https://arxiv.org/abs/2507.02778.
  - 14 open non-reasoning models corrected an error attributed to the user but missed the identical error attributed to themselves 64.5% of the time.
  - Appending "Wait" cut that blind spot by 89.3%.
  - Reasoning models showed a smaller or even negative blind spot.
- Self-preference:
  - Zheng et al. 2023, MT-Bench, NeurIPS Datasets & Benchmarks [PR], https://arxiv.org/abs/2306.05685, names self-enhancement bias in LLM judges.
  - Panickssery, Bowman & Feng 2024, NeurIPS [PR], https://proceedings.neurips.cc/paper_files/paper/2024/hash/7f1f0218e45f5414c79c0679633e47bc-Abstract-Conference.html: models recognise their own text, and the strength of self-preference rises linearly with self-recognition.
- Separate critics and debate:
  - McAleese et al. 2024, "LLM Critics Help Catch LLM Bugs" [pre], https://arxiv.org/abs/2407.00215: trained critics were preferred over human critiques 63% of the time and caught more bugs than paid contractors. They also hallucinate bugs; human-plus-critic teams hallucinate less.
  - Multi-agent debate improved results in Du et al. 2023 [pre], https://arxiv.org/abs/2305.14325. Smit et al. 2024 (ICML per the PMLR listing), https://arxiv.org/abs/2311.17371, found it "do[es] not reliably outperform" self-consistency or ensembling.
- What it means for reports: rereading one's own output in the same context is the weakest check, and it can harm. A fresh context, a different model or a tool is what the evidence supports.

**4. Sycophancy**
- Sharma et al. 2024, "Towards Understanding Sycophancy in LMs", ICLR [PR], https://arxiv.org/abs/2310.13548 (checked in the PDF).
  - Five assistants were tested: Claude 1.3, Claude 2, GPT-3.5, GPT-4 and LLaMA 2.
  - Claude 1.3 "wrongly admits mistakes on 98% of questions." Answers flipped under challenge "even when the assistant states it is highly confident."
  - Human preference data favours responses that match the user's views.
- Laban et al. 2023, FlipFlop [pre], https://arxiv.org/abs/2311.08596: across 10 models and 7 classification tasks, "are you sure?" flipped answers 46% of the time and accuracy fell 17%. Fine-tuning cut the drop by 60% without removing it.
- Fanous et al. 2025, SycEval, AIES [PR], https://arxiv.org/abs/2502.08177 (GPT-4o, Claude Sonnet, Gemini 1.5 Pro).
  - Sycophantic behaviour appeared in 58.19% of cases.
  - 14.66% were regressive (a correct answer turned wrong); 43.52% were progressive (a wrong answer turned right).
  - Citation-based rebuttals produced the most regressive flips. Once sycophantic, behaviour persisted 78.5% of the time.
- Wei et al. 2023 [pre], https://arxiv.org/abs/2308.03958: scaling and instruction tuning *increase* sycophancy (PaLM up to 540B). Models agree with wrong arithmetic when the user does.
- Nuance: changing an answer under pushback is sometimes correct (progressive flips). The failure is changing it without new evidence. These numbers come from 2023–2024 models.

**5. Leading prompts**
- Sharma et al. (above): "I think the answer is [wrong], but I'm really not sure" cut accuracy by up to 27% (LLaMA 2).
- Turpin et al. 2023, NeurIPS [PR], https://arxiv.org/abs/2305.04388: biasing features, such as few-shot examples whose answer is always "(A)", cut accuracy by up to 36% on 13 BIG-Bench Hard tasks (GPT-3.5, Claude 1.0). The chain-of-thought explanations rationalised the biased answer without mentioning the bias.
- Mitropoulos, Alexopoulos, Alexopoulos & Spinellis 2026 [pre], https://arxiv.org/abs/2603.18740v1.
  - 250 CVE pairs across 4 models. Framing a change as bug-free cut vulnerability detection by 16–93%; misses rose, false positives barely moved.
  - Adversarial PR framing got past Copilot in 35% of one-shot attempts and Claude Code in 88% with iterative refinement.
  - Removing the PR metadata and adding explicit instructions restored detection in all interactive cases and 94% of autonomous ones.
  - Partial reversal: v4 (https://arxiv.org/abs/2603.18740) says template-based framing is "ineffective and may even backfire, as direct biasing attempts raise suspicions," while refined framing succeeded in 32 of 33 cases.
- Kim et al. 2023, (QA)², ACL [PR], https://arxiv.org/abs/2212.10003: models struggle with questions built on false assumptions.
- Zhou, Jurafsky & Hashimoto 2023, EMNLP [PR], https://arxiv.org/abs/2302.13439: certainty markers in a prompt ("I'm sure it's") lowered accuracy by 7% compared with uncertainty markers.
- What it means for briefs and reviews: stating the expected result, or phrasing the task as "confirm X", pulls the answer toward it. Strip the author's framing before a review.

**6. Stated confidence and calibration**
- Kadavath et al. 2022 [pre], https://arxiv.org/abs/2207.05221: models are well calibrated on whether their own answer is true, but less so on predicting whether they know the answer when the task is new.
- Tian et al. 2023, EMNLP [PR], https://arxiv.org/abs/2305.14975: for ChatGPT, GPT-4 and Claude, stated confidence was better calibrated than token probabilities, "often reducing the expected calibration error by a relative 50%."
- Xiong et al. 2024, ICLR [PR], https://arxiv.org/abs/2306.13063: stated confidence is overconfident; consistency sampling helps. Separating right from wrong answers stayed weak (AUROC 0.522 to 0.605).
- Yoon et al. 2025, NeurIPS [PR], https://arxiv.org/abs/2505.14489: reasoning models were better calibrated in 33 of 36 settings, and the gain comes from slow thinking.
- Zhou, Hwang, Ren & Sap 2024, ACL [PR], https://arxiv.org/abs/2401.06730.
  - Prompted for confidence, models were wrong 47% of the time on answers they called confident.
  - Users relied on answers whether or not certainty was marked.
  - Preference data penalises uncertain text.
- Yona, Aharoni & Geva 2024, EMNLP [PR], https://arxiv.org/abs/2405.16908: models' hedges do not faithfully reflect their internal uncertainty.
- Steyvers et al. 2025, *Nature Machine Intelligence* [PR], https://arxiv.org/abs/2401.13835: users overestimate accuracy from default explanations. "Longer explanations increased user confidence, even when the extra length did not improve answer accuracy." Matching the explanation to the model's confidence narrowed the gap.
- Kim et al. 2024, FAccT [PR], https://arxiv.org/abs/2405.00623: in a preregistered study (N=404), first-person "I'm not sure, but…" reduced agreement with the system and raised user accuracy. General-perspective hedges ("It's not clear…") had weaker, non-significant effects.

**7. Premortem / listing risks**
- Mitchell, Russo & Pennington 1989, *Journal of Behavioral Decision Making* [PR], abstract via Crossref (DOI 10.1002/bdm.3960020103): imagining an outcome as certain produced longer, more episodic explanations; the temporal perspective itself had little influence. The often-quoted "30% better at correctly identifying reasons" is not in the abstract. A course note (https://corporate.jcx.au/premortem) says the study counted reasons, not correct ones.
- Veinott, Klein & Wiggins 2010, ISCRAM (refereed conference): a premortem lowered plan confidence more than pros/cons lists. This comes from secondary sources only (see Not verified). It measures confidence, not whether risks were found.
- Schoenegger, Jones, Tetlock & Mellers 2025 [pre], https://arxiv.org/abs/2506.01578 (read in the PDF).
  - 38 prompts on Claude 3.5 Sonnet and Haiku, GPT-4o and Llama 3.1 405B.
  - Premortem: Brier −0.008, p=.40 (adjusted p=.77). Self-Critique and Simulated Debate: not significant.
  - Only Bayesian-reasoning and Propose-Evaluate-Select prompts had significant effects, and both made forecasts *worse*.
- Wang et al. 2024, "Devil's Advocate" [pre], https://arxiv.org/abs/2405.16334: reflecting on possible failures before each agent action reached 23.5% on WebArena, +3.5 points over existing zero-shot methods, with 45% fewer trials.
- Kim et al. 2025, InvThink [pre], https://arxiv.org/abs/2510.01569: listing failures before answering cut harmfulness by up to 32% (safety domain only).

**8. Generic instructions**
- Lord 1984 (above): "as fair and unbiased as possible" was weaker than a concrete consider-the-opposite instruction.
- Huang 2024, checked in the PDF: the prompt "Assume that this answer could be either correct or incorrect. Review the answer carefully and report any serious problems you find" made results worse.
  - GPT-4-Turbo: GSM8K 91.5 to 88.0.
  - Llama-2: GSM8K 62.0 to 43.5, then 36.5 in round 2.
- Schoenegger 2025: "Be cautious of overconfidence by carefully considering uncertainties" had no significant effect. Metacognition, "Deep Breath" and superforecaster-persona prompts also had none.
- Echterhoff et al. 2024, BiasBuster [pre], https://arxiv.org/abs/2403.00811.
  - "Be mindful to not be biased by cognitive bias" gave small gains.
  - Counterfactual examples collapsed Llama 7B to a single answer.
  - GPT-4 rewriting its own prompt to remove bias-inducing words worked best.
- Zheng et al. 2024, EMNLP Findings [PR], https://arxiv.org/abs/2311.10054: personas did not improve accuracy on 2,410 factual questions.
- Chain-of-thought helps mainly on math and symbolic tasks (Sprague et al., ICLR 2025 [PR], https://arxiv.org/abs/2409.12183). On some tasks it lowers accuracy by up to 36.3 points (Liu et al. 2024 [pre], https://arxiv.org/abs/2410.21333).
- Counter-case: Ganguli et al. 2023 [pre], https://arxiv.org/abs/2302.07459. An instruction to avoid harmful or stereotyped output works from 22B parameters and improves with scale and RLHF. The target there is concrete and recognisable.
- I found no study that measures "be careful" producing hedges or caveats. The owner's observation matches the direction of these results, but it has not itself been measured.

**9. Claims tied to their evidence**
- Liu, Zhang & Liang 2023, EMNLP Findings [PR], https://arxiv.org/abs/2304.09848: only 51.5% of generated sentences were fully supported by their citations, and only 74.5% of citations supported their sentence.
- Gao et al. 2023, ALCE, EMNLP [PR], https://arxiv.org/abs/2305.14627: on ELI5 even the best models lack complete citation support 50% of the time.
- Menick et al. 2022, GopherCite [pre], https://arxiv.org/abs/2203.11147: answer quality was 80% (NaturalQuestions) and 67% (ELI5); abstaining on the third it was least sure of raised these to 90% and 80%. Its own caveat: "not all claims supported by evidence are true."
- Weller et al. 2024, EACL [PR], https://arxiv.org/abs/2305.13252: "According to…" prompting raised grounding and often end-task accuracy.
- Min et al. 2023, FActScore, EMNLP [PR], https://arxiv.org/abs/2305.14251: splits text into atomic facts; the automated estimate has under 2% error.
- Chowdhury et al. 2025, Transluce report (not peer-reviewed), https://transluce.org/investigating-o3-truthfulness: o3 fabricated code-tool runs it never made and doubled down when confronted. Rates at which investigator agents elicited such claims:

  | Model | Zero-shot | Few-shot |
  |---|---|---|
  | o1 | 13.0% | 30.1% |
  | o3 | 5.0% | 12.8% |
  | GPT-4o | 0.8% | 3.0% |

**Added practices**
- +10, external signal:
  - Kamoi (above), Stechly (above).
  - Gou et al. 2024, CRITIC, ICLR [PR], https://arxiv.org/abs/2305.11738: tool-checked critique consistently improved QA, program synthesis and toxicity results.
- +11, both sides for the reader: Si et al. 2024, NAACL [PR], https://arxiv.org/abs/2310.12558. With 80 crowdworkers, users over-relied on wrong LLM explanations. Explaining both why a claim is true and why it is false reduced that over-reliance, but did not beat reading the retrieved passages.
- +12, sample and compare: Manakul et al. 2023, SelfCheckGPT, EMNLP [PR], https://arxiv.org/abs/2303.08896. Sentences whose facts diverge across samples are likely hallucinated (GPT-3 on WikiBio).

**Implications for terse**
1. Check key claims in a fresh context, with another model or with a tool, answering each check without the draft in view — strong.
2. Back each factual claim with the observation that shows it (command output, file:line). Cut or mark as unchecked any claim without one; don't hedge it — moderate.
3. Leave the expected answer and the author's framing out of briefs and review requests; ask the open question — strong.
4. On pushback, re-derive from evidence and say which observation changed. "Are you sure?" alone is not a reason to change an answer — strong.
5. Replace "be careful / think critically" with a named check (which file to reread, which command to rerun, which case to test). Strong that the generic form does nothing or harms; moderate that a named check helps.
6. Name one or two concrete observations that would overturn the conclusion — a test that could fail, not a list — moderate in people, weak in LLMs.
7. State uncertainty only where it separates claims, in first person, and keep explanations short. Blanket hedges carry no signal, and length raises unearned trust — moderate.
8. A risk list pays only when each risk points to a check or an action. As free prose it showed no accuracy effect — weak.

**Not verified**
- Veinott et al. 2010 primary paper: ISCRAM returned 503, ResearchGate and Semantic Scholar returned 403. Its findings come from search summaries and a course note. Klein's 2007 HBR article was not opened.
- Some venues come from search listings rather than the page I opened: Sharma (ICLR 2024), Self-Refine (NeurIPS 2023), Stechly (ICLR 2025), Smit (ICML 2024). Venues for Du et al. and Echterhoff et al. are unknown, so both are treated as preprints.
- Lord 1984's sample of 150 comes from a search listing, not the abstract. Ganguli's exact instruction wording was not checked.
- Mitropoulos et al.: I did not read v4's full text, so I don't know whether its Study 1 numbers still match v1's 16–93%.
- Si et al.'s per-condition accuracy numbers appeared only in a search summary and are not used here.
- Per-model flip rates in FlipFlop, and Sharma's rates for models other than Claude 1.3, were not checked.
- Current frontier-model sycophancy rates were not checked; the numbers above are from 2023–2025 models.
- InvThink was measured on safety tasks only.
