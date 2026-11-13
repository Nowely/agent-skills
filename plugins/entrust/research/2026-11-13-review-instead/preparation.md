# Next-round preparation

Preparation only; no reviewer, implementer or judge has run.

- Six isolated reviewer packets are ready. Each contains identical task/source bytes, a matching complete skill package and its own empty output directory. Neutral prompts differ only in run-local paths.
- Baseline package: `entrust@0.37.0`, commit `325394a3a8871f8f2a50c9709082348c60a96440`. Candidate package: commit `9ee0189c365024519bae92649610aada25d4cd21`. The candidate entrypoint and contract match frozen drafts 24 and 25 respectively. Later protocol-only edits do not change these packages.
- The original reviewed diff is byte-identical to the earlier flawed snapshot. Context is richer: the exact pinned dependency artifact was retrieved and its integrity verified; relevant compiled/generated files and their package-internal relative-import closure were supplied. Previously omitted field wrappers and their lifecycle hook were also added from the original checkout. No installation scripts ran.
- The versions of the supplied core dependencies match their lockfile entries. A previously reconstructed patched dependency is still identified as reconstructed. This remains a bounded source packet, not a verified historical full installation.
- All six source trees, tasks and complete arm packages were compared by SHA-256. The task and source are equal across arms; the original historical input remains unchanged.
- An isolated synthetic preparation fixture confirms that the baseline checker accepts a legacy mechanism record, the candidate rejects a missing `instead`, and the candidate accepts a cited `instead`. Validation leaves the JSON unchanged and creates no HTML. No application, dependency or test execution was performed on the private project.
- Implementation and independent-judge prompt templates, assessment criteria, output schema and anonymized result-ID mapping are prepared. Future results have not been fabricated or prefilled.
- Review/implementation model: Terra, requested xhigh. The owner selected Carbon and GLM as independent judges, replacing Astra; Kimi is not part of this round. Exact external routes and their current availability are recorded privately before launch. Catalogue presence is not proof of a successful model call.

Private manifests, source packages and raw artifacts stay local. The PR's single progress comment carries methodology, preparation status and, once authorized and executed, results. This preparation does not resolve schema compatibility for a future release or claim that draft 25 is better.
