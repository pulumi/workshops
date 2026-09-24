# AGENTS.md — iac-ai-agents-keys-safely

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for "Give your AI agent the keys, safely" — no event date yet
(see `README.md`, "No date yet"). A demo where an agent proposes an
infrastructure change through an MCP server with propose-only permissions,
a human reviews the diff, and only the human's own credentials can apply
it. See `README.md` for the layout and how to run the eight numbered
steps.

The repo carries what an attendee or a future presenter needs: the demo
code, these notes, and eventually the deck. Presenter working documents
(runbooks, rehearsal notes, fact-check logs, open questions beyond what is
in `README.md`) stay off this branch; `.gitignore` keeps every `*.md` out
except `README.md`, the `AGENTS.md` files and `slides/slides.md`. If you
write a new working document, it is ignored by default — do not force-add
it.

## Rules

- Stay inside this folder. Never modify another workshop's folder in this
  repo.
- Facts about Pulumi products (MCP server, RBAC, access tokens, audit
  logs, pricing tiers, Neo) come from pulumi.com/docs, read during the run
  that touched them, never from memory. If a doc is unclear or silent, put
  the question in the PR description as an open question — do not guess.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi
  IaC, Pulumi console (lowercase console). Never "Copilot", "Pulumi
  Service", "Insights", "CrossGuard" as a product name.
- Every `pulumi.com` link in a file this folder's authors write carries
  `?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops`, except
  `app.pulumi.com/new?template=` links and image links. The repo's
  `scripts/lint.sh` only warns about this; treat the warning as binding.
- Conventional Commits, scoped to this folder, e.g.
  `feat(iac-ai-agents-keys-safely): …`, `docs(iac-ai-agents-keys-safely): …`.
- Do not commit credentials, `node_modules/`, `bin/`, `.state/`, `.scratch/`,
  recordings, or any presenter working document.

## Demo code

- `01-base-stack/`: Pulumi TypeScript, `us-east-1`. `npx tsc --noEmit` must
  pass. Keep `protect: true` on the artifact bucket; never add it to a
  resource created in a later step — teardown depends on that boundary.
  AWS credentials come from the environment, never from a file in this
  folder.
- `02-mcp-server/`: never hardcode the MCP server's tool list in a script
  or on a slide. `tools-list.sh` prints the live manifest from a real
  JSON-RPC round trip; if the published `@pulumi/mcp-server` package
  changes, that script's output changes with it and stays true. This
  workstation has no `jq` — `mcp-client.js` (Node) is the JSON-RPC client;
  do not introduce a `jq` dependency.
- `03-agent-client/`: the agent's token must be scoped to Stack Read, never
  Stack Write, on `01-base-stack`. `verify-scope.sh` checks read access
  only; it must never attempt an apply — that is `06-blocked-apply`'s job.
- `04-propose-change/`: `logs-bucket.patch` must `git apply --check`
  cleanly against `01-base-stack/index.ts` and the result must pass
  `npx tsc --noEmit`, verified each time either file changes.
  `propose.sh` only previews, on a scratch copy; it must never run
  `pulumi up`.
- `05-review-diff/`: keep the two checks (traces to the ask; widens a
  permission or access surface) honest and simple — a script is a first
  pass, not a substitute for the group discussion in `README.md`.
- `06-blocked-apply/`: `try-apply.sh` is meant to fail; a non-zero exit
  from `pulumi up` is this script's success. Do not "fix" that.
- `07-approve-and-apply/`, `08-teardown/`: the only two folders that touch
  real AWS resources. Both need a human running `pulumi up` /
  `pulumi destroy` themselves with a Stack-Write token; the scripts here
  prepare state and print the command, they do not run it.
- Shell scripts anywhere in this folder: shellcheck clean against this
  folder's `.shellcheckrc`, and `#!/usr/bin/env bash` with `set -euo
  pipefail` (or the deliberate `set -uo pipefail` in `try-apply.sh`, which
  must survive a non-zero exit by design).

## Slides (`slides/`)

Not yet built. When they are, this section should point at
`slides/AGENTS.md` for the deck's brief, sources and slide rules, the same
way the reference workshop does.
