# AGENTS.md — defense-in-depth-kyverno-pulumi-policies

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Defense in depth as code: Kyverno admission
control and Pulumi Policies" (no session scheduled yet; see the pull request
description). Demo code plus, in a later pull request on the same branch, a
Slidev deck. See `README.md` for the layout and how to run the demo end to
end.

The repo carries what an attendee or a future presenter needs: the demo code,
the deck once it exists, and these notes. Presenter working documents (a
runbook, a rehearsal checklist, an open-questions log) stay off the branch;
`.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files
and `slides/slides.md`. If you write a new working document, it is ignored by
default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Kyverno, Pulumi Kubernetes and Pulumi Policies come from the
  docs listed under "Sources" in `README.md`. If a doc is unclear, say so in
  the pull request rather than guessing.
- Canonical names: Pulumi Policies (never "CrossGuard"), Pulumi Cloud, Pulumi
  IaC, Pulumi console (lowercase console). Kyverno and Pulumi are both
  third-party/own product names used as-is; do not rename `ClusterPolicy`,
  `kind`, or `kubectl`.
- Conventional Commits, scoped to this folder, e.g.
  `feat(defense-in-depth-kyverno-pulumi-policies): …`,
  `docs(defense-in-depth-kyverno-pulumi-policies): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `bin/`, or recordings.

## Demo code

- No cloud account and no cloud spend: everything runs against a local
  `kind` cluster. Estimated cost is $0.00.
- `01-cluster/`: presenter setup, not live demo. Creates the `kind` cluster
  before the session.
- `02-kyverno/`, `03-cluster-policy/`, `05-pipeline-policy/workload/`: Pulumi
  TypeScript projects, each its own stack. `npx tsc --noEmit` must pass in
  each. `pulumi preview` before `pulumi up`, always.
- `05-pipeline-policy/policy-pack/`: the Pulumi Policies pack. `npx tsc
  --noEmit` must pass and `npx tsc && node bin/test/rules-test.js` must
  report `failed=0`. The rule lives in `rules.ts` as a plain function so it
  can be unit-tested without Pulumi Cloud.
- `04-admission-denied/`: a plain Kubernetes manifest and a `kubectl`
  script, deliberately outside any Pulumi program, applied live.
- `teardown.sh`: destroys the three Pulumi stacks, then deletes the `kind`
  cluster. Run it at the end of every rehearsal and every real session.
- Chart and package versions are pinned exactly (never "latest") in each
  project's `package.json`/`index.ts`; see README "## Sources" for where each
  pin was confirmed and when.

## Slides (`slides/`)

Not yet built. A follow-up pull request on this branch adds `slides/` with
the deck; this AGENTS.md will be extended with its own rules once that
exists, following the pattern in
[`neo-in-a-docker-sandbox/slides/AGENTS.md`](../neo-in-a-docker-sandbox/slides/AGENTS.md).
