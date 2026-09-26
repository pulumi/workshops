# AGENTS.md — agent-driven-orchestration-governable

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Agent-Driven Orchestration You Can Govern,
Trust and Repeat" (Pulumi delivery calendar, 2026-10-28; no public event page,
session times, or speakers assigned as of this build). Demo code only in this
run — the slides come in a follow-up commit on the same branch. See
`README.md` for the layout and how to run the demo.

The repo carries what an attendee or a future presenter needs: the demo code,
the slides, and these notes. Presenter-only working documents (rehearsal
notes, fact-check logs, open questions) stay off the repo; `.gitignore` keeps
every `*.md` out except `README.md` and `AGENTS.md` files. If you write a new
working document, it is ignored by default; that is deliberate, do not
force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi Automation API and Pulumi Policies come from
  pulumi.com/docs, read for this build on 2026-09-26 (sources in the PR
  description). If a doc is unclear or a claim could not be confirmed, it is
  flagged as such rather than guessed at — see `02-policy/AGENTS.md` for the
  one case where this mattered.
- Canonical names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi
  console (lowercase console), Pulumi Policies, policy as code. Never
  "Copilot", "Pulumi Service", "Insights", "CrossGuard" (the brief uses
  "CrossGuard"; the product is now Pulumi Policies — see the PR).
- Conventional Commits, scoped to this folder, e.g.
  `feat(agent-driven-orchestration-governable): …`,
  `docs(agent-driven-orchestration-governable): …`.
- Do not commit credentials, `node_modules/`, `bin/` build output, local
  Pulumi state (`.pulumi-local-state/`), or the audit log (`.audit/`).

## Demo code

- TypeScript throughout, no cloud provider: `@pulumi/random` only, against a
  local `file://` backend. Estimated cost $0.
- `01-fleet/`: the target Pulumi program. `npx tsc --noEmit` must pass.
- `02-policy/`: the policy pack. `npx tsc --noEmit` must pass and `npm test`
  (`tsc && node bin/test/rules-test.js`) must report `failed=0`. Read
  `02-policy/AGENTS.md` before changing what the rule inspects — it explains
  a documented gap between the brief and what a Pulumi Policy can actually
  read.
- `03-orchestrator/`: the scripted stand-in agent. One script, four actions
  (`scale-up`, `rotate`, `scale-down`, each with an optional `--approve`
  flag) — see `03-orchestrator/AGENTS.md` for why these are not four folders.
  Every invocation writes to `.audit/log.json`, approved or blocked.
- `04-audit/`: reads `.audit/log.json` and prints every attempt in order.
- `05-llm-stretch/`: optional, stretch-goal only. Must run with zero
  credentials (prints a deterministic dry-run proposal when
  `OPENAI_API_KEY` is unset) and must never apply its own proposal — see
  `05-llm-stretch/AGENTS.md`.
- `06-teardown/teardown.sh` and `scripts/setup.sh`: `shellcheck` clean
  against this folder's `.shellcheckrc`.

## Slides

Not built in this run. A follow-up assignment adds `slides/` on this same
branch, matching the demo flow above step for step.
