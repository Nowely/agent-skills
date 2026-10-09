# The prompt for the owner's machine

Measurements E–H need the owner's `opencode` and `codex`, and H a Mac. The owner pastes the prompt below into a
coding agent on that machine (Claude Code, Codex or OpenCode), or runs its commands by hand, and sends back what the
scripts print. Cost: two short OpenCode turns on the first recent model and two short Codex turns on the default
model; E1 makes no model call.

```text
Run two measurement scripts of the entrust plugin on this machine and report what they print. Change no file in
the repository and run nothing beyond the commands below.

1. In a checkout of github.com/Nowely/agent-skills (clone it if there is none), run:
   git checkout main && git pull
2. Run `opencode --version` and `codex --version`. If one is missing, skip its script below and say so.
3. Run, from the repository root (about two minutes, two short OpenCode turns):
   node plugins/entrust/research/2026-10-09-step5-measurements/04-opencode-probe.mjs
4. Run, from the repository root (a few minutes, two short Codex turns):
   node plugins/entrust/research/2026-10-09-step5-measurements/05-codex-probe.mjs
5. Each script prints one JSON object. Reply with both, whole and as printed, each in its own code block, and
   nothing else, after replacing every occurrence of your home directory with ~ and of your user name with <user>.
```

What each part settles is in `00-brief.md`; what the scripts do is in their headers. Both write only inside a
fresh directory under the system temporary directory, and decline every request the agent makes, so nothing an
agent asks for runs outside its sandbox.
