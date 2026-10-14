# AGENTS.md — postgresql-on-kubernetes-cloudnativepg

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Running production PostgreSQL on Kubernetes
with CloudNativePG and Pulumi": a 90-minute session that provisions a
self-healing, backed-up Postgres cluster on Kubernetes with Pulumi, then
triggers a failover and a point-in-time restore live. See `README.md` for the
layout and how to run the demo.

The repo carries what an attendee or a future presenter needs: the demo code
and these notes. The slide deck is a separate, later build. The presenter's
own working documents stay off this branch: `.gitignore` keeps every `*.md`
out except `README.md`, the `AGENTS.md` files and `slides/slides.md`. If you
write a new working document, it is ignored by default; that is deliberate,
do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about CloudNativePG, Pulumi Kubernetes, and AWS come from the docs
  listed under "Sources" in `README.md` and from each subfolder's own
  `AGENTS.md`. If a doc is unclear, say so in the pull request rather than
  guessing.
- Canonical names: Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console
  (lowercase console). Never "Copilot", "Pulumi Service", "Insights",
  "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(postgresql-on-kubernetes-cloudnativepg): …`,
  `docs(postgresql-on-kubernetes-cloudnativepg): …`.
- Do not commit credentials, `node_modules/`, `dist/`, Pulumi state, or
  recordings.

## Demo code

- `01-platform/` (Pulumi TypeScript, project `cnpg-workshop-platform`): a
  local `kind` cluster via `@pulumi/command`, then cert-manager, the
  CloudNativePG operator, and the Barman Cloud Plugin, each as a
  `kubernetes.helm.v4.Chart`. Read its own `AGENTS.md` before changing chart
  versions or the cluster bootstrap command — it documents the one Pulumi/
  Helm limitation this project hit (offline preview cannot validate a chart's
  `kubeVersion` floor) and how that was worked around.
- `02-cluster/` (Pulumi TypeScript, project `cnpg-workshop-cluster`): the
  three-instance CloudNativePG `Cluster` custom resource, plus, only when the
  presenter sets `backupsEnabled=true`, an S3 bucket, a least-privilege IAM
  user, and an `ObjectStore` custom resource wired into the `Cluster` via
  `spec.plugins`. Participants run this with the default
  `backupsEnabled=false` and need zero cloud credentials. Read this folder's
  own `AGENTS.md` before touching the backup half.
- `03-replication/`, `04-failover/`, `05-backup/`: scripted, no Pulumi
  project. Bash, `set -euo pipefail`, shellcheck-clean against this folder's
  `.shellcheckrc`. `04-failover/failover.sh` always calls
  `kubectl cnpg promote` — a deliberate, graceful switchover, never a
  simulated crash.
- `06-restore/` (Pulumi TypeScript, project `cnpg-workshop-restore`):
  presenter-only. Restores a new `Cluster` from the `02-cluster` backup,
  optionally to a point in time.
- `07-teardown/`: destroys `06-restore` (if deployed), then `02-cluster`,
  then `01-platform` last, since `01-platform`'s destroy is what deletes the
  kind cluster itself; `verify-clean.sh` then checks for orphaned
  `cnpg.io/cluster`-labeled PVCs.
- None of `kubectl`, `docker`, `kind`, or an AWS account were available on the
  workstation this demo was built on. Every check that needed them is named
  as unverified in the pull request rather than reported as run — rehearse
  this demo end-to-end at least once before presenting it.

## Slides (`slides/`)

Not built yet. The deck is a separate assignment that follows the demo code,
matched to it step for step.
