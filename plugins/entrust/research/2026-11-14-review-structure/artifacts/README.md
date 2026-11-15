# Synthetic research artifacts

This directory contains the public, synthetic parts of the review-structure research:

- [Four-arm skill snapshots and cases](four-arm/), with the original synthetic case histories.
- [Synthetic reviewer reports and selected assessments](reports/), including earlier rounds.

The real case, its raw reports and session logs are excluded. Each package documents its source,
transformations, available checks and reconstruction limits. Published artifacts are research records,
not an installed skill or proof that an LLM will reproduce the same answers.

`SHA256SUMS` lists the SHA-256 of every other published file under this directory, including the Git
bundles and package-specific manifests. Run `shasum -a 256 -c SHA256SUMS` from this directory. Hashes
identify the published bytes; they do not prove that the content is correct or that no sensitive
information is present.
