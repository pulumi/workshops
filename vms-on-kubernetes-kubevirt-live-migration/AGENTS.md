# AGENTS.md — vms-on-kubernetes-kubevirt-live-migration

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "VMs on Kubernetes as Code: Provisioning and
Live-Migrating a KubeVirt VM with Pulumi" (not yet scheduled; see `README.md`
for the six demand signals that put this in the build queue). Demo code
first, slides follow on this same branch once the demo is verified.

The repo carries what an attendee or a future presenter needs: the deck, the
demo code, and these notes. Presenter-only working documents (a rehearsal
runbook, an open-questions log) stay on the presenter's machine; `.gitignore`
keeps every `*.md` out except `README.md`, the `AGENTS.md` files and
`slides/slides.md`. If you write a new working document, it is ignored by
default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about KubeVirt and Pulumi come from the docs listed under "Sources"
  in `README.md`, read during the run that built this folder. Product docs
  move faster than memory. If a doc is unclear, say so in the pull request
  as an open question rather than guessing.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi console (lowercase console). Never "Copilot", "Pulumi Service",
  "Insights", "CrossGuard". This workshop uses none of Neo/ESC directly, but
  the naming rule still applies wherever Pulumi is mentioned.
- Conventional Commits, scoped to this folder, e.g.
  `feat(vms-on-kubernetes-kubevirt-live-migration): …`,
  `docs(vms-on-kubernetes-kubevirt-live-migration): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `/bin/`, `.state/`,
  kubeconfig files, or recordings.
- Every command shown on a slide must be a command the demo code actually
  runs, with the same flags. Build the demo before the deck.

## Demo code

- Local `kind` cluster only. No cloud account, no cloud credentials, `$0`
  cost. This is deliberate and consistent with the other Kubernetes demos in
  this repository.
- `01-preflight/`, `05-console/`, `06-live-migration/`, `07-teardown/`:
  host-side bash, shellcheck clean against this folder's `.shellcheckrc`.
  Each script starts with a usage comment and sources the shared
  `01-preflight/lib.sh` helpers (`say`, `die`, `have`) via
  `# shellcheck source=../01-preflight/lib.sh`.
- `02-cluster/`: Pulumi TypeScript using `@pulumi/command`'s `local.Command`
  to shell out to `kind create cluster` / `kind delete cluster`, keyed by a
  `triggers` hash of `kind.yaml`. `npx tsc --noEmit` must pass.
- `03-kubevirt/`: Pulumi TypeScript using `@pulumi/kubernetes`. See
  `03-kubevirt/AGENTS.md` for the no-official-Helm-chart decision and the
  exact verification command for operator readiness. `npx tsc --noEmit` must
  pass.
- `04-vm/`: Pulumi TypeScript using `@pulumi/kubernetes`. See `04-vm/AGENTS.md`
  for the containerDisk-not-DataVolume decision and the RWX/live-migration
  rule it is built around. `npx tsc --noEmit` must pass.
- Version pins are load-bearing, not decorative: KubeVirt v1.9.0, kind
  v0.33.0, `virtctl` v1.9.0 matching KubeVirt exactly. If you bump one, bump
  the matching one and update every place it is written (README table,
  `Pulumi.yaml` descriptions, script comments).
- The build workstation for this repo has no `docker`, `kind`, `kubectl`, or
  `virtctl`, and no root to install them. Never claim a live cluster,
  install, VM boot, console session, migration, or `pulumi destroy` against
  real infrastructure was run unless it actually was; say explicitly in the
  pull request which steps could only be verified offline (TypeScript
  compiles, shellcheck, rendered Kubernetes manifests via
  `renderYamlToDirectory`) and which need a real run before the workshop.
