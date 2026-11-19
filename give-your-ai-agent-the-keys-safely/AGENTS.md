# AGENTS.md — give-your-ai-agent-the-keys-safely

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Give your AI agent the keys, safely: building
and governing MCP-based infrastructure agents." No date, speaker, or event
has been assigned yet. This run of the pipeline built the demo code only;
the slide deck is a separate, later assignment on this same branch. See
`README.md` for the layout and how to run the demo.

The repo carries what an attendee or a future presenter needs: the demo code
and these notes. Presenter-only working documents (a runbook, a rehearsal
checklist, a fact-check log, open questions) stay off this branch;
`.gitignore` keeps every `*.md` out except `README.md` and the `AGENTS.md`
files. If you write a new working document, it is ignored by default; that
is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi Neo, Pulumi ESC, Pulumi Cloud, and the MCP specification
  come from the docs listed under "Sources" in `README.md`, read directly
  rather than recalled. If a doc is unclear or a product surface is still
  changing (both Neo Security and `@pulumi/mcp-server` were, as of this
  build), say so in the PR description as an open question instead of
  guessing.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi console (lowercase console). Never "Copilot", "Pulumi Service",
  "Insights", or "CrossGuard" as a product name.
- Conventional Commits, scoped to this folder, e.g.
  `feat(give-your-ai-agent-the-keys-safely): …`,
  `docs(give-your-ai-agent-the-keys-safely): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `.pulumi/`, state
  files, or recordings.

## Demo code

- `01-base-stack/`: Pulumi TypeScript, pinned to `@pulumi/pulumi@^3.263.0`
  and `@pulumi/aws@^7.48.0`. `npx tsc --noEmit` must pass, both as committed
  and after `04-propose-change/proposed.diff` is applied to it; this build
  checked both. Uses `aws.s3.Bucket`, not the deprecated `aws.s3.BucketV2`.
- `02-mcp-server/`, `03-scoped-access/`: plain Node.js (`.mjs`, no build
  step), run directly with `node`. `probe.mjs` is a minimal scriptable MCP
  client over stdio: `initialize` → `notifications/initialized` →
  `tools/list`, with an optional `tools/call`. It is used both for the
  workshop's own verification step (step 2 of the demo) and by this repo's own checks.
  It takes no dependencies beyond Node's built-ins.
- `03-scoped-access/guard.mjs`'s `ALLOW_LIST` is an inclusion list, not an
  exclusion list. Before changing it, re-run
  `node 02-mcp-server/probe.mjs -- npx -y @pulumi/mcp-server@0.2.0 stdio`
  and compare against the tool names in `03-scoped-access/AGENTS.md`: the
  live server has added tools since this build's first static read of the
  package, and it may add more. Read `03-scoped-access/AGENTS.md` in full
  before touching this file.
- `06-blocked-apply/try-apply.sh`, `07-approve-and-apply/approve-and-apply.sh`,
  `08-teardown/destroy.sh`: bash, shellcheck-clean against this folder's
  `.shellcheckrc`. None was run against real AWS or Pulumi Cloud in this
  build; this workstation has neither credential. Say so in any future
  update rather than implying a live run happened.
- `04-propose-change/AGENT-SESSION.md` is a narrated walkthrough, not a
  captured transcript. Running it for real needs a live MCP client (Claude
  Desktop or equivalent) connected to `03-scoped-access/guard.mjs`, plus AWS
  credentials for `01-base-stack`. Do not rewrite it to imply a live session
  happened until one actually has.
