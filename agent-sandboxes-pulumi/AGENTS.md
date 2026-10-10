# AGENTS.md: agent-sandboxes-pulumi

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

The material for the workshop "Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per
Task": a Python demo (Automation API, Pulumi ESC, IAM boundary, Pulumi Policies, reaper) and a deck.
See `README.md` for the layout and how to run the demo.

Working documents (runbook, rehearsal checklist, open questions) stay on the presenter's machine.
`.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files and `slides/slides.md`.
A new working document is ignored by default; do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders.
- Facts about Pulumi products come from the docs listed under "Sources" in `README.md`.
- Canonical names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi Policies, Pulumi console.
  Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits scoped to the folder: `feat(agent-sandboxes-pulumi): ...`.
- Never commit credentials, `.venv/`, `.state/`, stack config files or recordings.
- Every command on a slide is one the demo runs, with the same flags.
- Scripts must pass `shellcheck` with this folder's `.shellcheckrc`.
- Versions are pinned in `requirements.txt`; change them in one place and re-run the checks.
